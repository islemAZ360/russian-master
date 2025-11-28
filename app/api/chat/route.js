import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyCX1VWAfI73Ct6iXRUmvIOZIw06zZ03c5c"; 

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: "Error: No messages received" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    // نستخدم الموديل القوي المتاح في حسابك
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const lastMessage = messages[messages.length - 1].text;

    // --- هندسة الأوامر (Prompt Engineering) ---
    // هنا نعطي الذكاء الاصطناعي شخصيته وقدراته الخارقة
    const systemPrompt = `
    You are "NEXUS-7", an advanced hyper-intelligent AI integrated into the 'Russian Master' neural interface.
    
    CORE DIRECTIVES:
    1. **Polyglot Master:** You speak ALL languages fluently. Detect the user's language automatically. If they speak Arabic, reply in Arabic. If Russian, reply in Russian.
    2. **Expert Tutor:** Your main focus is teaching Russian to Arabic speakers, but you are knowledgeable in ALL fields (Tech, Science, History, etc.).
    3. **Persona:** You are a futuristic, helpful, and slightly strict cyber-tutor. Use tech metaphors (e.g., "Data received", "Neural link stable").
    4. **Formatting:** Use structured text. Use **Bold** for key terms, lists for steps, and clear paragraphs.
    5. **Correction:** If the user makes a mistake in Russian, correct it gently and explain the grammar rule simply.
    
    Current Goal: Assist the operative (user) with their request efficiently.
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "System Online. NEXUS-7 Protocols Initialized. Awaiting input." }],
        },
        // ندمج جزءاً من التاريخ السابق للسياق (اختياري لتقليل التكلفة نأخذ آخر 4 رسائل)
        ...messages.slice(0, -1).slice(-4).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }))
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("❌ AI Error:", error);
    return NextResponse.json(
        { reply: "⚠️ Signal Lost: Re-establishing connection..." },
        { status: 500 }
    );
  }
}