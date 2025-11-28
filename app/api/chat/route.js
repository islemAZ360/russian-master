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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const lastMessage = messages[messages.length - 1].text;

    const systemPrompt = `
    You are "NEXUS-7", an Elite Cybernetic Russian Tutor.
    
    INSTRUCTIONS:
    1. **Language:** Detect user language. If Arabic, reply in Arabic (with Russian examples).
    2. **Formatting:** You MUST use Markdown.
       - Use **Bold** for new vocabulary.
       - Use Lists for steps.
       - Use Tables for conjugations or vocabulary lists (Russian | Arabic | Pronunciation).
    3. **Style:** Short, punchy, futuristic. Avoid long paragraphs.
    4. **Goal:** Teach Russian effectively. Correct mistakes immediately.
    
    Example Output format:
    "Data processed. Here is the verb **To Know** (Знать):
    
    | Russian | Arabic |
    | :--- | :--- |
    | Я знаю | أنا أعرف |
    | Ты знаешь | أنت تعرف |
    
    Neural link stable. Next query?"
    `;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "NEXUS-7 Online. Formatting protocols engaged. Ready." }] },
        ...messages.slice(0, -1).slice(-6).map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }))
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ reply: "⚠️ CORE FAILURE: Connection severed." }, { status: 500 });
  }
}