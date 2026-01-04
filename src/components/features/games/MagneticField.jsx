"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAGNET_DATA } from '@/data/games/magnetData';
import { 
  IconMagnet, IconArrowLeft, IconAtom, IconScan, 
  IconTarget, IconChecks, IconBolt 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * لعبة الحقل المغناطيسي (Magnetic Field)
 * نظام جذب الكلمات المنتمية للجذر اللغوي الصحيح باستخدام محاكاة فيزيائية
 */
export default function MagneticField({ onClose }) {
  const { t, dir, isRTL } = useLanguage();
  
  // --- حالات اللعبة ---
  const [level, setLevel] = useState(0);
  const [collected, setCollected] = useState([]);
  const [magnetPos, setMagnetPos] = useState({ x: -1000, y: -1000 });
  const [words, setWords] = useState([]);
  const containerRef = useRef(null);
  
  const currentLevelData = MAGNET_DATA[level % MAGNET_DATA.length];

  // 1. تهيئة الكلمات والفيزياء عند بداية كل مستوى
  useEffect(() => {
      const initialWords = currentLevelData.words.map(w => ({
          ...w,
          id: Math.random(),
          x: Math.random() * (window.innerWidth - 400) + (isRTL ? 50 : 350),
          y: Math.random() * (window.innerHeight - 200) + 100,
          vx: 0, 
          vy: 0,
          isAttracted: false
      }));
      setWords(initialWords);
      setCollected([]);
  }, [level, currentLevelData, isRTL]);

  // 2. محرك الفيزياء الحية (Physics Engine)
  useEffect(() => {
    let animationFrame;
    
    const updatePhysics = () => {
        setWords(prevWords => {
            return prevWords.map(word => {
                if (collected.includes(word.id)) return word;

                let newVx = word.vx;
                let newVy = word.vy;
                let isAttractedNow = false;

                const dx = magnetPos.x - word.x;
                const dy = magnetPos.y - word.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                // مسافة التأثير المغناطيسي
                const INFLUENCE_RANGE = 150;

                if (dist < INFLUENCE_RANGE && word.type === 'related') {
                    isAttractedNow = true;
                    // معادلة الجذب: القوة تزداد كلما اقتربت الكلمة
                    const force = 1500 / (dist * dist + 50);
                    newVx += dx * force * 0.2;
                    newVy += dy * force * 0.2;
                    
                    // كبح السرعة عند الاقتراب الشديد لسهولة الالتقاط
                    if (dist < 40) {
                        newVx *= 0.5;
                        newVy *= 0.5;
                    }
                } else {
                    // احتكاك الهواء (Damping) للكلمات البعيدة
                    newVx *= 0.95; 
                    newVy *= 0.95;
                }

                // منع الكلمات من الخروج من حدود الشاشة
                let nextX = word.x + newVx;
                let nextY = word.y + newVy;
                
                if (nextX < (isRTL ? 50 : 320) || nextX > window.innerWidth - 50) newVx *= -1;
                if (nextY < 50 || nextY > window.innerHeight - 50) newVy *= -1;

                return {
                    ...word,
                    vx: newVx,
                    vy: newVy,
                    x: word.x + newVx,
                    y: word.y + newVy,
                    isAttracted: isAttractedNow
                };
            });
        });
        animationFrame = requestAnimationFrame(updatePhysics);
    };

    animationFrame = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animationFrame);
  }, [magnetPos, collected, isRTL]);

  // 3. كشف التصادم والالتقاط (Collision Detection)
  useEffect(() => {
      const interval = setInterval(() => {
          setWords(prev => {
            const newCollectedIds = [];
            prev.forEach(word => {
                if(collected.includes(word.id)) return;
                const dist = Math.sqrt(Math.pow(magnetPos.x - word.x, 2) + Math.pow(magnetPos.y - word.y, 2));
                
                // المسافة اللازمة للالتقاط
                if(dist < 45 && word.type === 'related') { 
                     newCollectedIds.push(word.id);
                }
            });
            if(newCollectedIds.length > 0) {
                setCollected(curr => [...curr, ...newCollectedIds]);
            }
            return prev;
          });
      }, 50);
      return () => clearInterval(interval);
  }, [magnetPos, collected]);

  const totalRequired = currentLevelData.words.filter(w => w.type === 'related').length;

  return (
    <div 
      className="fixed inset-0 z-[20000] bg-[#05000a] font-sans overflow-hidden cursor-none select-none" 
      onMouseMove={(e) => setMagnetPos({ x: e.clientX, y: e.clientY })}
      onTouchMove={(e) => setMagnetPos({ x: e.touches[0].clientX, y: e.touches[0].clientY })}
      ref={containerRef}
      dir={dir}
    >
      {/* تأثيرات بصرية خلفية (Grid & Nebula) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* لوحة المعلومات الجانبية (Mission Control) */}
      <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-80 h-full bg-black/60 border-x border-purple-500/20 backdrop-blur-2xl p-8 z-50`}>
         <button 
            onClick={onClose} 
            className="flex items-center gap-3 text-white/40 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-12 group"
         >
             <IconArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> {t('admin_exit')}
         </button>

         <div className="mb-10">
             <div className="flex items-center gap-2 mb-2">
                 <IconScan size={14} className="text-purple-400 animate-pulse"/>
                 <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest">{t('archive_group_label')}</span>
             </div>
             <h1 className="text-5xl font-black text-white tracking-tighter uppercase drop-shadow-lg">
                {currentLevelData.root}
             </h1>
         </div>

         <div className="space-y-3">
             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-4">Neural_Targets_Queue</span>
             {currentLevelData.words.filter(w => w.type === 'related').map((w, i) => {
                 const isFound = collected.some(id => words.find(wd => wd.id === id)?.text === w.text);
                 return (
                     <motion.div 
                        key={i} 
                        animate={isFound ? { x: 10, opacity: 1 } : {}}
                        className={`p-4 rounded-2xl border transition-all duration-500 flex justify-between items-center ${
                            isFound 
                            ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40' 
                            : 'bg-white/5 border-white/5 text-white/20'
                        }`}
                     >
                         <span className="font-bold text-sm uppercase">{w.text}</span>
                         {isFound ? <IconChecks size={18} className="animate-in zoom-in" /> : <div className="w-4 h-4 rounded-full border border-white/10" />}
                     </motion.div>
                 );
             })}
         </div>

         {/* زر الانتقال للمستوى التالي */}
         <AnimatePresence>
             {collected.length >= totalRequired && (
                 <motion.button 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={() => setLevel(l=>l+1)} 
                    className="mt-10 w-full py-5 bg-white text-black font-black rounded-2xl shadow-2xl flex items-center justify-center gap-3 hover:bg-purple-400 transition-colors uppercase tracking-widest text-xs"
                 >
                    <IconBolt size={20} className="animate-bounce" /> {t('archive_load_more')}
                 </motion.button>
             )}
         </AnimatePresence>
      </div>

      {/* مؤشر المغناطيس (Custom Magnet Cursor) */}
      <div 
        className="fixed pointer-events-none z-[100] mix-blend-screen transition-transform duration-100" 
        style={{ left: magnetPos.x, top: magnetPos.y, transform: 'translate(-50%, -50%)' }}
      >
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-20 h-20 rounded-full border-2 border-purple-400 bg-purple-500/10 shadow-[0_0_50px_rgba(168,85,247,0.6)] flex items-center justify-center relative"
          >
              <IconMagnet size={32} className="text-white drop-shadow-lg" stroke={2.5}/>
              {/* حلقات طاقة مغناطيسية */}
              <div className="absolute inset-[-20px] rounded-full border border-purple-500/10 animate-ping"></div>
          </motion.div>
      </div>

      {/* شبكة الكلمات العائمة (Interactive Words) */}
      {words.map(word => {
          if (collected.includes(word.id)) return null;
          return (
              <motion.div
                 key={word.id}
                 animate={{ x: word.x, y: word.y }}
                 transition={{ duration: 0 }} 
                 className={`absolute px-5 py-2.5 rounded-xl font-mono text-sm font-black border transition-all duration-300 z-40
                    ${word.isAttracted 
                        ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_25px_#a855f7] scale-110 z-50' 
                        : 'bg-zinc-900/80 text-zinc-500 border-white/5 backdrop-blur-md'}`}
                 style={{ x: "-50%", y: "-50%" }}
              >
                  <div className="flex items-center gap-2">
                      {word.isAttracted && <IconTarget size={14} className="animate-spin" />}
                      {word.text}
                  </div>
              </motion.div>
          );
      })}

      {/* شعار اللعبة في الزاوية */}
      <div className={`absolute bottom-8 ${isRTL ? 'left-10' : 'right-10'} flex items-center gap-4 opacity-10 pointer-events-none`}>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Magnetic_Core_v4.2</span>
          <IconAtom size={24} className="text-purple-500 animate-spin-slow" />
      </div>
    </div>
  );
}