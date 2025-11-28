import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
// سنحاول استيراد قاعدة البيانات، وإذا فشلت لن نوقف الكود
let fullDatabase = [];
try {
  const dbModule = require("@/data/fullDatabase");
  fullDatabase = dbModule.fullDatabase || [];
} catch (e) {
  console.log("⚠️ تحذير: لم يتم العثور على قاعدة البيانات، سنعمل بدونها.");
}

export async function POST(req) {
  console.log("--- 1. بدء طلب الشات (Server Start) ---");

  try {
    // 1. فحص المفتاح
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("--- 2. حالة المفتاح:", apiKey ? "✅ موجود" : "❌ مفقود");
    
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing in .env.local" }, { status: 500 });
    }

    // 2. استلام البيانات
    const body = await req.json();
    const { message, history, modelName } = body;
    console.log("--- 3. الرسالة المستلمة:", message);
    console.log("--- 4. الموديل المطلوب:", modelName);

    // 3. الاتصال بجوجل
    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = modelName || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: selectedModel });

    const systemPrompt = `You are a Russian Tutor. Reply concisely.`;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Ready." }] },
        ...(history || [])
      ],
    });

    console.log("--- 5. جاري إرسال الرسالة إلى Google... ---");
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    console.log("--- 6. تم استلام الرد بنجاح! ---");
    return NextResponse.json({ reply: text });

  } catch (error) {
    // هذا هو أهم جزء، سيطبع سبب المشكلة في التيرمينال
    console.error("❌❌ خطأ فادح في السيرفر:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}