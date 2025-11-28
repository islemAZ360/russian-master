import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// ⚠️ سنضع المفتاح هنا مباشرة للتجربة فقط لنرى هل المشكلة في قراءة الملف أم لا
const HARDCODED_KEY = "AIzaSyDi8-POg6RGCoBCkni6_8XNikJvTmH4z3M";

export async function POST(req) {
  console.log("--- بدء محاولة الاتصال (Test Mode) ---");

  try {
    // 1. استقبال الرسالة
    const body = await req.json();
    const { message } = body;
    console.log("الرسالة المستلمة:", message);

    // 2. تجربة الاتصال المباشر
    const genAI = new GoogleGenerativeAI(HARDCODED_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "model",
          parts: [{ text: "System Online. I am ready." }],
        },
      ],
    });

    console.log("جاري إرسال الطلب لجوجل...");
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    console.log("تم الاستلام بنجاح:", text);
    return NextResponse.json({ reply: text });

  } catch (error) {
    // هذا سيطبع المشكلة الحقيقية في التيرمينال
    console.error("❌❌ خطأ فادح:", error);
    
    // سنعيد رسالة الخطأ للواجهة لنراها هناك أيضاً
    return NextResponse.json({ 
        error: "فشل الاتصال بالسيرفر", 
        details: error.message 
    }, { status: 500 });
  }
}