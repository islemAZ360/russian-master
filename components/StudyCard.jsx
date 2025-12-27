"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { IconVolume, IconRotate, IconCheck, IconX, IconKeyboard, IconEye } from "@tabler/icons-react";
import confetti from "canvas-confetti";

export function StudyCard({ card, onResult, speak, sessionStats }) {
  const [flipped, setFlipped] = useState(false);
  const [typingMode, setTypingMode] = useState(false);
  const [inputVal, setInputVal] = useState("");
  
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
          document.getElementById('typing-form')?.classList.add('animate-shake');
          setTimeout(() => document.getElementById('typing-form')?.classList.remove('animate-shake'), 500);
      }
  };

  // --- دالة الحجم الديناميكي الذكية ---
  const getDynamicFontSize = (text) => {
      if (!text) return "text-2xl";
      const length = text.length;
      if (length > 100) return "text-sm leading-relaxed"; // جمل طويلة جداً
      if (length > 60) return "text-lg leading-relaxed"; // جمل طويلة
      if (length > 30) return "text-xl leading-normal";  // جمل متوسطة
      if (length > 15) return "text-2xl leading-tight";  // كلمات طويلة
      return "text-4xl md:text-5xl font-black";         // كلمات قصيرة (العناوين)
  };

  return (
    <div className="perspective-1000 w-full h-[600px] flex flex-col items-center justify-center relative p-4">
      
      {/* شريط الإحصائيات العائم */}
      <div className="absolute top-0 flex gap-8 z-20 bg-black/80 border border-white/10 px-8 py-3 rounded-full backdrop-blur-md shadow-2xl">
         <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xl">
            <IconCheck size={22} stroke={3} />
            <span>{sessionStats?.correct || 0}</span>
         </div>
         <div className="w-[1px] h-6 bg-white/20"></div>
         <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-xl">
            <IconX size={22} stroke={3} />
            <span>{sessionStats?.wrong || 0}</span>
         </div>
      </div>

      <motion.div
        style={{ x, y, rotateX, rotateY, z: 100, cursor: 'pointer' }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        className="relative w-full max-w-md aspect-[3/4] group mt-16"
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          
          {/* --- الوجه الأمامي (الروسي) --- */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[2rem] border border-cyan-500/40 bg-[#0a0a0a] shadow-[0_0_80px_-20px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center p-8 overflow-hidden"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} 
          >
            {/* تصميم الخلفية التقني */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_20px_#06b6d4]"></div>
            <div className="absolute top-6 right-6 flex items-center gap-2 text-[10px] text-cyan-500/60 font-mono tracking-widest border border-cyan-500/20 px-2 py-1 rounded">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                SECURE_DATA
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full z-10 text-center break-words">
                <h1 className={`${getDynamicFontSize(card.russian)} text-white drop-shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300`}>
                    {card.russian}
                </h1>
            </div>

            <div className="mt-auto mb-4 flex flex-col items-center gap-3 opacity-50 shrink-0">
                 <IconRotate size={24} className="text-cyan-400 animate-spin-slow" />
                 <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold">Tap to Decrypt</span>
            </div>
            
            <button onClick={(e) => { e.stopPropagation(); speak(card.russian); }} className="absolute bottom-6 right-6 p-4 rounded-full bg-cyan-900/20 hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/30 z-20 group">
                <IconVolume size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* --- الوجه الخلفي (العربي) --- */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[2rem] border border-purple-500/40 bg-[#08050c] shadow-[0_0_80px_-20px_rgba(168,85,247,0.3)] flex flex-col items-center justify-center p-8 overflow-hidden" 
            style={{ 
                transform: "rotateY(180deg)", 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden" 
            }}
          >
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
             <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_20px_#a855f7]"></div>
             <div className="absolute top-6 left-6 text-[10px] text-purple-500/60 font-mono tracking-widest border border-purple-500/20 px-2 py-1 rounded">TRANSLATED</div>
             
             <div className="flex-1 flex items-center justify-center w-full z-10 text-center break-words px-4">
                <h1 className={`${getDynamicFontSize(card.arabic)} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 dir-rtl font-cairo`}>
                    {card.arabic}
                </h1>
             </div>

             <div className="absolute bottom-0 left-0 w-full flex h-24 border-t border-white/10 shrink-0 z-50 bg-black/40 backdrop-blur-xl">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onResult(card.id, false); }} 
                    className="flex-1 text-red-500 hover:bg-red-500/20 font-black tracking-[0.2em] transition-all flex flex-col items-center justify-center gap-1 group text-xs border-r border-white/5 hover:border-red-500/50"
                 >
                    <IconX size={28} className="group-hover:scale-125 transition-transform mb-1" /> 
                    FAILED
                 </button>
                 
                 <button 
                    onClick={(e) => { e.stopPropagation(); onResult(card.id, true); }} 
                    className="flex-1 text-emerald-400 hover:bg-emerald-500/20 font-black tracking-[0.2em] transition-all flex flex-col items-center justify-center gap-1 group text-xs hover:border-emerald-500/50"
                 >
                    <IconCheck size={28} className="group-hover:scale-125 transition-transform mb-1" /> 
                    MASTERED
                 </button>
             </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}