"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IconRobot, IconSend, IconCpu } from "@tabler/icons-react";

// مفتاحك المباشر
const API_KEY = "AIzaSyDi8-POg6RGCoBCkni6_8XNikJvTmH4z3M";

export default function AITutor({ user }) {
  const userName = user?.email?.split('@')[0] || 'Operative';
  
  // الحالة الافتراضية للرسائل
  const [messages, setMessages] = useState([
    { role: "model", text: `System Online.\nWelcome, ${userName}. Select AI Core and state objective.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // التمرير التلقائي
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput(""); // تفريغ الحقل
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      // --- هنا السر: نستخدم الرابط المباشر مثل ملف HTML تماماً ---
      // هذا يتجاوز مشاكل المكتبة
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { 
                    // نرسل التوجيه (System Prompt) مع رسالة المستخدم في كل مرة لضمان السياق
                    text: `You are "Russian Master AI", a Cyberpunk Russian Tutor. 
                           User Message: ${userMsg}
                           Reply concisely in Russian then English.` 
                  }
                ]
              }
            ]
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      // استخراج النص من الرد الخام
      const botReply = data.candidates[0].content.parts[0].text;
      
      setMessages(prev => [...prev, { role: "model", text: botReply }]);

    } catch (err) {
      console.error("Fetch Error:", err);
      setMessages(prev => [...prev, { role: "model", text: `⚠️ Critical Error: ${err.message || "Connection Failed"}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-24 md:pb-4 relative overflow-hidden font-sans">
      
      {/* رأس الشات */}
      <div className="w-full max-w-4xl bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-t-2xl flex items-center gap-4 backdrop-blur-md z-10">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-cyan-400 shadow-[0_0_10px_#06b6d4]">
            <IconRobot size={28} className="text-cyan-400 animate-pulse" />
        </div>
        <div>
            <h2 className="text-xl font-black text-white tracking-widest">AI MENTOR</h2>
            <p className="text-[10px] text-cyan-400/60 font-mono uppercase">Direct HTTP Mode</p>
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
                     <span>ESTABLISHING UPLINK...</span>
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