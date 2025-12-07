import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format } = body;

    if (!url) return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });

    // 1. تنظيف الرابط (إزالة ?si=... التي سببت المشكلة)
    let cleanUrl = url;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtu')) {
            // نأخذ فقط الـ ID ونعيد بناء الرابط نظيفاً
            let videoId = "";
            if (url.includes("youtu.be")) videoId = urlObj.pathname.slice(1);
            else videoId = urlObj.searchParams.get("v");
            
            // تنظيف المعرف من أي رموز إضافية
            if (videoId) cleanUrl = `https://www.youtube.com/watch?v=${videoId.split('?')[0]}`;
        }
    } catch (e) {
        // إذا فشل التنظيف نستخدم الرابط كما هو
    }

    // 2. إعدادات RapidAPI (حسب اشتراكك)
    const apiHost = "youtube-info-download-api.p.rapidapi.com";
    const apiKey = "dadaa32ee3mshea65c3b698adda9p1bd70fjsn7f23dfd97126"; // مفتاحك

    const targetFormat = format === 'audio' ? 'mp3' : 'mp4';
    
    // استخدام نقطة النهاية الصحيحة
    const apiUrl = `https://${apiHost}/ajax/download.php?format=${targetFormat}&url=${encodeURIComponent(cleanUrl)}`;

    // 3. الاتصال (سيرفر لسيرفر لتجنب CORS)
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost
      }
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("API Error:", errText);
        return NextResponse.json({ error: `رفض المزود الطلب (${response.status})` }, { status: response.status });
    }

    const data = await response.json();

    // 4. التحقق من النتيجة
    if (!data.success && !data.url) {
         return NextResponse.json({ error: "فشل استخراج الرابط. تأكد أن الفيديو ليس خاصاً أو مقيداً." }, { status: 400 });
    }

    return NextResponse.json({
      status: "success",
      title: data.title || "YouTube Media",
      thumb: data.poster || null,
      downloadUrl: data.url // الرابط المباشر
    });

  } catch (error) {
    console.error("Internal Error:", error);
    return NextResponse.json({ error: "حدث خطأ في المعالجة الداخلية" }, { status: 500 });
  }
}