import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format } = body; // format يأتيني من الواجهة إما 'video' أو 'audio'

    if (!url) return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });

    // 1. تنظيف الرابط (إزالة ?si=... والشوائب)
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

    // 2. إعدادات RapidAPI (بناءً على صورتك)
    const apiHost = "youtube-info-download-api.p.rapidapi.com";
    const apiKey = "dadaa32ee3mshea65c3b698adda9p1bd70fjsn7f23dfd97126"; 

    // 3. تحديد الـ Format بناءً على توثيق الصورة
    // إذا طلب فيديو نرسل '720' (لأنه يقبل الدقة)
    // إذا طلب صوت نرسل 'mp3' (لأنه يقبل الصيغة)
    const targetFormat = format === 'audio' ? 'mp3' : '720';
    
    // استخدام نقطة النهاية /download كما في الصورة
    const apiUrl = `https://${apiHost}/download?url=${encodeURIComponent(cleanUrl)}&format=${targetFormat}`;

    console.log("Calling API:", apiUrl); // للتتبع

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
        return NextResponse.json({ error: `خطأ من المصدر: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("API Response:", data);

    // 4. التحقق من الاستجابة (هذا الـ API يعيد الرابط في حقل 'link' أو 'url')
    // بناءً على تجربة هذا المزود، الرابط يكون غالباً في data.link
    const downloadLink = data.link || data.url || (data.download && data.download[0]?.url);

    if (!downloadLink) {
         return NextResponse.json({ error: "فشل استخراج رابط التحميل، حاول مرة أخرى." }, { status: 400 });
    }

    return NextResponse.json({
      status: "success",
      title: data.title || "YouTube Video",
      thumb: `https://img.youtube.com/vi/${cleanUrl.split('v=')[1]}/hqdefault.jpg`,
      downloadUrl: downloadLink // الرابط المباشر
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "حدث خطأ في المعالجة" }, { status: 500 });
  }
}