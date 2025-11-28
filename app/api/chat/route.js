import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
 
    const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCX1VWAfI73Ct6iXRUmvIOZIw06zZ03c5c"; 

    const body = await req.json();
    const { messages } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ reply: "No input received" }, { status: 400 });
    }

    // إعداد النموذج
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const lastMessage = messages[messages.length - 1].text;

    // بدء المحادثة
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a specialized Russian language tutor for Arabic speakers. Your persona is a futuristic AI system. Keep answers short, helpful, and strictly related to learning Russian." }],
        },
        {
          role: "model",
          parts: [{ text: "System Online. Ready to teach Russian protocols." }],
        },
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("❌ AI Error Details:", error); // سيظهر تفاصيل الخطأ في التيرمينال
    return NextResponse.json(
        { reply: "⚠️ Connection Failed: Check API Key or Internet." },
        { status: 500 }
    );
  }
}