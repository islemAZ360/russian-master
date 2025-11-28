import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// ⚠️ مفتاح API (يفضل وضعه في ملف .env لكن وضعته هنا ليعمل معك مباشرة)
const API_KEY = "AIzaSyDi8-POg6RGCoBCkni6_8XNikJvTmH4z3M";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;

    // 1. التحقق من وجود رسائل
    if (!messages || messages.length === 0) {
      return NextResponse.json({ reply: "لم يتم استلام أي رسالة." }, { status: 400 });
    }

    // 2. إعداد النموذج
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 3. تجهيز سياق المحادثة
    const lastMessage = messages[messages.length - 1].text;
    
    // تحويل الرسائل السابقة لتنسيق يفهمه Gemini
    // نستثني الرسالة الأخيرة لأننا نرسلها بشكل منفصل، ونأخذ آخر 10 رسائل فقط لتوفير التكلفة
    const history = messages.slice(0, -1).slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "System Instruction: You are 'Russian Master AI', a strict but helpful cybernetic tutor teaching Russian to an Arabic speaker. Keep answers short, precise, and tech-themed if possible." }],
        },
        {
          role: "model",
          parts: [{ text: "System Online. Neural link established. Ready to instruct." }],
        },
        ...history
      ],
    });

    // 4. الإرسال
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("❌ AI Error:", error);
    return NextResponse.json(
        { reply: "⚠️ Connection Lost: Neural Link failed. Try again." },
        { status: 500 }
    );
  }
}