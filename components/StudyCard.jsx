"use client";
import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { IconVolume, IconRotate, IconCheck, IconX, IconKeyboard, IconEye } from "@tabler/icons-react";
import confetti from "canvas-confetti";

export function StudyCard({ card, onResult, speak, sessionStats }) {
  const [flipped, setFlipped] = useState(false);
  const [typingMode, setTypingMode] = useState(false);
  const [inputVal, setInputVal] = useState("");

  // إعادة ضبط البطاقة عند تغيير البيانات
  useEffect(() => {
    setFlipped(false);
    setInputVal("");
  }, [card]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleFlip = () => {
      if(typingMode && !flipped) return; 
      setFlipped(!flipped);
      if(!flipped && speak) setTimeout(() => speak(card.russian), 200);
  };

  const checkAnswer = (e) => {
      e.preventDefault();
      if(inputVal.trim().toLowerCase() === card.russian.toLowerCase()){
          confetti();
          setFlipped(true);
      } else {
          const form = document.getElementById('typing-form');
          form?.classList.add('animate-shake');
          setTimeout(() => form?.classList.remove('animate-shake'), 500);
      }
  };

  // --- دالة ذكية لحجم الخط (Fix Font Size) ---
  const getFontSize = (text) => {
      if (!text) return "text-4xl";
      const len = text.length;
      // إذا الكلمة طويلة جداً (مثل: Достопримечательности) صغر الخط جداً
      if (len > 14) return "text-2xl md:text-3xl"; 
      // متوسطة
      if (len > 9) return "text-3xl md:text-4xl"; 
      // قصيرة
      return "text-5xl md:text-6xl"; 
  };

  return (
    <div className="perspective-1000 w-full h-[600px] flex flex-col items-center justify-center relative overflow-visible p-4">
      
      {/* --- شريط العداد (Session Stats) --- */}
      <div className="flex gap-6 mb-6 z-20 shrink-0 bg-black/60 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-4">
         <div className="flex items-center gap-3 text-emerald-400 font-mono font-bold text-lg">
            <IconCheck size={20} stroke={3} />
            <span>{sessionStats?.correct || 0}</span>
         </div>
         <div className="w-[1px] h-6 bg-white/20"></div>
         <div className="flex items-center gap-3 text-red-500 font-mono font-bold text-lg">
            <IconX size={20} stroke={3} />
            <span>{sessionStats?.wrong || 0}</span>
         </div>
      </div>

      {/* --- أزرار التحكم في الوضع --- */}
      <div className="flex gap-4 mb-4 z-20 shrink-0">
          <button onClick={() => setTypingMode(!typingMode)} className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${typingMode ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-black/40 border-white/10 text-white/40'}`}>
              {typingMode ? <><IconKeyboard size={14} /> Hacker Mode</> : <><IconEye size={14} /> Observer Mode</>}
          </button>
      </div>

      <motion.div
        style={{ x, y, rotateX, rotateY, z: 100, cursor: 'pointer' }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        className="relative w-full max-w-sm aspect-[3/4] group shrink-0"
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          
          {/* ========================================================= */}
          {/* الوجه الأمامي (الروسي) */}
          {/* ========================================================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[2rem] border border-cyan-500/30 bg-[#0a0a0a] shadow-[0_0_60px_-10px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center p-4 overflow-hidden"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} 
          >
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_#06b6d4]"></div>
            <div className="absolute top-4 right-4 text-[10px] text-cyan-500/50 font-mono tracking-widest">SECURE_DATA</div>

            <div className="flex-1 flex flex-col items-center justify-center w-full z-10 px-2">
                {/* 
                    التعديلات هنا:
                    - whitespace-nowrap: لمنع نزول الكلمة لسطر جديد
                    - getFontSize: لضبط الحجم
                */}
                <h1 className={`${getFontSize(card.russian)} font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] text-center w-full leading-tight font-sans tracking-wide whitespace-nowrap`}>
                    {card.russian}
                </h1>
            </div>

            {typingMode && !flipped ? (
                 <div className="w-full relative z-30 mt-4 px-4" onClick={e => e.stopPropagation()}>
                    <form id="typing-form" onSubmit={checkAnswer}>
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Type translation..." 
                            className="w-full bg-cyan-900/10 border border-cyan-500/30 rounded-xl py-3 px-4 text-center text-cyan-400 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                        />
                    </form>
                 </div>
            ) : (
                <div className="mb-8 flex flex-col items-center gap-2 opacity-40 shrink-0">
                     <IconRotate size={24} className="text-cyan-400 animate-spin-slow" />
                     <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Tap to Decrypt</span>
                </div>
            )}
            
            <button onClick={(e) => { e.stopPropagation(); speak(card.russian); }} className="absolute bottom-6 right-6 p-3 rounded-full bg-white/5 hover:bg-cyan-500 hover:text-black transition-all border border-white/10 z-20">
                <IconVolume size={20} />
            </button>
          </div>

          {/* ========================================================= */}
          {/* الوجه الخلفي (العربي) */}
          {/* ========================================================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[2rem] border border-purple-500/30 bg-[#0a0510] shadow-[0_0_60px_-10px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center p-4 overflow-hidden" 
            style={{ 
                transform: "rotateY(180deg)", 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden" 
            }}
          >
             <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_10px_#a855f7]"></div>
             <div className="absolute top-4 left-4 text-[10px] text-purple-500/50 font-mono tracking-widest">TRANSLATION_MATRIX</div>
             
             <div className="flex-1 flex items-center justify-center w-full z-10 px-2">
                <h1 className={`${getFontSize(card.arabic)} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-300 text-center dir-rtl leading-normal w-full font-cairo tracking-normal`}>
                    {card.arabic}
                </h1>
             </div>

             {/* أزرار الإجابة - تم التأكد من stopPropagation */}
             <div className="absolute bottom-0 left-0 w-full flex h-20 border-t border-white/10 shrink-0 z-50 bg-black/20 backdrop-blur-sm">
                 <button 
                    onClick={(e) => {
                        e.stopPropagation(); // منع قلب البطاقة
                        onResult(card.id, false); // استدعاء دالة الخطأ
                    }} 
                    className="flex-1 text-red-500 hover:bg-red-500/10 font-bold tracking-widest transition-all flex items-center justify-center gap-2 group text-sm"
                 >
                    <IconX size={20} className="group-hover:scale-125 transition-transform" /> FAIL
                 </button>
                 
                 <div className="w-[1px] bg-white/10"></div>
                 
                 <button 
                    onClick={(e) => {
                        e.stopPropagation(); // منع قلب البطاقة
                        onResult(card.id, true); // استدعاء دالة الصح
                    }} 
                    className="flex-1 text-emerald-500 hover:bg-emerald-500/10 font-bold tracking-widest transition-all flex items-center justify-center gap-2 group text-sm"
                 >
                    <IconCheck size={20} className="group-hover:scale-125 transition-transform" /> SUCCESS
                 </button>
             </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}