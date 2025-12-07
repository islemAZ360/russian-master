import { NextResponse } from "next/server";

// 1. قائمة خوادم ضخمة (Massive Node List)
// تم اختيار هذه الخوادم لأنها تقبل الطلبات من مصادر خارجية (API Friendly)
const SWARM_NODES = [
  "https://cobalt.meowing.de/api/json",
  "https://co.wuk.sh/api/json",
  "https://api.cobalt.tools/api/json",
  "https://cobalt.kwiatekmiki.pl/api/json",
  "https://cobalt.steamodded.com/api/json",
  "https://us.cobalt.gif.ci/api/json",
  "https://api.server.larr.dev/api/json",
  "https://cobalt.xy24.eu.org/api/json"
];

// قائمة بصمات المتصفح (لتجنب الحظر)
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
];

export async function POST(req) {
  try {
    const body = await req.json();
    let { url, format, quality } = body;

    if (!url) return NextResponse.json({ error: "No Target Detected" }, { status: 400 });

    // تنظيف الرابط (إزالة التتبع)
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtu')) {
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

    // خلط الخوادم عشوائياً في كل مرة
    const shuffledNodes = SWARM_NODES.sort(() => 0.5 - Math.random());
    let lastError = "";

    // بدء الهجوم (Attack Sequence)
    for (const node of shuffledNodes) {
      try {
        console.log(`[SWARM] Connecting to: ${new URL(node).hostname}...`);
        
        // اختيار بصمة عشوائية
        const randomAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

        // إعدادات الطلب (نظيفة جداً بدون Origin مزيف)
        const response = await fetch(node, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": randomAgent 
            // حذفنا Origin و Referer لأنها كانت تفضح السيرفر
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        // التحقق الدقيق من النجاح
        if (data && (data.url || data.picker || data.status === "stream" || data.status === "success")) {
          
          let finalUrl = data.url;
          // معالجة الـ Picker (إذا أعطانا قائمة جودات)
          if (!finalUrl && data.picker && data.picker.length > 0) {
            finalUrl = data.picker[0].url;
          }

          if (finalUrl) {
            console.log(`[SUCCESS] Hit on ${new URL(node).hostname}`);
            return NextResponse.json({
              status: "success",
              node: new URL(node).hostname,
              data: { url: finalUrl, filename: data.filename || "media_file.mp4" }
            });
          }
        }
      } catch (err) {
        // فشل هذا الخادم، جرب التالي بصمت
        lastError = err.message;
        continue;
      }
    }

    // إذا فشل الجميع
    return NextResponse.json({ 
        error: "SYSTEM_OVERLOAD", 
        details: "All nodes busy. Please retry in 5 seconds." 
    }, { status: 503 });

  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_CORE_ERROR" }, { status: 500 });
  }
}