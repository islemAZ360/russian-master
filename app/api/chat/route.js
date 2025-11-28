import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { fullDatabase } from "@/data/fullDatabase"; 

export async function POST(req) {
  try {
    // التعديل هنا: نستقبل modelName من واجهة المستخدم
    const { message, history, modelName } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // استخدام الموديل المختار، وإذا لم يرسل المستخدم شيئاً نستخدم Flash كاحتياط
    // ملاحظة: تأكدنا أن هذه الموديلات مدعومة
    const selectedModel = modelName || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: selectedModel });

    const categories = fullDatabase 
      ? [...new Set(fullDatabase.map(item => item.category))].join(", ")
      : "General Russian";
    
    const systemPrompt = `
      You are "Russian Master AI", running on core [${selectedModel}].
      
      Mission Protocols:
      1. Teach Russian language efficiently.
      2. Strictly correct grammar/spelling errors.
      3. Use English/Arabic for explanations.
      4. Current User Study Sectors: [${categories}].
      5. Tone: Cyberpunk, Military, Concise (e.g., "Affirmative", "Negative", "Data uploaded").
      
      Directives:
      - Reply in Russian first, then translate/explain.
      - Keep responses short and impactful.
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: `Core ${selectedModel} Online. Ready for instructions.` }],
        },
        ...history 
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "System Overload. Try switching cores." }, { status: 500 });
  }
}