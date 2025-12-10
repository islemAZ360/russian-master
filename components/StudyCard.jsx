"use client";
import React, { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { IconVolume, IconRotate, IconCheck, IconX, IconKeyboard, IconEye } from "@tabler/icons-react";
import confetti from "canvas-confetti";

export function StudyCard({ card, onResult, speak }) {
  const [flipped, setFlipped] = useState(false);
  const [typingMode, setTypingMode] = useState(false);
  const [inputVal, setInputVal] = useState("");

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

  const getFontSize = (text) => {
      if (!text) return "text-4xl";
      const len = text.length;
      if (len > 25) return "text-xl md:text-2xl"; 
      if (len > 15) return "text-2xl md:text-3xl"; 
      return "text-4xl md:text-5xl"; 
  };

  return (
    <div className="perspective-1000 w-full h-[600px] flex flex-col items-center justify-center relative overflow-y-auto custom-scrollbar p-4">
      
      <div className="flex gap-4 mb-8 z-20 shrink-0">
          <button onClick={() => setTypingMode(!typingMode)} className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${typingMode ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-black/40 border-white/10 text-white/40'}`}>
              {typingMode ? <><IconKeyboard size={14} /> Hacker Mode</> : <><IconEye size={14} /> Observer Mode</>}
          </button>
      </div>

      <motion.div
        style={{ x, y, rotateX, rotateY, z: 100, cursor: 'pointer' }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.1}
        className="relative w-full max-w-sm aspect-[3/4] preserve-3d group shrink-0"
        onClick={handleFlip}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full relative preserve-3d"
        >
          
          {/* --- الوجه الروسي (FRONT) --- */}
          {/* تم إزالة backdrop-blur وتغيير الخلفية إلى لون صلب لمنع ظهور الوجه الآخر */}
          <div 
            className="absolute inset-0 backface-hidden rounded-[2rem] border border-cyan-500/20 bg-[#0a0a0a] shadow-[0_0_50px_-10px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center p-6 overflow-hidden"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {/* تأثيرات بصرية */}
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_#06b6d4]"></div>
            <div className="absolute top-4 left-4 w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
            <div className="absolute top-4 right-4 text-[10px] text-cyan-500/50 font-mono tracking-widest">SECURE_DATA</div>

            <div className="flex-1 flex items-center justify-center w-full z-10">
                <h1 className={`${getFontSize(card.russian)} font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] text-center break-words w-full px-2 leading-tight font-mono`}>
                    {card.russian}
                </h1>
            </div>

            {typingMode && !flipped ? (
                 <div className="w-full relative z-30 mt-4" onClick={e => e.stopPropagation()}>
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
                <div className="mt-8 flex flex-col items-center gap-2 opacity-50 shrink-0">
                     <IconRotate size={20} className="text-cyan-400 animate-spin-slow" />
                     <span className="text-[10px] uppercase tracking-widest text-cyan-400">Tap to Decrypt</span>
                </div>
            )}
            
            <button onClick={(e) => { e.stopPropagation(); speak(card.russian); }} className="absolute bottom-6 right-6 p-3 rounded-full bg-white/5 hover:bg-cyan-500 hover:text-black transition-all border border-white/10 z-20">
                <IconVolume size={20} />
            </button>
          </div>

          {/* --- الوجه العربي (BACK) --- */}
          {/* تم إزالة backdrop-blur وتغيير الخلفية إلى لون صلب */}
          <div 
            className="absolute inset-0 backface-hidden rounded-[2rem] border border-purple-500/20 bg-[#0a0510] shadow-[0_0_50px_-10px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center p-6 overflow-hidden" 
            style={{ 
                transform: "rotateY(180deg)", 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden' 
            }}
          >
             <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_10px_#a855f7]"></div>
             <div className="absolute top-4 left-4 text-[10px] text-purple-500/50 font-mono tracking-widest">TRANSLATION_MATRIX</div>
             
             <div className="flex-1 flex items-center justify-center w-full z-10">
                <h1 className={`${getFontSize(card.arabic)} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-300 text-center dir-rtl leading-normal break-words w-full font-cairo tracking-normal`}>
                    {card.arabic}
                </h1>
             </div>

             <div className="absolute bottom-0 left-0 w-full flex h-20 border-t border-white/5 shrink-0 z-20">
                 <button onClick={(e) => {e.stopPropagation(); onResult(card.id, false)}} className="flex-1 bg-red-900/10 hover:bg-red-500/20 text-red-500 font-bold tracking-widest transition-all flex items-center justify-center gap-2 group">
                    <IconX size={18} className="group-hover:scale-125 transition-transform" /> FAIL
                 </button>
                 <div className="w-[1px] bg-white/5"></div>
                 <button onClick={(e) => {e.stopPropagation(); onResult(card.id, true)}} className="flex-1 bg-emerald-900/10 hover:bg-emerald-500/20 text-emerald-500 font-bold tracking-widest transition-all flex items-center justify-center gap-2 group">
                    <IconCheck size={18} className="group-hover:scale-125 transition-transform" /> SUCCESS
                 </button>
             </div>
          </div>

        </motion.div>
      </motion.div>
    </div>
  );
}