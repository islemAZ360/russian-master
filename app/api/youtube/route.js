import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format } = body; // format: 'video' or 'audio'

    if (!url) return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });

    // 1. تنظيف الرابط
    let cleanUrl = url;
    try {
        const urlObj = new URL(url);
        // نأخذ الـ ID فقط ونعيد بناء الرابط لتجنب أي مشاكل
        let videoId = "";
        if (url.includes("youtu.be")) videoId = urlObj.pathname.slice(1);
        else videoId = urlObj.searchParams.get("v");
        
        if (videoId) cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } catch (e) {}

    // 2. إعدادات RapidAPI (من صورك)
    const apiHost = "youtube-info-download-api.p.rapidapi.com";
    const apiKey = "dadaa32ee3mshea65c3b698adda9p1bd70fjsn7f23dfd97126"; 

    // 3. تصحيح الـ Format بناءً على الصورة التي أرسلتها!
    // الصورة تقول: للفيديو أرسل الدقة (720)، للصوت أرسل الصيغة (mp3)
    // لا ترسل 'mp4' لأن الـ API لا يقبلها في خانة format
    const targetFormat = format === 'audio' ? 'mp3' : '720'; 
    
    // استخدام نقطة النهاية الموجودة في الـ cURL Snippet
    const apiUrl = `https://${apiHost}/ajax/download.php?format=${targetFormat}&url=${encodeURIComponent(cleanUrl)}`;

    console.log("Requesting:", apiUrl); // للتتبع في Vercel Logs

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost
      }
    });

    if (!response.ok) {
        return NextResponse.json({ error: `خطأ من المصدر: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("API Data:", data); // لنرى ماذا يعيد السيرفر

    // 4. التحقق من الاستجابة
    // هذا الـ API بالتحديد يعيد أحياناً data.url وأحياناً data.download_url
    const downloadLink = data.url || data.download_url || (data.downloads && data.downloads[0]?.url);

    if (!data.success && !downloadLink) {
         return NextResponse.json({ error: "فشل استخراج الرابط، قد يكون الفيديو محمياً أو الرابط غير مدعوم." }, { status: 400 });
    }

    return NextResponse.json({
      status: "success",
      title: data.title || "YouTube Video",
      thumb: data.poster || null,
      downloadUrl: downloadLink // الرابط النهائي
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "حدث خطأ في المعالجة الداخلية" }, { status: 500 });
  }
}