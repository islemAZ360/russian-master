import { NextResponse } from "next/server";

// قائمة العقد (Nodes) - تم تحديثها بخوادم تعمل حالياً
const SWARM_NODES = [
  "https://co.wuk.sh/api/json",
  "https://api.cobalt.tools/api/json",
  "https://cobalt.kwiatekmiki.pl/api/json",
  "https://cobalt.steamodded.com/api/json",
  "https://us.cobalt.gif.ci/api/json"
];

// رؤوس التخفي (Stealth Headers) لخداع الخوادم بأننا متصفح حقيقي
const STEALTH_HEADERS = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Origin": "https://cobalt.tools", // خدعة: ندعي أننا قادمون من الموقع الرسمي
  "Referer": "https://cobalt.tools/"
};

export async function POST(req) {
  try {
    const body = await req.json();
    let { url, format, quality } = body;

    if (!url) {
      return NextResponse.json({ error: "MISSING_URL_PACKET" }, { status: 400 });
    }

    // 1. تنظيف الرابط
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
             // إزالة si وأي بارامترات تتبع
             const v = urlObj.searchParams.get('v');
             if(v) url = `https://www.youtube.com/watch?v=${v}`;
             else if(urlObj.pathname.includes('/shorts/')) url = `https://www.youtube.com${urlObj.pathname}`;
        }
    } catch(e) {}

    const payload = {
      url: url,
      vCodec: "h264",
      vQuality: quality || "720",
      aFormat: "mp3",
      isAudioOnly: format === "audio",
      filenamePattern: "basic"
    };

    let lastError = null;
    
    // خلط ترتيب الخوادم عشوائياً في كل طلب لتوزيع الحمل (Load Balancing)
    const shuffledNodes = SWARM_NODES.sort(() => 0.5 - Math.random());

    // 2. بدء بروتوكول السرب (Swarm Protocol)
    for (const node of shuffledNodes) {
      try {
        console.log(`[SERVER] Pinging Node: ${node}...`);
        
        // مهلة 10 ثواني لكل خادم
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(node, {
          method: "POST",
          headers: STEALTH_HEADERS,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        // التحقق من صحة الاستجابة
        if (data && (data.url || data.picker || data.status === "stream" || data.status === "success")) {
          
          let finalUrl = data.url;
          if (!finalUrl && data.picker && data.picker.length > 0) {
            finalUrl = data.picker[0].url;
          }

          if (finalUrl) {
            // نجاح! نعيد النتيجة للواجهة
            return NextResponse.json({
              status: "success",
              node: new URL(node).hostname, // نرسل اسم الخادم الذي نجح
              data: {
                  url: finalUrl,
                  filename: data.filename || "media_file"
              }
            });
          }
        }
      } catch (err) {
        console.error(`[SERVER] Node Failed: ${node}`, err.message);
        lastError = err.message;
        // نستمر للخادم التالي في الحلقة
      }
    }

    // إذا وصلنا هنا، يعني كل الخوادم فشلت
    return NextResponse.json({ 
        error: "ALL_NODES_BUSY", 
        details: "Server-side swarm exhausted all options." 
    }, { status: 503 });

  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SYSTEM_FAILURE" }, { status: 500 });
  }
}