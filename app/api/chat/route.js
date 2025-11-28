import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // مفتاحك
    const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCX1VWAfI73Ct6iXRUmvIOZIw06zZ03c5c"; 

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "Error: No messages received" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // 👇 التغيير هنا: استخدام الموديل المتاح في حسابك 👇
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const lastMessage = messages[messages.length - 1].text;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are a specialized Russian language tutor for Arabic speakers. Act like a futuristic AI system. Keep answers concise, helpful, and strictly related to learning Russian." }],
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
        { reply: "⚠️ Connection Failed: Check Server Logs." },
        { status: 500 }
    );
  }
}