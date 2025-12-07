import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format, quality } = body;

    if (!url) {
      return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });
    }

    // إعدادات الطلب لخدمة Cobalt
    const cobaltApiUrl = "https://api.cobalt.tools/api/json";
    
    const payload = {
      url: url,
      vCodec: "h264",
      vQuality: quality || "720",
      aFormat: "mp3",
      isAudioOnly: format === "audio",
      filenamePattern: "basic"
    };

    const response = await fetch(cobaltApiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === "error" || (!data.url && !data.picker)) {
      console.error("Cobalt Error:", data);
      return NextResponse.json({ error: "فشل استخراج الفيديو. تأكد أن الرابط عام وصحيح." }, { status: 500 });
    }

    // في بعض الأحيان تعيد الخدمة "picker" إذا كان هناك خيارات متعددة، نأخذ الرابط الأول
    const finalUrl = data.url || (data.picker && data.picker[0] ? data.picker[0].url : null);

    if (!finalUrl) {
       return NextResponse.json({ error: "لم يتم العثور على رابط مباشر للتحميل." }, { status: 500 });
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
    return NextResponse.json({ error: "حدث خطأ في خادم المعالجة" }, { status: 500 });
  }
}