"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { IconRobot, IconSend, IconCpu, IconAlertTriangle } from "@tabler/icons-react";

// مفتاحك
const API_KEY = "AIzaSyDi8-POg6RGCoBCkni6_8XNikJvTmH4z3M";

export default function AITutor({ user }) {
  const userName = user?.email?.split('@')[0] || 'Operative';
  
  // الحالة لتخزين اسم الموديل الذي سنجده تلقائياً
  const [activeModel, setActiveModel] = useState(null);
  
  const [messages, setMessages] = useState([
    { role: "model", text: `Initializing Neural Link...\nScanning for available AI Cores...` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // 1. البحث التلقائي عن الموديل الصحيح عند فتح الصفحة
  useEffect(() => {
    const findBestModel = async () => {
      try {
        // نطلب من جوجل قائمة الموديلات
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await res.json();
        
        if (data.error) throw new Error(data.error.message);

        // نبحث عن الموديلات التي تدعم الشات (generateContent)
        const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        
        // نحاول العثور على Flash لأنه الأسرع، وإلا نأخذ Pro، وإلا نأخذ أي واحد متاح
        let bestModel = chatModels.find(m => m.name.includes("flash")) || 
                        chatModels.find(m => m.name.includes("pro")) || 
                        chatModels[0];

        if (bestModel) {
          // ملاحظة: الاسم يأتي بصيغة models/gemini-pro ونحن نحتاجه كما هو
          setActiveModel(bestModel.name); 
          setMessages(prev => [
            { role: "model", text: `System Online. Connected to Core: [${bestModel.displayName}].\nWelcome, ${userName}. State your objective.` }
          ]);
        } else {
          throw new Error("No chat models found.");
        }

      } catch (err) {
        setMessages(prev => [{ role: "model", text: `⚠️ Critical Error: Could not find any AI Core. (${err.message})` }]);
      }
    };

    findBestModel();
  }, []);

  // التمرير التلقائي
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !activeModel) return;

    const userMsg = input;
    setInput(""); 
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      // نستخدم activeModel الذي جلبناه تلقائياً من جوجل
      // الرابط لا يحتاج لكلمة models/ إضافية لأن الاسم المخزن يحتوي عليها
      const url = `https://generativelanguage.googleapis.com/v1beta/${activeModel}:generateContent?key=${API_KEY}`;

      const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ 
                text: `You are "Russian Master AI". User: ${userMsg}. Reply concisely in Russian then English.` 
              }]
            }]
          }),
        }
      );

      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const botReply = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { role: "model", text: botReply }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "model", text: `⚠️ Error: ${err.message}` }]);
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
            <p className="text-[10px] text-cyan-400/60 font-mono uppercase">
                {activeModel ? `LINKED: ${activeModel.replace('models/', '').toUpperCase()}` : "SCANNING..."}
            </p>
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
                     <span>PROCESSING...</span>
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
            disabled={!activeModel} // نمنع الكتابة حتى يتم العثور على موديل
            placeholder={activeModel ? "Transmission..." : "Initializing..."} 
            className="flex-1 bg-[#111] border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-cyan-500 transition-all font-mono text-sm disabled:opacity-50"
          />
          <button 
            onClick={sendMessage}
            disabled={loading || !activeModel}
            className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-xl transition-all disabled:opacity-50"
          >
              <IconSend size={24} />
          </button>
      </div>
    </div>
  );
}