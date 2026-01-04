"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  IconVolume, IconRotate, IconCheck, IconX, 
  IconInfoCircle, IconVocabulary, IconPointFilled 
} from "@tabler/icons-react";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * مكون بطاقة الدراسة (StudyCard)
 * تم تطويره ليكون المكون الأكثر ذكاءً واستجابة في نظام التعليم العصبي
 */
export function StudyCard({ card, onResult, speak, sessionStats }) {
  const { t, dir, isRTL } = useLanguage();
  const [flipped, setFlipped] = useState(false);
  
  // تصفير حالة البطاقة عند انتقال النظام لكلمة جديدة
  useEffect(() => { 
      setFlipped(false); 
  }, [card]);

  // إعدادات حركة الـ 3D (Tilt Effect) عند تحريك الماوس أو اللمس
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  /**
   * وظيفة قلب البطاقة مع تشغيل الصوت تلقائياً عند فتح الوجه الروسي
   */
  const handleFlip = () => {
      const nextState = !flipped;
      setFlipped(nextState);
      // إذا انقلبت البطاقة للوجه الروسي (أو كانت أصلاً عليه)، نقوم بالنطق
      if(!nextState && speak) {
          speak(card.russian);
      }
  };

  /**
   * خوارزمية تحديد حجم الخط بناءً على طول النص (Fluid Typography)
   */
  const getDynamicFontSize = (text = "") => {
      const length = text.length;
      if (length > 150) return "text-lg md:text-xl leading-relaxed";
      if (length > 80) return "text-xl md:text-2xl leading-relaxed";
      if (length > 40) return "text-2xl md:text-4xl leading-snug";
      if (length > 20) return "text-4xl md:text-5xl font-black";
      return "text-5xl md:text-7xl font-black";
  };

  if (!card) return null;

  return (
    <div className="perspective-2000 w-full h-full flex flex-col items-center justify-center p-4">
      
      {/* 1. مؤشر التقدم الحي (Live Session HUD) */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 flex items-center gap-6 z-30 px-8 py-3 rounded-2xl bg-[#0a0a0a]/80 border border-white/10 backdrop-blur-xl shadow-2xl"
      >
         <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="font-mono font-black text-emerald-500 text-lg">{sessionStats?.correct || 0}</span>
         </div>
         <div className="w-px h-4 bg-white/10"></div>
         <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-red-500 rounded-full"></div>
             <span className="font-mono font-black text-red-500 text-lg">{sessionStats?.wrong || 0}</span>
         </div>
      </motion.div>

      {/* 2. جسم البطاقة الذكي (The Card Body) */}
      <motion.div
        style={{ x, y, rotateX, rotateY, cursor: 'pointer' }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.08}
        whileTap={{ scale: 0.98 }}
        className="relative w-full max-w-3xl h-[55vh] md:h-[60vh] group mt-8"
        onClick={handleFlip}
      >
        <motion.div
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 25 }}
          className="w-full h-full relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          
          {/* --- الوجه الأمامي (Russian Face) --- */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[3.5rem] border-2 flex flex-col items-center justify-between p-10 overflow-hidden shadow-2xl transition-colors duration-500"
            style={{ 
                backfaceVisibility: "hidden", 
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
            }} 
          >
            {/* زخرفة تقنية خلفية */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            
            <div className="w-full flex justify-between items-center z-10 opacity-40">
                <span className="text-[10px] font-black font-mono tracking-[0.4em] uppercase">Neural_Input</span>
                <IconVocabulary size={20} />
            </div>

            <div className="flex-1 flex items-center justify-center w-full z-10 px-4 text-center">
                <motion.h1 
                    layout
                    className={`${getDynamicFontSize(card.russian)} tracking-tight leading-tight drop-shadow-2xl`}
                >
                    {card.russian}
                </motion.h1>
            </div>

            <div className="w-full flex justify-between items-end z-10">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">Protocol</span>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <IconPointFilled key={i} size={12} className={i < (card.level || 0) ? "text-cyan-500" : "text-white/10"} />
                        ))}
                    </div>
                </div>
                
                <button 
                    onClick={(e) => { e.stopPropagation(); speak(card.russian); }} 
                    className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-cyan-500 hover:text-white transition-all active:scale-90 group/btn"
                >
                    <IconVolume size={32} className="transition-transform group-hover/btn:scale-110" />
                </button>
            </div>
          </div>

          {/* --- الوجه الخلفي (Arabic/Target Face) --- */}
          <div 
            className="absolute inset-0 w-full h-full rounded-[3.5rem] border-2 flex flex-col items-center justify-between overflow-hidden shadow-2xl" 
            style={{ 
                transform: "rotateY(180deg)", 
                backfaceVisibility: "hidden",
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--text-main)'
            }}
          >
             <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
             
             <div className="w-full p-10 pb-0 flex justify-between items-center z-10 opacity-40">
                 <IconInfoCircle size={20} />
                 <span className="text-[10px] font-black font-mono tracking-[0.4em] uppercase">Neural_Output</span>
             </div>

             <div className="flex-1 flex items-center justify-center w-full z-10 px-10 text-center">
                <h1 className={`${getDynamicFontSize(card.arabic)} font-black leading-tight font-cairo drop-shadow-xl`} dir="auto">
                    {card.arabic}
                </h1>
             </div>

             {/* أزرار القرار (Decision Matrix) */}
             <div className="w-full flex h-32 border-t border-white/5 shrink-0 z-50 backdrop-blur-md bg-white/[0.01]">
                 <button 
                    onClick={(e) => { e.stopPropagation(); onResult(false); }} 
                    className="flex-1 group/btn flex flex-col items-center justify-center gap-2 hover:bg-red-500/10 transition-all border-r border-white/5"
                 >
                    <IconX size={32} className="text-red-500 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500/60 group-hover/btn:text-red-500">
                        {t('archive_delete')}
                    </span>
                 </button>
                 
                 <button 
                    onClick={(e) => { e.stopPropagation(); onResult(true); }} 
                    className="flex-1 group/btn flex flex-col items-center justify-center gap-2 hover:bg-emerald-500/10 transition-all"
                 >
                    <IconCheck size={32} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-500/60 group-hover/btn:text-emerald-500">
                        {t('archive_add_btn')}
                    </span>
                 </button>
             </div>
          </div>

        </motion.div>
      </motion.div>

      {/* 3. تذييل البطاقة (Card Footer Hint) */}
      <div className="mt-8 flex items-center gap-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <IconRotate size={16} className="animate-spin-slow" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Tap_to_Flip_Neural_Node</span>
      </div>
    </div>
  );
}