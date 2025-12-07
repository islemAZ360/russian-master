import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format } = body;

    if (!url) return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });

    // 1. تنظيف الرابط
    let cleanUrl = url;
    let videoId = "";
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtu')) {
            if (url.includes("youtu.be")) videoId = urlObj.pathname.slice(1);
            else videoId = urlObj.searchParams.get("v");
            
            if (videoId) {
                videoId = videoId.split('?')[0];
                cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
            }
        }
    } catch (e) { }

    if (!videoId) return NextResponse.json({ error: "رابط غير صالح" }, { status: 400 });

    // مفتاحك (يعمل على جميع هذه الخدمات لأنها في RapidAPI)
    const apiKey = "dadaa32ee3mshea65c3b698adda9p1bd70fjsn7f23dfd97126";

    let finalData = null;

    // ============================================================
    // المحرك 1: السريع (للأغاني والفيديوهات القصيرة)
    // ============================================================
    console.log(">>> Engine 1: Starting...");
    try {
        const host1 = "youtube-info-download-api.p.rapidapi.com";
        // نجرب mp3 للصوت، و 360 للفيديو (أضمن للجودة الطويلة)
        const f1 = format === 'audio' ? 'mp3' : '360'; 
        const response1 = await fetch(`https://${host1}/ajax/download.php?format=${f1}&url=${encodeURIComponent(cleanUrl)}`, {
            headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": host1 }
        });
        
        if (response1.ok) {
            const d1 = await response1.json();
            if (d1.success && (d1.url || d1.download_url)) {
                finalData = {
                    title: d1.title,
                    thumb: d1.poster,
                    url: d1.url || d1.download_url,
                    engine: "Engine 1 (Fast)"
                };
            }
        }
    } catch (e) { console.log("Engine 1 Failed."); }

    // ============================================================
    // المحرك 2: القوي (للفيديوهات الطويلة والمحمية)
    // ============================================================
    if (!finalData) {
        console.log(">>> Engine 2: Starting (Deep Search)...");
        try {
            const host2 = "youtube-media-downloader.p.rapidapi.com";
            const response2 = await fetch(`https://${host2}/v2/video/details?videoId=${videoId}`, {
                headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": host2 }
            });

            if (response2.ok) {
                const d2 = await response2.json();
                let link = null;
                // محاولة إيجاد أي رابط يعمل
                if (format === 'audio') {
                    link = d2.audios?.items?.[0]?.url;
                } else {
                    // نبحث عن mp4 (جودة عالية أو متوسطة)
                    const vids = d2.videos?.items || [];
                    link = vids.find(v => v.quality === "720p" && v.extension === "mp4")?.url || 
                           vids.find(v => v.quality === "360p" && v.extension === "mp4")?.url ||
                           vids[0]?.url;
                }

                if (link) {
                    finalData = {
                        title: d2.title,
                        thumb: d2.thumbnails?.[0]?.url,
                        url: link,
                        engine: "Engine 2 (Deep)"
                    };
                }
            }
        } catch (e) { console.log("Engine 2 Failed."); }
    }

    // ============================================================
    // المحرك 3: الطوارئ (Yt-Stream) - للفيديوهات الطويلة جداً
    // ============================================================
    if (!finalData) {
        console.log(">>> Engine 3: Starting (Emergency)...");
        try {
            const host3 = "ytstream-download-youtube-videos.p.rapidapi.com";
            const response3 = await fetch(`https://${host3}/dl?id=${videoId}`, {
                headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": host3 }
            });

            if (response3.ok) {
                const d3 = await response3.json();
                // هذا الـ API يعيد الروابط في formats
                const link = d3.formats?.find(f => f.itag === 18)?.url || // 360p mp4 (الأكثر توافراً)
                             d3.formats?.find(f => f.itag === 22)?.url || // 720p mp4
                             d3.adaptiveFormats?.find(f => f.mimeType.includes("audio/mp4"))?.url; // audio

                if (link) {
                    finalData = {
                        title: d3.title || "YouTube Video",
                        thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                        url: link,
                        engine: "Engine 3 (Backup)"
                    };
                }
            }
        } catch (e) { console.log("Engine 3 Failed."); }
    }

    // --- النتيجة النهائية ---
    if (!finalData) {
        return NextResponse.json({ 
            error: "فشلت جميع المحركات. الفيديو طويل جداً (أكثر من ساعة) أو محمي بحقوق صارمة." 
        }, { status: 400 });
    }

    return NextResponse.json({
      status: "success",
      title: finalData.title || "Video",
      thumb: finalData.thumb || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      downloadUrl: finalData.url,
      engine: finalData.engine
    });

  } catch (error) {
    console.error("Critical Error:", error);
    return NextResponse.json({ error: "خطأ غير متوقع في النظام" }, { status: 500 });
  }
}