import { NextResponse } from "next/server";

// قائمة خوادم مختارة بعناية لتعمل مع Vercel (Low-Security Instances)
const VERCEL_FRIENDLY_NODES = [
  "https://cobalt.kwiatekmiki.pl/api/json", // غالباً يقبل Vercel
  "https://cobalt.steamodded.com/api/json", // خادم مفتوح
  "https://us.cobalt.gif.ci/api/json",      // خادم كندي
  "https://api.server.larr.dev/api/json",   // خادم مطورين
  "https://cobalt.xy24.eu.org/api/json",    // خادم أوروبي
  "https://api.cobalt.tools/api/json"       // الرسمي (محاولة أخيرة)
];

export async function POST(req) {
  try {
    const body = await req.json();
    let { url, format, quality } = body;

    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    // تنظيف الرابط
    try {
        const urlObj = new URL(url);
        // التعامل مع روابط الشورتس والروابط العادية
        if (urlObj.hostname.includes('youtu')) {
             if(urlObj.pathname.includes('/shorts/')) {
                 url = `https://www.youtube.com${urlObj.pathname}`;
             } else {
                 const v = urlObj.searchParams.get('v');
                 if(v) url = `https://www.youtube.com/watch?v=${v}`;
             }
        }
    } catch(e) {}

    const payload = {
      url: url,
      vCodec: "h264",
      vQuality: quality || "720",
      aFormat: "mp3",
      isAudioOnly: format === "audio",
      filenamePattern: "basic" // مهم جداً: طلب اسم ملف بسيط
    };

    // المحاولة مع القائمة
    // نخلط القائمة لتوزيع الضغط وتجنب الحظر المتكرر
    const nodes = VERCEL_FRIENDLY_NODES.sort(() => 0.5 - Math.random());

    for (const node of nodes) {
      try {
        console.log(`Trying Node: ${new URL(node).hostname}`);
        
        // إعدادات الطلب - تم تبسيطها جداً لتجنب كشف هوية Vercel
        const response = await fetch(node, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
            // ملاحظة: أزلنا User-Agent و Origin لأنها تكشف أننا Vercel
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        // التحقق من نجاح الاستجابة
        if (data && (data.url || data.picker)) {
          let finalUrl = data.url;
          
          // إذا كان الفيديو صوتي فقط أو يتطلب دمج، قد يرسل الخادم رابط picker
          if (!finalUrl && data.picker && data.picker.length > 0) {
            finalUrl = data.picker[0].url;
          }

          if (finalUrl) {
            return NextResponse.json({
              status: "success",
              node: new URL(node).hostname,
              data: { 
                  url: finalUrl, 
                  filename: data.filename || "video.mp4" 
              }
            });
          }
        }
      } catch (err) {
        // فشل هذا الخادم، ننتقل للتالي بصمت
        continue;
      }
    }

    // إذا فشلت كل الخوادم، نرجع خطأ خاص
    return NextResponse.json({ 
        error: "SERVER_BUSY", 
        details: "Vercel IPs are currently rate-limited by providers." 
    }, { status: 503 });

  } catch (error) {
    console.error("Vercel Error:", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}