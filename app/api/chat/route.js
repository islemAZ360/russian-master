import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // ⚠️ تأكد من أن المفتاح صحيح ولا يحتوي على مسافات زائدة
    const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCX1VWAfI73Ct6iXRUmvIOZIw06zZ03c5c"; 

    const body = await req.json();
    const { messages } = body;

    // التحقق من صحة البيانات
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ reply: "Error: Invalid message format" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // آخر رسالة من المستخدم
    const lastMessage = messages[messages.length - 1].text;

    // بدء المحادثة
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a specialized Russian language tutor for Arabic speakers. Act like a futuristic AI system. Keep answers concise, helpful, and motivating." }],
        },
        {
          role: "model",
          parts: [{ text: "System Online. Neural link established. Ready to instruct." }],
        },
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("❌ AI Error:", error);
    return NextResponse.json(
        { reply: "⚠️ Connection Failed: Check API Key or Server Logs." },
        { status: 500 }
    );
  }
}