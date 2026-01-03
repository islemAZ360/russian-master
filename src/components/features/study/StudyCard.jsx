"use client";
import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { IconVolume, IconRotate, IconCheck, IconX } from "@tabler/icons-react";

export function StudyCard({ card, onResult, speak, sessionStats }) {
  const [flipped, setFlipped] = useState(false);
  
  useEffect(() => { setFlipped(false); }, [card]);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  const handleFlip = () => {
      setFlipped(!flipped);
      if(!flipped && speak) setTimeout(() => speak(card.russian), 200);
  };

  const getDynamicFontSize = (text) => {
      if (!text) return "text-6xl";
      const len = text.length;
      if (len > 200) return "text-xl leading-relaxed";
      if (len > 100) return "text-2xl leading-relaxed";
      if (len > 50) return "text-4xl leading-normal";
      if (len > 20) return "text-5xl font-bold";
      return "text-7xl font-black";
  };

  return (
    <div className="perspective-1000 w-full h-full flex flex-col items-center justify-center p-4">
      
      {/* HUD Stats with Variables */}
      <div className="absolute top-4 flex gap-8 z-20 px-8 py-3 rounded-full backdrop-blur-xl shadow-2xl border" 
           style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }}>
         <div className="flex items-center gap-3 font-mono font-bold text-xl text-green-500"><IconCheck size={24} /><span>{sessionStats?.correct || 0}</span></div>
         <div className="w-[1px] h-6 bg-current opacity-20 my-auto"></div>
         <div className="flex items-center gap-3 font-mono font-bold text-xl text-red-500"><IconX size={24} /><span>{sessionStats?.wrong || 0}</span></div>
      </div>

      <motion.div
        style={{ x, y, rotateX, rotateY, cursor: 'pointer' }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.05}
        className="relative w-[95vw] max-w-3xl h-[60vh] md:h-[65vh] group mt-6"
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          
          {/* الوجه الأمامي */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[3rem] border-2 flex flex-col items-center justify-between p-10 overflow-hidden shadow-2xl"
            style={{ 
                backfaceVisibility: "hidden", 
                pointerEvents: flipped ? "none" : "auto",
                backgroundColor: 'var(--bg-card)', // استخدام المتغير
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
            }} 
          >
            {/* Grid Pattern in Light Mode for texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            
            <div className="w-full flex justify-center opacity-70 z-10">
                <span className="text-xs font-black font-mono border px-4 py-1 rounded-full tracking-[0.3em]" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>RUSSIAN</span>
            </div>

            <div className="flex-1 flex items-center justify-center w-full z-10">
                <h1 className={`${getDynamicFontSize(card.russian)} text-center font-sans tracking-tight leading-none drop-shadow-lg`}>
                    {card.russian}
                </h1>
            </div>

            <div className="w-full flex justify-between items-end z-10">
                <IconRotate size={28} className="opacity-40 animate-spin-slow" />
                <button onClick={(e) => { e.stopPropagation(); speak(card.russian); }} className="p-5 rounded-full hover:scale-110 transition-all border group" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                    <IconVolume size={32} style={{ color: 'var(--accent-color)' }} />
                </button>
            </div>
          </div>

          {/* الوجه الخلفي */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[3rem] border-2 flex flex-col items-center justify-between overflow-hidden shadow-2xl" 
            style={{ 
                transform: "rotateY(180deg)", 
                backfaceVisibility: "hidden",
                pointerEvents: flipped ? "auto" : "none",
                backgroundColor: 'var(--bg-card)', // استخدام المتغير
                borderColor: 'var(--accent-color)',
                color: 'var(--text-main)'
            }}
          >
             <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
             
             <div className="w-full p-10 pb-0 flex justify-center opacity-70 z-10">
                 <span className="text-xs font-black font-mono border px-4 py-1 rounded-full tracking-[0.3em]" style={{ borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}>ARABIC</span>
             </div>

             <div className="flex-1 flex items-center justify-center w-full z-10 px-8">
                <h1 className={`${getDynamicFontSize(card.arabic)} font-black text-center dir-rtl leading-tight font-cairo`}>
                    {card.arabic}
                </h1>
             </div>

             <div className="w-full flex h-32 border-t shrink-0 z-50 backdrop-blur-md" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
                 <button onClick={(e) => { e.stopPropagation(); onResult(card.id, false); }} className="flex-1 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 font-black tracking-[0.3em] uppercase border-r text-sm flex flex-col items-center justify-center gap-2 transition-all" style={{ borderColor: 'var(--border-color)' }}>
                    <IconX size={40} /> REPEAT
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); onResult(card.id, true); }} className="flex-1 text-green-500/80 hover:text-green-500 hover:bg-green-500/10 font-black tracking-[0.3em] uppercase text-sm flex flex-col items-center justify-center gap-2 transition-all">
                    <IconCheck size={40} /> MASTER
                 </button>
             </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}