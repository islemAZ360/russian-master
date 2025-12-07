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
                videoId = videoId.split('?')[0]; // تنظيف نهائي
                cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
            }
        }
    } catch (e) { }

    const apiKey = "dadaa32ee3mshea65c3b698adda9p1bd70fjsn7f23dfd97126"; // مفتاحك

    // ==========================================
    // المحاولة الأولى: المزود السخي (500 طلب)
    // ==========================================
    console.log("Attempt 1: High Volume Provider...");
    try {
        const host1 = "youtube-info-download-api.p.rapidapi.com";
        const format1 = format === 'audio' ? 'mp3' : '720';
        const url1 = `https://${host1}/ajax/download.php?format=${format1}&url=${encodeURIComponent(cleanUrl)}`;
        
        const res1 = await fetch(url1, {
            method: "GET",
            headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": host1 }
        });

        if (res1.ok) {
            const data1 = await res1.json();
            const link1 = data1.url || data1.link || (data1.download && data1.download[0]?.url);
            
            if (link1) {
                return NextResponse.json({
                    status: "success",
                    title: data1.title || "Video",
                    thumb: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    downloadUrl: link1,
                    source: "Provider 1"
                });
            }
        }
    } catch (e) { console.log("Provider 1 failed, switching..."); }

    // ==========================================
    // المحاولة الثانية: المزود القوي (100 طلب) - للخالات الصعبة
    // ==========================================
    console.log("Attempt 2: Premium Provider...");
    try {
        const host2 = "youtube-media-downloader.p.rapidapi.com";
        const url2 = `https://${host2}/v2/video/details?videoId=${videoId}`;
        
        const res2 = await fetch(url2, {
            method: "GET",
            headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": host2 }
        });

        if (res2.ok) {
            const data2 = await res2.json();
            // استخراج الرابط من المزود الثاني
            let link2 = null;
            if (format === 'audio') {
                link2 = data2.audios?.items[0]?.url;
            } else {
                // نبحث عن mp4 بجودة 720 أو 360
                const videos = data2.videos?.items || [];
                const v720 = videos.find(v => v.quality === "720p" && v.extension === "mp4");
                const vAny = videos.find(v => v.extension === "mp4");
                link2 = v720?.url || vAny?.url;
            }

            if (link2) {
                return NextResponse.json({
                    status: "success",
                    title: data2.title || "Video",
                    thumb: data2.thumbnails?.[0]?.url,
                    downloadUrl: link2,
                    source: "Provider 2"
                });
            }
        }
    } catch (e) { console.log("Provider 2 failed."); }

    // إذا فشل الاثنان
    return NextResponse.json({ error: "عذراً، هذا الفيديو محمي جداً ولم نتمكن من استخراجه." }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: "خطأ في النظام" }, { status: 500 });
  }
}