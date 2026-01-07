"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BALANCE_DATA } from '@/data/games/balanceData';
import { 
  IconArrowLeft, IconScan, IconAtom, IconScale, 
  IconCircleCheck, IconWeight, IconGripVertical, IconChevronDown 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * لعبة ميزان الكلمات (Word Scale) - النسخة الفاخرة المضغوطة
 * تم إصلاح مشكلة الحجم واختفاء الكلمات لضمان تجربة لعب انسيابية
 */
export default function WordScale({ onClose }) {
  const { t, dir, isRTL } = useLanguage();
  
  const [level, setLevel] = useState(0);
  const [items, setItems] = useState([]); 
  const [showResult, setShowResult] = useState(false);
  const [isError, setIsError] = useState(false);

  const containerRef = useRef(null);
  const leftPanRef = useRef(null);
  const rightPanRef = useRef(null);

  const currentLevelData = BALANCE_DATA[level % BALANCE_DATA.length];

  // 1. تهيئة البيانات مع ضمان الظهور الفوري
  useEffect(() => {
      const words = [currentLevelData.mainWord, ...currentLevelData.subWords].map((w, i) => ({
          id: `node-${level}-${i}-${w.text.substring(0,3)}`,
          text: w.text,
          trans: w.trans,
          weight: w.weight || 25,
          location: 'bank' 
      }));
      setItems(words);
      setShowResult(false);
      setIsError(false);
  }, [level, currentLevelData]);

  // 2. محرك حسابات الميلان الفيزيائي
  const leftTotal = items.filter(i => i.location === 'left').reduce((acc, w) => acc + w.weight, 0);
  const rightTotal = items.filter(i => i.location === 'right').reduce((acc, w) => acc + w.weight, 0);
  const tilt = Math.max(-20, Math.min(20, (rightTotal - leftTotal) / 4));

  // 3. منطق السحب والإسقاط الذكي
  const handleDragEnd = (event, info, wordId) => {
      const { x, y } = info.point;
      const leftRect = leftPanRef.current?.getBoundingClientRect();
      const rightRect = rightPanRef.current?.getBoundingClientRect();
      
      let targetLoc = 'bank';
      const TOLERANCE = 40; // زيادة حساسية الكفة

      if (leftRect && x >= leftRect.left - TOLERANCE && x <= leftRect.right + TOLERANCE && y >= leftRect.top - TOLERANCE && y <= leftRect.bottom + TOLERANCE) {
          targetLoc = 'left';
      } else if (rightRect && x >= rightRect.left - TOLERANCE && x <= rightRect.right + TOLERANCE && y >= rightRect.top - TOLERANCE && y <= rightRect.bottom + TOLERANCE) {
          targetLoc = 'right';
      }

      setItems(prev => prev.map(item => item.id === wordId ? { ...item, location: targetLoc } : item));
  };

  // 4. التحقق من التوازن
  const validateBalance = () => {
      const left = items.filter(i => i.location === 'left');
      const right = items.filter(i => i.location === 'right');
      if (left.length === 0 || right.length === 0) return;

      const mainWord = currentLevelData.mainWord.text;
      const subWords = currentLevelData.subWords.map(s => s.text);

      const winA = left.some(w => w.text === mainWord) && left.length === 1 && right.length === subWords.length;
      const winB = right.some(w => w.text === mainWord) && right.length === 1 && left.length === subWords.length;

      if (winA || winB) {
          setShowResult(true);
      } else {
          setIsError(true);
          setTimeout(() => setIsError(false), 600);
      }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[30000] bg-black text-[#cfb53b] font-sans flex flex-col overflow-hidden" dir={dir}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,181,59,0.04),transparent_80%)] pointer-events-none" />

        {/* هيدر مصغر */}
        <header className="w-full p-6 md:p-8 flex justify-between items-center z-50 shrink-0">
             <button onClick={onClose} className="flex items-center gap-2 text-white/20 hover:text-white border border-white/10 px-5 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase transition-all">
                <IconArrowLeft size={16}/> {t('chat_cancel')}
             </button>
             <div className="text-right">
                <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[#cfb53b] uppercase italic leading-none">{t('game_scale_title')}</h1>
                <p className="text-[7px] font-bold text-white/20 uppercase tracking-[0.4em] mt-1">Equilibrium_v4.2</p>
             </div>
        </header>

        {/* منطقة الميزان - تم ضغط الارتفاع هنا */}
        <div className="flex-1 flex flex-col items-center justify-start relative pt-4 md:pt-10">
            <div className={`relative w-full max-w-3xl h-[320px] md:h-[380px] flex justify-center items-start transition-all ${isError ? 'animate-shake' : ''}`}>
                
                {/* العمود الرأسي المصغر */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#111] rounded-t-3xl border-t border-white/5"></div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-48 md:h-64 bg-gradient-to-b from-[#1a1a1a] to-black border-x border-white/5 shadow-xl"></div>
                
                {/* المحور الذهبي */}
                <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-16 h-16 bg-[#0c0c0c] rounded-full border-[5px] border-[#cfb53b]/40 shadow-2xl z-30 flex items-center justify-center">
                    <IconAtom size={28} className="text-[#cfb53b] animate-spin-slow" />
                </div>

                {/* العارضة الأفقية المضغوطة */}
                <motion.div 
                    className="absolute top-[60px] left-1/2 w-[85%] h-3 bg-gradient-to-r from-[#111] via-[#333] to-[#111] rounded-full origin-center z-20 border border-white/5 shadow-xl"
                    animate={{ rotate: tilt }}
                    transition={{ type: "spring", stiffness: 50, damping: 15 }}
                    style={{ x: "-50%" }}
                >
                    {/* الكفة اليسرى */}
                    <motion.div ref={leftPanRef} className="absolute left-4 top-4 w-[1px] h-28 md:h-36 bg-gradient-to-b from-[#cfb53b]/30 to-transparent origin-top flex flex-col items-center" animate={{ rotate: -tilt }}>
                        <div className="absolute bottom-0 w-48 md:w-56 h-16 bg-zinc-900/60 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-center p-2 gap-1 border-dashed">
                            <AnimatePresence>
                                {items.filter(i => i.location === 'left').map(word => <DraggableWord key={word.id} word={word} onDragEnd={handleDragEnd} />)}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* الكفة اليمنى */}
                    <motion.div ref={rightPanRef} className="absolute right-4 top-4 w-[1px] h-28 md:h-36 bg-gradient-to-b from-[#cfb53b]/30 to-transparent origin-top flex flex-col items-center" animate={{ rotate: -tilt }}>
                        <div className="absolute bottom-0 w-48 md:w-56 h-16 bg-zinc-900/60 rounded-[2rem] border border-white/10 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-center p-2 gap-1 border-dashed">
                             <AnimatePresence>
                                {items.filter(i => i.location === 'right').map(word => <DraggableWord key={word.id} word={word} onDragEnd={handleDragEnd} />)}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* مخزن الكلمات - تأمين الظهور في أسفل الشاشة */}
            <div className="w-full max-w-4xl px-6 mt-10 z-50">
                 <div className="w-full min-h-[120px] bg-[#080808] border border-white/5 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-inner flex flex-wrap items-center justify-center gap-3 relative border-dashed">
                     <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-20">
                        <span className="text-[7px] font-black uppercase tracking-[0.5em]">Vault_Storage</span>
                        <IconChevronDown size={10} className="animate-bounce" />
                     </div>
                     <AnimatePresence>
                         {items.filter(i => i.location === 'bank').map(word => (
                            <DraggableWord key={word.id} word={word} onDragEnd={handleDragEnd} />
                         ))}
                     </AnimatePresence>
                 </div>

                 {/* زر التحليل المترجم */}
                 <button onClick={validateBalance} className="group w-full max-w-xs mx-auto mt-8 py-5 bg-[#cfb53b] text-black font-black rounded-2xl hover:bg-white transition-all shadow-[0_15px_40px_rgba(207,181,59,0.2)] active:scale-95 flex items-center justify-center gap-4 uppercase text-[10px] tracking-[0.2em]">
                    <IconScan size={20} className="group-hover:rotate-90 transition-transform duration-500" /> {t('admin_overview')}
                 </button>
            </div>

            {/* واجهة النتيجة */}
            <AnimatePresence>
                {showResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 z-[40000] flex flex-col items-center justify-center p-6 backdrop-blur-2xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0c0c0c] border border-[#cfb53b]/30 p-10 md:p-14 rounded-[3.5rem] w-full max-w-lg shadow-2xl text-center relative overflow-hidden">
                            <IconCircleCheck size={80} className="text-emerald-500 mx-auto mb-6" />
                            <h2 className="text-3xl font-black text-white mb-8 tracking-tighter uppercase italic">Balance_Restored</h2>
                            <div className="grid grid-cols-2 gap-3 mb-10 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                {items.map(word => (
                                    <div key={word.id} className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-[#cfb53b] font-black text-sm uppercase">{word.text}</span>
                                        <span className="text-white/20 text-[9px] mt-1 font-bold">{word.trans}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setLevel(l => l + 1)} className="w-full py-5 bg-white text-black font-black rounded-2xl transition-all uppercase tracking-widest text-[10px] hover:bg-[#cfb53b]">
                                {t('archive_load_more')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className="absolute bottom-6 left-10 opacity-5 flex flex-col pointer-events-none">
            <span className="text-xl font-serif font-black tracking-widest text-[#cfb53b]">ИСЛАМ АЗАЙЗИЯ</span>
        </div>
    </div>
  );
}

function DraggableWord({ word, onDragEnd }) {
    return (
        <motion.div layout drag dragMomentum={false} onDragEnd={(e, i) => onDragEnd(e, i, word.id)} whileDrag={{ scale: 1.1, zIndex: 1000 }} className="cursor-grab active:cursor-grabbing">
            <div className="px-4 py-2 bg-gradient-to-br from-[#cfb53b] to-[#a38b24] text-black text-[10px] font-black rounded-xl border border-white/20 shadow-xl flex items-center gap-2 uppercase">
                <IconGripVertical size={12} className="opacity-30"/> {word.text}
            </div>
        </motion.div>
    );
}