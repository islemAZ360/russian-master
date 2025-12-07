import { NextResponse } from "next/server";

// قائمة بخوادم Cobalt القوية (Failover List)
// إذا فشل واحد، ينتقل النظام للتالي تلقائياً
const COBALT_INSTANCES = [
  "https://co.wuk.sh/api/json",          // خادم قوي جداً ومفتوح
  "https://cobalt.kwiatekmiki.pl/api/json", // خادم بديل
  "https://api.cobalt.tools/api/json",   // الخادم الرسمي (احتياطي)
  "https://cobalt.steamodded.com/api/json" // خادم إضافي
];

export async function POST(req) {
  try {
    const body = await req.json();
    let { url, format, quality } = body;

    if (!url) {
      return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });
    }

    // 1. تنظيف الرابط من معاملات التتبع (مثل ?si=...) لأنها تسبب مشاكل أحياناً
    try {
      const urlObj = new URL(url);
      // نحتفظ فقط بمعامل v إذا كان يوتيوب عادي، ونزيل الباقي
      if (urlObj.hostname.includes("youtube.com") || urlObj.hostname.includes("youtu.be")) {
        url = urlObj.origin + urlObj.pathname;
        if (urlObj.searchParams.has("v")) {
          url += "?v=" + urlObj.searchParams.get("v");
        }
      }
    } catch (e) {
      // إذا فشل التنظيف، نستخدم الرابط كما هو
    }

    // إعدادات الطلب
    const payload = {
      url: url,
      vCodec: "h264",
      vQuality: quality || "720",
      aFormat: "mp3",
      isAudioOnly: format === "audio",
      filenamePattern: "basic"
    };

    let data = null;
    let success = false;

    // 2. حلقة المحاولة (Retry Logic)
    for (const apiUrl of COBALT_INSTANCES) {
      try {
        console.log(`Trying instance: ${apiUrl}...`); // للتتبع في الكونسول
        
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          body: JSON.stringify(payload)
        });

        data = await response.json();

        // التحقق من نجاح العملية
        if (data && (data.url || data.picker || data.status === "stream" || data.status === "success")) {
          success = true;
          break; // نجحنا، نخرج من الحلقة
        }
      } catch (err) {
        console.warn(`Instance failed: ${apiUrl}`, err.message);
        // نستمر للمحاولة مع الخادم التالي
      }
    }

    // 3. معالجة النتيجة النهائية
    if (!success || !data) {
      return NextResponse.json({ error: "فشلت جميع الخوادم في المعالجة. تأكد أن الرابط عام." }, { status: 500 });
    }

    // التعامل مع أنواع الردود المختلفة من Cobalt
    let finalUrl = data.url;
    
    // أحياناً يعيد النظام قائمة (picker) بدلاً من رابط مباشر
    if (!finalUrl && data.picker && data.picker.length > 0) {
      finalUrl = data.picker[0].url;
    }

    if (!finalUrl) {
       return NextResponse.json({ error: "تم تحليل الفيديو لكن لم يتم العثور على رابط مباشر." }, { status: 500 });
    }

    // محاولة استخراج صورة الفيديو بشكل مستقل لتحسين العرض
    let videoId = "";
    try {
        if(url.includes("youtu.be")) videoId = url.split("/").pop().split("?")[0];
        else if(url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
        else if(url.includes("shorts")) videoId = url.split("shorts/")[1].split("?")[0];
    } catch(e) {}

    const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    return NextResponse.json({
      title: data.filename || "YouTube Media",
      url: finalUrl,
      thumb: thumb,
      status: "success"
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "حدث خطأ في خادم المعالجة الداخلي" }, { status: 500 });
  }
}