import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format } = body;

    if (!url) return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });

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

    // --- التصحيح الجذري هنا ---
    // للفيديو: نرسل "720" (لأن الـ API يطلب الدقة وليس الامتداد)
    // للصوت: نرسل "mp3"
    const targetFormat = format === 'audio' ? 'mp3' : '720'; 
    
    const apiUrl = `https://${apiHost}/ajax/download.php?format=${targetFormat}&url=${encodeURIComponent(cleanUrl)}`;

    console.log("Requesting URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost
      }
    });

    if (!response.ok) {
        return NextResponse.json({ error: "فشل الاتصال بالمزود" }, { status: response.status });
    }

    const data = await response.json();
    console.log("Provider Response:", data);

    // التحقق الصارم: هل يوجد رابط فعلاً؟
    // نبحث في data.url وفي data.link احتياطاً
    const finalLink = data.url || data.link || (data.download && data.download.url);

    if (!finalLink) {
         // إذا نجح الطلب لكن الرابط فارغ، نرجع خطأ للواجهة بدلاً من زر تحميل فارغ
         return NextResponse.json({ error: "لم يتمكن السيرفر من توليد الرابط. قد يكون الفيديو محمياً أو الجودة غير متاحة." }, { status: 400 });
    }

    return NextResponse.json({
      status: "success",
      title: data.title || "YouTube Video",
      thumb: data.poster || `https://img.youtube.com/vi/${cleanUrl.split('v=')[1]}/hqdefault.jpg`,
      downloadUrl: finalLink
    });

  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: "حدث خطأ داخلي" }, { status: 500 });
  }
}