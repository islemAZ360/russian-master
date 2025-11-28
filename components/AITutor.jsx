"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IconRobot, IconSend, IconCpu, IconSettings } from "@tabler/icons-react";

// قائمة الموديلات المتاحة
const AI_MODELS = [
  { id: "gemini-1.5-flash", name: "⚡ FLASH V1.5 (Fast)" },
  { id: "gemini-1.5-pro", name: "🧠 PRO V1.5 (Smart)" },
  { id: "gemini-2.0-flash-exp", name: "🚀 FLASH V2.0 (Exp)" },
];

export default function AITutor({ user }) {
  const userName = user?.email?.split('@')[0] || 'Operative';
  
  // حالة الموديل المختار
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");

  const [messages, setMessages] = useState([
    { role: "model", text: `Neural Link Established.\nWelcome, ${userName}. Select your AI Core and state the objective.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // التعديل هنا: نرسل الموديل المختار مع الرسالة
        body: JSON.stringify({ 
            message: userMsg, 
            history: historyPayload.slice(-10),
            modelName: selectedModel 
        })
      });

      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: "model", text: data.reply }]);
      } else {
        throw new Error("No response");
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: "model", text: "⚠️ Error: Core unstable. Try switching models." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 pb-24 md:pb-4 relative overflow-hidden font-sans">
      
      {/* رأس الشات + اختيار الموديل */}
      <div className="w-full max-w-4xl bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-t-2xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md z-10 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-cyan-400 shadow-[0_0_10px_#06b6d4]">
                <IconRobot size={28} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
                <h2 className="text-xl font-black text-white tracking-widest flex items-center gap-2">
                    AI MENTOR
                </h2>
                <p className="text-[10px] text-cyan-400/60 font-mono uppercase tracking-[0.2em]">System Online</p>
            </div>
        </div>

        {/* قائمة اختيار الموديل بتصميم Cyberpunk */}
        <div className="relative group w-full md:w-auto">
            <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <select 
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="relative w-full md:w-48 bg-black/80 text-cyan-400 border border-cyan-500/50 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-cyan-400 cursor-pointer appearance-none hover:bg-black"
            >
                {AI_MODELS.map(m => (
                    <option key={m.id} value={m.id} className="bg-black text-white">{m.name}</option>
                ))}
            </select>
            {/* أيقونة الترس للزينة */}
            <IconSettings size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-500 pointer-events-none"/>
        </div>

      </div>

      {/* منطقة الرسائل */}
      <div className="flex-1 w-full max-w-4xl bg-black/80 border-x border-cyan-500/20 backdrop-blur-sm overflow-y-auto custom-scrollbar p-4 space-y-6 relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
         
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
                             {isBot ? selectedModel.toUpperCase() : "OPERATIVE"}
                         </div>
                         <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base font-mono" dir="auto">
                            {msg.text}
                         </p>
                     </div>
                 </motion.div>
             )
         })}
         
         {loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                 <div className="bg-cyan-950/10 border border-cyan-500/20 p-3 rounded-2xl rounded-tl-none flex gap-2 items-center text-cyan-500 text-xs font-mono animate-pulse">
                     <IconCpu size={16} className="animate-spin" />
                     <span>CORE {selectedModel.split('-')[1]} COMPUTING...</span>
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
            className="flex-1 bg-[#111] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all font-mono text-sm"
          />
          <button 
            onClick={sendMessage}
            disabled={loading}
            className="bg-gradient-to-br from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white p-4 rounded-xl transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_20px_rgba(6,182,212,0.3)] group"
          >
              <IconSend size={24} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </button>
      </div>

    </div>
  );
}