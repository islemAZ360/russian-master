import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { fullDatabase } from "@/data/fullDatabase"; 

export async function POST(req) {
  try {
    console.log("--- 1. بدء طلب جديد ---");
    
    // 1. التأكد من وصول البيانات من الفرونت إند
    const body = await req.json();
    console.log("--- 2. البيانات المستلمة:", { 
        message: body.message, 
        modelName: body.modelName,
        historyLength: body.history?.length 
    });

    // 2. التأكد من قراءة المفتاح
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("--- ❌ خطأ: المفتاح غير موجود في process.env ---");
      return NextResponse.json({ error: "API Key Missing on Server" }, { status: 500 });
    }
    console.log("--- 3. المفتاح موجود (تمت قراءته بنجاح) ---");

    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = body.modelName || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: selectedModel });

    const categories = fullDatabase 
      ? [...new Set(fullDatabase.map(item => item.category))].join(", ")
      : "General Russian";
    
    const systemPrompt = `You are a strict Russian tutor. User is studying: [${categories}]. Reply in Russian then English.`;

    console.log(`--- 4. جاري الاتصال بجوجل باستخدام موديل: ${selectedModel} ---`);

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Ready." }] },
        ...(body.history || [])
      ],
    });

    const result = await chat.sendMessage(body.message);
    const response = await result.response;
    const text = response.text();

    console.log("--- 5. تم استلام الرد من جوجل بنجاح ---");
    return NextResponse.json({ reply: text });

  } catch (error) {
    // هذا سيطبع الخطأ الحقيقي في التيرمينال عندك
    console.error("--- ❌❌ خطأ فادح في السيرفر:", error);
    return NextResponse.json({ error: error.message || "Unknown Error" }, { status: 500 });
  }
}