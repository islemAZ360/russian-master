import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format } = body; // format: 'video' or 'audio'

    if (!url) return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });

    // إعدادات API بناءً على اشتراكك والصورة التي أرسلتها
    const apiHost = "youtube-info-download-api.p.rapidapi.com";
    const apiKey = "dadaa32ee3mshea65c3b698adda9p1bd70fjsn7f23dfd97126"; // مفتاحك الخاص

    // تحديد الصيغة المطلوبة (mp3 للصوت، mp4 للفيديو)
    const targetFormat = format === 'audio' ? 'mp3' : 'mp4';
    
    // بناء رابط الطلب كما هو موضح في صورة RapidAPI
    // نستخدم encodeURIComponent لضمان عدم تكسر الرابط
    const apiUrl = `https://${apiHost}/ajax/download.php?format=${targetFormat}&url=${encodeURIComponent(url)}`;

    // الاتصال بـ RapidAPI
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost
      }
    });

    if (!response.ok) {
        return NextResponse.json({ error: "فشل الاتصال بـ RapidAPI" }, { status: response.status });
    }

    const data = await response.json();

    // التحقق من نجاح العملية (هذا الـ API يعيد عادة حقل success أو url)
    if (!data.success && !data.url) {
         return NextResponse.json({ error: "لم يتمكن المزود من استخراج الفيديو، حاول رابطاً آخر." }, { status: 400 });
    }

    return NextResponse.json({
      status: "success",
      title: data.title || "YouTube Media",
      // نستخدم صورة افتراضية إذا لم يوفرها الـ API
      thumb: data.poster || "https://i.imgur.com/8J57tVb.png", 
      downloadUrl: data.url // الرابط المباشر للتحميل
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "حدث خطأ في النظام الداخلي" }, { status: 500 });
  }
}