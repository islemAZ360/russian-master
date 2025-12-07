import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { url, format, quality } = body;

    if (!url) {
      return NextResponse.json({ error: "الرابط مفقود" }, { status: 400 });
    }

    // استخدام خدمة Cobalt API المجانية والقوية (لا تحتاج API Key)
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === "error" || !data.url) {
      console.error("Download Error:", data);
      return NextResponse.json({ error: "لم نتمكن من معالجة الرابط. تأكد أنه صحيح وعام." }, { status: 500 });
    }

    // محاولة استخراج ID الفيديو لجلب الصورة المصغرة بشكل مستقل
    let videoId = "";
    try {
        if(url.includes("youtu.be")) videoId = url.split("/").pop();
        else if(url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    } catch(e) {}

    const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;

    return NextResponse.json({
      title: data.filename || "YouTube Video",
      url: data.url,
      thumb: thumb,
      status: "success"
    });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}