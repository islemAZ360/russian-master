"use client";
import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { IconVolume, IconRotate, IconCheck, IconX, IconKeyboard, IconEye } from "@tabler/icons-react";
import confetti from "canvas-confetti";

export function StudyCard({ card, onResult, speak, sessionStats }) {
  const [flipped, setFlipped] = useState(false);
  const [typingMode, setTypingMode] = useState(false);
  const [inputVal, setInputVal] = useState("");
  
  // إعادة تعيين البطاقة عند تغيير المحتوى
  useEffect(() => {
    setFlipped(false);
    setInputVal("");
  }, [card]);

  // إعدادات الحركة ثلاثية الأبعاد (3D Tilt)
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
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setFlipped(true);
      } else {
          const form = document.getElementById('typing-form');
          form?.classList.add('animate-shake');
          setTimeout(() => form?.classList.remove('animate-shake'), 500);
      }
  };

  /**
   * دالة ذكية لتحديد حجم الخط بناءً على طول النص
   * تضمن عدم خروج النص عن حدود البطاقة
   */
  const getDynamicFontSize = (text) => {
      if (!text) return "text-3xl";
      const len = text.length;

      if (len > 150) return "text-sm leading-relaxed";    // فقرات طويلة جداً
      if (len > 100) return "text-base leading-relaxed";  // جمل طويلة جداً
      if (len > 60) return "text-lg leading-normal";      // جمل طويلة
      if (len > 30) return "text-xl leading-normal";      // جمل متوسطة
      if (len > 15) return "text-2xl font-bold";          // كلمات طويلة
      return "text-4xl md:text-5xl font-black";           // كلمات قصيرة
  };

  return (
    <div className="perspective-1000 w-full h-[600px] flex flex-col items-center justify-center relative p-4">
      
      {/* شريط الإحصائيات العائم (HUD) */}
      <div className="absolute top-0 flex gap-6 z-20 bg-black/60 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md shadow-2xl">
         <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-lg">
            <IconCheck size={18} stroke={3} />
            <span>{sessionStats?.correct || 0}</span>
         </div>
         <div className="w-[1px] h-5 bg-white/20 my-auto"></div>
         <div className="flex items-center gap-2 text-red-500 font-mono font-bold text-lg">
            <IconX size={18} stroke={3} />
            <span>{sessionStats?.wrong || 0}</span>
         </div>
      </div>

      <motion.div
        style={{ x, y, rotateX, rotateY, z: 100, cursor: 'pointer' }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        className="relative w-full max-w-sm aspect-[3/4] group mt-10"
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          
          {/* ========================================================= */}
          {/* الوجه الأمامي (الروسي) */}
          {/* ========================================================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[2rem] border border-cyan-500/30 bg-[#0a0a0a] shadow-[0_0_60px_-15px_rgba(6,182,212,0.2)] flex flex-col items-center justify-between p-6 overflow-hidden"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }} 
          >
            {/* طبقات الخلفية والزخرفة */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_#06b6d4]"></div>
            
            {/* Header */}
            <div className="w-full flex justify-between items-start z-10 opacity-60">
                <div className="text-[9px] font-mono text-cyan-400 tracking-widest border border-cyan-500/30 px-2 py-0.5 rounded">RUS</div>
                <div className="text-[9px] font-mono text-white tracking-widest">SECURE_DATA_PACKET</div>
            </div>

            {/* Content Container (الوسط) */}
            <div className="flex-1 flex flex-col items-center justify-center w-full z-10 my-4 overflow-hidden">
                <h1 className={`${getDynamicFontSize(card.russian)} text-white text-center w-full font-sans tracking-wide break-words whitespace-pre-wrap px-2 drop-shadow-lg`}>
                    {card.russian}
                </h1>

                {/* وضع الكتابة (Hacker Mode) */}
                {typingMode && !flipped && (
                    <div className="w-full mt-6" onClick={e => e.stopPropagation()}>
                        <form id="typing-form" onSubmit={checkAnswer}>
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Decrypt translation..." 
                                className="w-full bg-cyan-950/30 border border-cyan-500/30 rounded-lg py-3 px-4 text-center text-cyan-400 placeholder:text-cyan-800/50 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/40 transition-all font-mono text-sm"
                                value={inputVal}
                                onChange={(e) => setInputVal(e.target.value)}
                            />
                        </form>
                    </div>
                )}
            </div>

            {/* Footer & Controls */}
            <div className="w-full flex justify-between items-end z-10">
                <div className="flex flex-col items-center gap-2 opacity-40">
                     <IconRotate size={20} className="text-cyan-400 animate-spin-slow" />
                     <span className="text-[8px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Flip Card</span>
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); speak(card.russian); }} 
                    className="p-3 rounded-full bg-cyan-900/20 hover:bg-cyan-500 hover:text-black transition-all border border-cyan-500/30 group"
                >
                    <IconVolume size={20} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* الوجه الخلفي (العربي) */}
          {/* ========================================================= */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[2rem] border border-purple-500/30 bg-[#0a0510] shadow-[0_0_60px_-15px_rgba(168,85,247,0.2)] flex flex-col items-center justify-between overflow-hidden" 
            style={{ 
                transform: "rotateY(180deg)", 
                backfaceVisibility: "hidden", 
                WebkitBackfaceVisibility: "hidden" 
            }}
          >
             {/* طبقات الخلفية */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
             <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_#a855f7]"></div>
             
             {/* Header */}
             <div className="w-full p-6 pb-0 flex justify-between items-start z-10 opacity-60">
                 <div className="text-[9px] font-mono text-purple-400 tracking-widest border border-purple-500/30 px-2 py-0.5 rounded">ARA</div>
                 <div className="text-[9px] font-mono text-white tracking-widest">DECRYPTED</div>
             </div>

             {/* Content Container (الوسط) */}
             <div className="flex-1 flex items-center justify-center w-full z-10 px-6 overflow-hidden">
                <h1 className={`${getDynamicFontSize(card.arabic)} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-300 text-center dir-rtl leading-normal w-full font-cairo tracking-normal break-words whitespace-pre-wrap`}>
                    {card.arabic}
                </h1>
             </div>

             {/* Action Bar (Buttons) */}
             <div className="w-full flex h-20 border-t border-white/10 shrink-0 z-50 bg-black/40 backdrop-blur-md">
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onResult(card.id, false);
                    }} 
                    className="flex-1 text-red-500 hover:bg-red-500/10 hover:text-red-400 font-bold tracking-widest transition-all flex flex-col items-center justify-center gap-1 group text-[10px] border-r border-white/5 uppercase"
                 >
                    <IconX size={24} className="group-hover:scale-125 transition-transform mb-1" />
                    Needs Review
                 </button>
                 
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onResult(card.id, true);
                    }} 
                    className="flex-1 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 font-bold tracking-widest transition-all flex flex-col items-center justify-center gap-1 group text-[10px] uppercase"
                 >
                    <IconCheck size={24} className="group-hover:scale-125 transition-transform mb-1" />
                    Mastered
                 </button>
             </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}