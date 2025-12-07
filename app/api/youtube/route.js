import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format } = body;

    if (!url) return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });

    // 1. تنظيف الرابط
    let cleanUrl = url;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtu')) {
            let videoId = "";
            if (url.includes("youtu.be")) videoId = urlObj.pathname.slice(1);
            else videoId = urlObj.searchParams.get("v");
            
            if (videoId) cleanUrl = `https://www.youtube.com/watch?v=${videoId.split('?')[0]}`;
        }
    } catch (e) { }

    const apiHost = "youtube-info-download-api.p.rapidapi.com";
    const apiKey = "dadaa32ee3mshea65c3b698adda9p1bd70fjsn7f23dfd97126"; 

    // دالة مساعدة للاتصال بالـ API مع تحديد الجودة
    const fetchFromRapid = async (selectedFormat) => {
        const apiUrl = `https://${apiHost}/ajax/download.php?format=${selectedFormat}&url=${encodeURIComponent(cleanUrl)}`;
        const res = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "x-rapidapi-key": apiKey,
                "x-rapidapi-host": apiHost
            }
        });
        if (!res.ok) return null;
        return await res.json();
    };

    let data = null;

    // --- منطق المحاولات الذكي (Smart Retry Logic) ---
    
    if (format === 'audio') {
        // إذا كان صوت، جرب mp3
        data = await fetchFromRapid('mp3');
    } else {
        // إذا كان فيديو، ابدأ بـ 720
        console.log("Trying 720p...");
        data = await fetchFromRapid('720');

        // إذا فشل (الرابط فارغ)، جرب 360
        if (!data || !data.url) {
            console.log("720p failed, Trying 360p...");
            data = await fetchFromRapid('360');
        }
        
        // إذا فشل، جرب 480
        if (!data || !data.url) {
             console.log("360p failed, Trying 480p...");
             data = await fetchFromRapid('480');
        }
    }

    // التحقق النهائي
    const finalLink = data?.url || data?.link || (data?.download && data?.download[0]?.url);

    if (!finalLink) {
         return NextResponse.json({ 
             error: "عذراً، هذا الفيديو محمي أو لا يتوفر له روابط تحميل مباشرة حالياً." 
         }, { status: 400 });
    }

    return NextResponse.json({
      status: "success",
      title: data.title || "YouTube Media",
      thumb: data.poster || `https://img.youtube.com/vi/${cleanUrl.split('v=')[1]}/hqdefault.jpg`,
      downloadUrl: finalLink
    });

  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}