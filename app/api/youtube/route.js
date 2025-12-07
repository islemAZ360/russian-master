import { NextResponse } from "next/server";

// قائمة محدثة بخوادم قوية (Fresh Nodes)
const SWARM_NODES = [
  "https://cobalt.meowing.de/api/json",       // خادم قوي جداً (ألماني)
  "https://api.cobalt.tools/api/json",        // الرسمي
  "https://cobalt.kwiatekmiki.pl/api/json",   // بولندي
  "https://co.wuk.sh/api/json",               // خادم مشهور
  "https://cobalt.steamodded.com/api/json",   // بديل
  "https://us.cobalt.gif.ci/api/json"         // كندي
];

// رؤوس التخفي
const STEALTH_HEADERS = {
  "Accept": "application/json",
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Origin": "https://cobalt.tools",
  "Referer": "https://cobalt.tools/"
};

export async function POST(req) {
  try {
    const body = await req.json();
    let { url, format, quality } = body;

    if (!url) return NextResponse.json({ error: "MISSING_TARGET" }, { status: 400 });

    // تنظيف الرابط
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

    // خلط الخوادم لتوزيع الحمل
    const shuffledNodes = SWARM_NODES.sort(() => 0.5 - Math.random());

    for (const node of shuffledNodes) {
      try {
        console.log(`[SERVER] Attacking Node: ${node}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 ثواني مهلة

        const response = await fetch(node, {
          method: "POST",
          headers: STEALTH_HEADERS,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (data && (data.url || data.picker || data.status === "stream" || data.status === "success")) {
          let finalUrl = data.url;
          if (!finalUrl && data.picker && data.picker.length > 0) finalUrl = data.picker[0].url;

          if (finalUrl) {
            return NextResponse.json({
              status: "success",
              node: new URL(node).hostname,
              data: { url: finalUrl, filename: data.filename || "media_file" }
            });
          }
        }
      } catch (err) {
        // فشل هذا الخادم، ننتقل للتالي
        continue;
      }
    }

    // إذا فشلت كل الخوادم، نرجع رمز خاص (429) لنخبر الواجهة بتشغيل الوضع المباشر
    return NextResponse.json({ 
        error: "ALL_NODES_BLOCKED", 
        details: "Server IPs blacklisted. Switching to Client-Side." 
    }, { status: 429 });

  } catch (error) {
    return NextResponse.json({ error: "SYSTEM_CRASH" }, { status: 500 });
  }
}