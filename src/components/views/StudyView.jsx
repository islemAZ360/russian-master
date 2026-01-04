"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconInfinity, IconCpu, IconArrowLeft, 
  IconBolt, IconAlertTriangle, IconCheck 
} from '@tabler/icons-react';
import { StudyCard } from '@/components/features/study/StudyCard';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * شاشة الدراسة المركزية (StudyView)
 * المحرك المسؤول عن إدارة جلسة التعلم، عداد الكومبو، والتغذية الراجعة البصرية
 */
export default function StudyView({ 
  currentCard, sessionStats, handleSwipe, setSessionStats, playSFX, speak 
}) {
  const { setCurrentView } = useUI();
  const { t, dir, isRTL } = useLanguage();
  
  // --- حالات الحالة المحلية (Local Logic) ---
  const [combo, setCombo] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState([]);

  /**
   * وظيفة لتوليد نصوص طافية (XP / Glitch) لتعزيز التجربة البصرية
   */
  const spawnFloatingEffect = useCallback((text, type) => {
      const id = Date.now();
      const randomX = Math.random() * 100 - 50; // تحرك عشوائي لليسار أو اليمين
      setFloatingTexts(prev => [...prev, { id, text, type, x: randomX }]);
      
      // إزالة النص من الذاكرة بعد ثانية واحدة
      setTimeout(() => {
          setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 1000);
  }, []);

  /**
   * معالجة نتيجة الإجابة (Master / Repeat)
   */
  const handleResult = (known) => {
      if (known) {
          // حالة النجاح
          const newCombo = combo + 1;
          setCombo(newCombo);
          setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
          
          if (playSFX) playSFX('success');
          spawnFloatingEffect(`+10 ${t('profile_exp')}`, "success");
      } else {
          // حالة الخطأ أو النسيان
          setCombo(0);
          setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
          
          if (playSFX) playSFX('error');
          spawnFloatingEffect("NEURAL_GLITCH", "error");
      }

      // تمرير القرار إلى نظام الـ SRS (Spaced Repetition System)
      // تأخير بسيط للسماح للأنيميشن بالظهور
      setTimeout(() => {
          handleSwipe(known ? 'right' : 'left');
      }, 200);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative pb-40" dir={dir}>
        
        {/* 1. طبقة المؤثرات العائمة (Floating Visuals Layer) */}
        <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
            <AnimatePresence>
                {floatingTexts.map(ft => (
                    <motion.div 
                        key={ft.id} 
                        initial={{ opacity: 0, y: 0, x: ft.x, scale: 0.5 }} 
                        animate={{ opacity: 1, y: -150, scale: 1.5 }} 
                        exit={{ opacity: 0 }} 
                        className={`absolute font-black text-3xl italic drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] z-[101] 
                            ${ft.type === 'success' ? 'text-yellow-400' : 'text-red-500'}`}
                    >
                        {ft.text}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

        {/* 2. عداد الكومبو (Streak Multiplier) */}
        <AnimatePresence>
            {combo > 1 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 1.5 }}
                    key={combo} 
                    className="absolute top-20 text-center z-20"
                >
                    <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-orange-600 drop-shadow-2xl italic tracking-tighter uppercase">
                        {combo}x STREAK
                    </div>
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-2 animate-pulse"></div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* 3. العرض الرئيسي (Main Operations) */}
        {currentCard ? (
            <div className="relative z-10 flex flex-col items-center w-full max-w-5xl">
                {/* شارة حالة المزامنة */}
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="mb-6 flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5"
                >
                    <IconInfinity size={18} className="text-cyan-500 animate-pulse" />
                    <span className="text-[9px] font-black font-mono tracking-[0.3em] uppercase text-white/40">
                        Neural_Link_Established
                    </span>
                </motion.div>

                {/* استدعاء البطاقة المطورة */}
                <StudyCard 
                    card={currentCard} 
                    sessionStats={sessionStats} 
                    onResult={handleResult} 
                    speak={speak} 
                />
            </div>
        ) : (
            /* 4. شاشة نهاية الجلسة (Completion State) */
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-12 bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] max-w-md mx-4"
            >
                <div className="w-24 h-24 bg-cyan-600/10 border border-cyan-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <IconCpu size={56} className="text-cyan-500 animate-pulse" />
                </div>
                
                <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">
                    Data_Synced
                </h2>
                <p className="text-white/40 text-sm leading-relaxed mb-10 font-medium">
                    All neural packets for this module have been processed. Systems are stable.
                </p>

                <button 
                    onClick={() => setCurrentView('home')} 
                    className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-900/20 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95"
                >
                    <IconArrowLeft size={18} />
                    {t('nav_home')}
                </button>
            </motion.div>
        )}

        {/* 5. تذييل الصفحة الديكوري */}
        <div className="absolute bottom-10 flex items-center gap-4 opacity-5 pointer-events-none select-none">
            <IconBolt size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.6em]">Deep_Focus_Protocol_v4.0</span>
            <IconBolt size={14} />
        </div>
    </div>
  );
}