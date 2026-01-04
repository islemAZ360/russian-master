"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRAVITY_DATA } from '@/data/games/gravityData';
import { 
  IconArrowLeft, IconCheck, IconX, IconLock, 
  IconLockOpen, IconDatabase, IconTarget 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * لعبة بروتوكول الجاذبية (Gravity Protocol)
 * نظام إكمال الجمل عبر سحب "وحدات البيانات" إلى الموقع الصحيح
 */
export default function GravityProtocol({ onClose }) {
  const { t, dir, isRTL } = useLanguage();
  
  // --- حالات اللعبة ---
  const [level, setLevel] = useState(0);
  const [floorOrbs, setFloorOrbs] = useState([]); 
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isBoxOpen, setIsBoxOpen] = useState(false);

  const currentData = GRAVITY_DATA[level % GRAVITY_DATA.length];
  const boxRef = useRef(null);
  const containerRef = useRef(null);

  // 1. تهيئة وحدات البيانات (Orbs) عند بداية كل مستوى
  useEffect(() => {
    // خلط الخيارات لضمان التحدي
    const uniqueOptions = [...new Set(currentData.options)].sort(() => Math.random() - 0.5); 
    
    const orbs = uniqueOptions.map((word, i) => {
        const randomLeft = (i * (80 / uniqueOptions.length)) + 10;
        const randomBottom = 40 + Math.random() * 100;
        return {
            id: `orb-${level}-${i}-${word}`,
            text: word,
            left: randomLeft,
            bottom: randomBottom,
            delay: i * 0.1
        };
    });
    setFloorOrbs(orbs);
    setIsBoxOpen(false);
  }, [level, currentData]);

  // 2. معالجة نهاية السحب (Drop Logic)
  const handleDragEnd = useCallback((event, info, id, text) => {
    setIsBoxOpen(false);
    
    if (!boxRef.current) return;

    const dropPoint = { x: info.point.x, y: info.point.y };
    const boxRect = boxRef.current.getBoundingClientRect();

    // التحقق مما إذا كانت النقطة داخل حدود الصندوق
    const isInsideBox = (
        dropPoint.x >= boxRect.left && 
        dropPoint.x <= boxRect.right && 
        dropPoint.y >= boxRect.top && 
        dropPoint.y <= boxRect.bottom
    );

    if (isInsideBox) {
        if (text === currentData.correct) {
            // نجاح: تأمين البيانات
            setScore(s => s + 150);
            setFeedback({ type: 'success', text: "DATA_SECURED" });
            setFloorOrbs(prev => prev.filter(o => o.id !== id));
            
            // الانتقال للمستوى التالي بعد ثانية
            setTimeout(() => {
                setFeedback(null);
                setLevel(l => l + 1);
            }, 1000);
        } else {
            // فشل: بيانات غير صالحة
            setFeedback({ type: 'error', text: "INVALID_SEQUENCE" });
            setTimeout(() => setFeedback(null), 1000);
        }
    }
  }, [currentData, level]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[20000] bg-[#030303] text-cyan-500 font-sans overflow-hidden select-none"
      dir={dir}
    >
      {/* طبقة الشبكة الرقمية الخلفية */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent_70%)] pointer-events-none"></div>

      {/* شريط الحالة العلوي */}
      <div className="absolute top-0 w-full p-8 flex justify-between items-start z-50 pointer-events-none">
         <button 
            onClick={onClose} 
            className="pointer-events-auto flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl"
         >
             <IconArrowLeft size={18}/> ABORT_MISSION
         </button>
         
         <div className="flex flex-col items-end pointer-events-auto">
            <div className="flex items-center gap-3 bg-black/40 border border-cyan-500/30 px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl">
                <IconDatabase size={20} className="text-cyan-400 animate-pulse" />
                <span className="text-2xl font-black font-mono text-white tracking-tighter">
                    {score.toString().padStart(5, '0')}
                </span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] mt-2 mr-2 opacity-40 text-white">Quantum_Credits</span>
         </div>
      </div>

      {/* عرض الجملة (Mission Objective) */}
      <div className="absolute top-32 w-full text-center pointer-events-none z-10 px-6">
        <motion.div 
            key={level}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
        >
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight max-w-4xl drop-shadow-2xl">
              {currentData.sentence.split('___').map((part, i, arr) => (
                  <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                          <span className="inline-block w-24 md:w-32 h-1 md:h-2 bg-cyan-500/30 rounded-full mx-2 animate-pulse align-middle"></span>
                      )}
                  </React.Fragment>
              ))}
            </h2>
            
            <div className="px-6 py-2 bg-white/5 border border-white/5 rounded-full backdrop-blur-md">
                <span className="text-sm md:text-lg font-bold text-white/40 italic font-cairo">
                    {currentData.translation}
                </span>
            </div>
        </motion.div>
      </div>

      {/* صندوق الهدف المركز (Target Box) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 z-20 pointer-events-none">
          <motion.div 
            ref={boxRef}
            animate={{ 
                scale: isBoxOpen ? 1.15 : 1,
                borderColor: feedback?.type === 'error' ? '#ef4444' : feedback?.type === 'success' ? '#10b981' : isBoxOpen ? '#06b6d4' : 'rgba(255,255,255,0.1)'
            }}
            className="relative w-64 h-64 md:w-80 md:h-80 border-4 border-dashed rounded-[3rem] flex items-center justify-center bg-black/60 backdrop-blur-2xl overflow-hidden transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
              {/* غطاء الصندوق المتحرك */}
              <motion.div 
                initial={{ y: "0%" }}
                animate={{ y: isBoxOpen ? "-100%" : "0%" }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="absolute inset-0 bg-[#0c0c0c] z-30 border-b-4 border-white/5 flex flex-col items-center justify-center gap-4"
              >
                  <IconLock size={56} className="text-white/10" stroke={1.5} />
                  <span className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase">Target_Locked</span>
              </motion.div>

              {/* محتوى الصندوق عند الفتح */}
              <div className="text-center relative z-10 animate-in fade-in zoom-in duration-500">
                  <IconLockOpen size={64} className="mx-auto mb-4 text-cyan-400 animate-bounce" />
                  <p className="text-[10px] tracking-[0.3em] uppercase text-white font-black">{t('live_log_waiting')}</p>
                  <p className="text-[9px] text-cyan-500/50 mt-2 font-mono uppercase tracking-widest">Awaiting_Input_Orb</p>
              </div>

              {/* نبضات الجاذبية الخلفية */}
              <div className="absolute inset-0 bg-cyan-500/5 animate-pulse z-0"></div>
          </motion.div>
      </div>

      {/* وحدات البيانات الطافية (Floating Data Orbs) */}
      <div className="absolute inset-0 z-40 pointer-events-none">
          {floorOrbs.map((orb) => (
              <motion.div
                key={orb.id}
                drag
                dragConstraints={containerRef}
                dragElastic={0.1}
                dragSnapToOrigin={true}
                onDragStart={() => setIsBoxOpen(true)}
                onDragEnd={(e, i) => handleDragEnd(e, i, orb.id, orb.text)}
                whileDrag={{ scale: 1.2, zIndex: 100, cursor: 'grabbing' }}
                whileHover={{ scale: 1.1, cursor: 'grab' }}
                initial={{ y: 800, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ type: "spring", stiffness: 60, damping: 15, delay: orb.delay }}
                style={{ 
                    position: 'absolute', 
                    left: `${orb.left}%`, 
                    bottom: `${orb.bottom}px`, 
                    touchAction: "none", 
                    pointerEvents: 'auto' 
                }}
                className="w-24 h-24 md:w-32 md:h-32"
              >
                  <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-zinc-800 to-black border-2 border-white/20 shadow-2xl flex items-center justify-center text-white font-black text-lg md:text-xl backdrop-blur-xl group overflow-hidden">
                      <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/20 transition-colors"></div>
                      <span className="relative z-10 drop-shadow-lg">{orb.text}</span>
                  </div>
                  {/* تأثير ظل طافي */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/40 blur-md rounded-full"></div>
              </motion.div>
          ))}
      </div>

      {/* رسائل التغذية الراجعة (Feedback System) */}
      <AnimatePresence>
        {feedback && (
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-10 py-4 rounded-2xl font-black text-xs md:text-sm tracking-[0.3em] uppercase z-[100] backdrop-blur-2xl border-2 shadow-2xl flex items-center gap-4 whitespace-nowrap
                ${feedback.type === 'success' 
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-emerald-900/40' 
                    : 'bg-red-950/80 border-red-500 text-red-400 shadow-red-900/40'}`}
            >
                {feedback.type === 'success' ? <IconCheck size={20} /> : <IconAlertTriangle size={20} />}
                {feedback.text === "DATA_SECURED" ? t('live_log_established') : t('auth_error_name')}
            </motion.div>
        )}
      </AnimatePresence>

      {/* شعار البروتوكول */}
      <div className={`absolute bottom-8 ${isRTL ? 'right-10' : 'left-10'} flex items-center gap-4 opacity-20 pointer-events-none`}>
          <IconTarget size={24} className="text-cyan-500 animate-spin-slow" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Gravity_Sync_v4.0</span>
      </div>
    </div>
  );
}