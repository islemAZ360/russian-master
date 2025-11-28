"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IconRobot, IconSend, IconCpu, IconSettings, IconAlertTriangle } from "@tabler/icons-react";
// استيراد المكتبة مباشرة في الواجهة
import { GoogleGenerativeAI } from "@google/generative-ai";

// ⚠️ مفتاحك يعمل هنا مباشرة لأن المتصفح هو من يتصل بجوجل
const API_KEY = "AIzaSyDi8-POg6RGCoBCkni6_8XNikJvTmH4z3M";

const AI_MODELS = [
  { id: "gemini-1.5-flash", name: "⚡ FLASH V1.5 (Fast)" },
  { id: "gemini-1.5-pro", name: "🧠 PRO V1.5 (Smart)" },
];

export default function AITutor({ user }) {
  const userName = user?.email?.split('@')[0] || 'Operative';
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [messages, setMessages] = useState([
    { role: "model", text: `System Online.\nWelcome, ${userName}. Select AI Core and state objective.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // تهيئة المحادثة (خارج الدالة لتستمر)
  const [chatSession, setChatSession] = useState(null);

  useEffect(() => {
    // تجهيز البوت عند فتح الصفحة
    const initChat = async () => {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: selectedModel });
        
        const systemPrompt = `
          You are "Russian Master AI", a Cyberpunk Russian Tutor.
          Protocol: Teach Russian, correct errors strictly, be concise.
          Tone: Military/Cyberpunk.
        `;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Affirmative. Systems ready." }] },
            ],
        });
        setChatSession(chat);
    };
    initChat();
  }, [selectedModel]); // يعيد التهيئة عند تغيير الموديل

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !chatSession) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      // الاتصال المباشر بجوجل من المتصفح (بدون سيرفر وسيط)
      const result = await chatSession.sendMessage(userMsg);
      const response = await result.response;
      const text = response.text();
      
      setMessages(prev => [...prev, { role: "model", text: text }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "model", text: "⚠️ Error: Connection blocked or API Key invalid." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-24 md:pb-4 relative overflow-hidden font-sans">
      
      {/* رأس الشات */}
      <div className="w-full max-w-4xl bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-t-2xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-cyan-400 shadow-[0_0_10px_#06b6d4]">
                <IconRobot size={28} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <h2 className="text-xl font-black text-white tracking-widest">AI MENTOR</h2>
                <p className="text-[10px] text-cyan-400/60 font-mono uppercase">Direct Link Mode</p>
            </div>
        </div>

        <div className="relative group w-full md:w-auto">
            <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full md:w-48 bg-black/80 text-cyan-400 border border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-cyan-400 cursor-pointer"
            >
                {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
        </div>
      </div>

      {/* منطقة الرسائل */}
      <div className="flex-1 w-full max-w-4xl bg-black/80 border-x border-cyan-500/20 backdrop-blur-sm overflow-y-auto custom-scrollbar p-4 space-y-6 relative">
         {messages.map((msg, i) => {
             const isBot = msg.role === "model";
             return (
                 <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 10, x: isBot ? -10 : 10 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                 >
                     <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl border backdrop-blur-md shadow-lg ${
                         isBot 
                         ? 'bg-cyan-950/30 border-cyan-500/30 rounded-tl-none text-cyan-50' 
                         : 'bg-purple-950/30 border-purple-500/30 rounded-tr-none text-purple-50'
                     }`}>
                         <div className={`text-[9px] font-bold mb-2 uppercase tracking-widest flex items-center gap-1 ${isBot ? 'text-cyan-400' : 'text-purple-400'}`}>
                             {isBot ? <IconCpu size={10}/> : null}
                             {isBot ? "AI CORE" : "OPERATIVE"}
                         </div>
                         <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-mono" dir="auto">{msg.text}</p>
                     </div>
                 </motion.div>
             )
         })}
         
         {loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                 <div className="bg-cyan-950/10 border border-cyan-500/20 p-3 rounded-2xl rounded-tl-none flex gap-2 items-center text-cyan-500 text-xs font-mono animate-pulse">
                     <IconCpu size={16} className="animate-spin" />
                     <span>COMPUTING...</span>
                 </div>
             </motion.div>
         )}
         <div ref={scrollRef} className="h-4" />
      </div>

      {/* منطقة الإدخال */}
      <div className="w-full max-w-4xl bg-[#050505] border border-cyan-500/30 p-4 rounded-b-2xl z-10 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Transmission..." 
            className="flex-1 bg-[#111] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-cyan-500 transition-all font-mono text-sm"
          />
          <button 
            onClick={sendMessage}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-xl transition-all disabled:opacity-50"
          >
              <IconSend size={24} />
          </button>
      </div>
    </div>
  );
}