"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BALANCE_DATA } from '@/data/games/balanceData';
import { 
  IconArrowLeft, IconScan, IconAtom, IconScale, 
  IconCircleCheck, IconAlertCircle, IconWeight, IconGripVertical 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * لعبة ميزان الكلمات (Word Scale) - الإصدار الفاخر المطور
 * تم إصلاح مشكلة اختفاء العناصر وضبط التوازن الفيزيائي بالكامل
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

  // 1. تهيئة البيانات وضمان ظهورها (Visibility Lock)
  useEffect(() => {
      const words = [currentLevelData.mainWord, ...currentLevelData.subWords].map((w, i) => ({
          id: `w-${level}-${i}-${w.text}`,
          text: w.text,
          trans: w.trans,
          weight: w.weight || 20,
          location: 'bank' // bank, left, right
      }));
      setItems(words);
      setShowResult(false);
      setIsError(false);
  }, [level, currentLevelData]);

  // 2. محرك حسابات التوازن (Equilibrium Engine)
  const leftTotal = items.filter(i => i.location === 'left').reduce((acc, w) => acc + w.weight, 0);
  const rightTotal = items.filter(i => i.location === 'right').reduce((acc, w) => acc + w.weight, 0);
  
  // حساب زاوية الميل (Degrees)
  const tilt = Math.max(-25, Math.min(25, (rightTotal - leftTotal) / 3));

  // 3. معالجة السحب والإفلات (Advanced Drag Logic)
  const handleDragEnd = (event, info, wordId) => {
      const { x, y } = info.point;
      const leftRect = leftPanRef.current?.getBoundingClientRect();
      const rightRect = rightPanRef.current?.getBoundingClientRect();
      
      let targetLoc = 'bank';
      const SENSITIVITY = 50; // مساحة إضافية حول الكفة

      if (leftRect && x >= leftRect.left - SENSITIVITY && x <= leftRect.right + SENSITIVITY && y >= leftRect.top - SENSITIVITY && y <= leftRect.bottom + SENSITIVITY) {
          targetLoc = 'left';
      } else if (rightRect && x >= rightRect.left - SENSITIVITY && x <= rightRect.right + SENSITIVITY && y >= rightRect.top - SENSITIVITY && y <= rightRect.bottom + SENSITIVITY) {
          targetLoc = 'right';
      }

      setItems(prev => prev.map(item => item.id === wordId ? { ...item, location: targetLoc } : item));
  };

  // 4. التحقق من التوازن المنطقي
  const validateBalance = () => {
      const left = items.filter(i => i.location === 'left');
      const right = items.filter(i => i.location === 'right');
      
      if (left.length === 0 || right.length === 0) return;

      const mainWordText = currentLevelData.mainWord.text;
      const subWordsTexts = currentLevelData.subWords.map(s => s.text);

      const scenarioA = left.some(w => w.text === mainWordText) && left.length === 1 && right.every(w => subWordsTexts.includes(w.text)) && right.length === subWordsTexts.length;
      const scenarioB = right.some(w => w.text === mainWordText) && right.length === 1 && left.every(w => subWordsTexts.includes(w.text)) && left.length === subWordsTexts.length;

      if (scenarioA || scenarioB) {
          setShowResult(true);
      } else {
          setIsError(true);
          setTimeout(() => setIsError(false), 800);
      }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[30000] bg-[#050505] text-[#cfb53b] font-sans flex flex-col overflow-hidden"
      dir={dir}
    >
        {/* خلفية سينمائية نويز */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,181,59,0.05),transparent_80%)] pointer-events-none" />

        {/* هيدر التحكم */}
        <header className="w-full p-8 md:p-12 flex justify-between items-center z-50 relative">
             <button 
                onClick={onClose} 
                className="flex items-center gap-3 text-white/20 hover:text-white border border-white/10 px-8 py-3 rounded-2xl bg-white/5 uppercase text-[10px] font-black tracking-widest transition-all"
             >
                <IconArrowLeft size={20}/> {t('chat_cancel')}
             </button>
             <div className="text-right">
                <h1 className="text-4xl font-black tracking-tighter text-[#cfb53b] uppercase italic leading-none">
                    {t('game_scale_title')}
                </h1>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] mt-2">Quantum_Equilibrium_v4.2</p>
             </div>
        </header>

        {/* جسم الميزان الميكانيكي */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
            
            <div className={`relative w-full max-w-5xl h-[400px] flex justify-center items-start transition-all ${isError ? 'animate-shake' : ''}`}>
                
                {/* العمود الرأسي */}
                <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-48 h-12 bg-[#111] rounded-t-[3rem] border-t-2 border-white/5"></div>
                <div className="absolute bottom-[-88px] left-1/2 -translate-x-1/2 w-8 h-[380px] bg-gradient-to-b from-[#1a1a1a] to-black border-x border-white/5 shadow-2xl"></div>
                
                {/* المحور المركزي الذهب */}
                <div className="absolute top-[35px] left-1/2 -translate-x-1/2 w-24 h-24 bg-[#0c0c0c] rounded-full border-[8px] border-[#cfb53b]/40 shadow-[0_0_60px_rgba(207,181,59,0.2)] z-30 flex items-center justify-center">
                    <IconAtom size={44} className="text-[#cfb53b] animate-spin-slow" />
                </div>

                {/* العارضة الأفقية (The Beam) */}
                <motion.div 
                    className="absolute top-[75px] left-1/2 w-full max-w-[90%] h-5 bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] rounded-full origin-center z-20 border border-white/5 shadow-2xl"
                    animate={{ rotate: tilt }}
                    transition={{ type: "spring", stiffness: 45, damping: 15 }}
                    style={{ x: "-50%" }}
                >
                    {/* الكفة اليسرى */}
                    <motion.div 
                        ref={leftPanRef}
                        className="absolute left-6 top-6 w-[2px] h-40 bg-gradient-to-b from-[#cfb53b]/40 to-transparent origin-top flex flex-col items-center"
                        animate={{ rotate: -tilt }}
                    >
                        <div className="absolute bottom-0 w-72 h-20 bg-zinc-900/40 rounded-[3rem] border-2 border-white/5 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-center p-4 gap-2 border-dashed">
                            <AnimatePresence>
                                {items.filter(i => i.location === 'left').map(word => (
                                    <DraggableNode key={word.id} word={word} onDragEnd={handleDragEnd} />
                                ))}
                            </AnimatePresence>
                            {items.filter(i => i.location === 'left').length === 0 && <IconWeight size={32} className="opacity-5"/>}
                        </div>
                    </motion.div>

                    {/* الكفة اليمنى */}
                    <motion.div 
                        ref={rightPanRef}
                        className="absolute right-6 top-6 w-[2px] h-40 bg-gradient-to-b from-[#cfb53b]/40 to-transparent origin-top flex flex-col items-center"
                        animate={{ rotate: -tilt }}
                    >
                        <div className="absolute bottom-0 w-72 h-20 bg-zinc-900/40 rounded-[3rem] border-2 border-white/5 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-center p-4 gap-2 border-dashed">
                             <AnimatePresence>
                                {items.filter(i => i.location === 'right').map(word => (
                                    <DraggableNode key={word.id} word={word} onDragEnd={handleDragEnd} />
                                ))}
                            </AnimatePresence>
                            {items.filter(i => i.location === 'right').length === 0 && <IconWeight size={32} className="opacity-5"/>}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* بنك الكلمات (The Vault) - تأمين الرؤية بنسبة 100% */}
            <div className="mt-40 w-full max-w-5xl px-10 flex flex-col items-center z-[100]">
                 <div className="w-full min-h-[160px] bg-[#080808] border border-white/5 rounded-[3.5rem] p-10 backdrop-blur-xl shadow-inner flex flex-wrap items-center justify-center gap-4 relative">
                     <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/5 uppercase tracking-[1em]">Word_Deposit_Vault</div>
                     <AnimatePresence>
                         {items.filter(i => i.location === 'bank').map(word => (
                            <DraggableNode key={word.id} word={word} onDragEnd={handleDragEnd} />
                         ))}
                     </AnimatePresence>
                 </div>

                 {/* زر التحليل الضخم */}
                 <button 
                    onClick={validateBalance} 
                    className="group relative mt-12 px-20 py-7 bg-[#cfb53b] text-black font-black rounded-[2rem] hover:bg-white transition-all shadow-[0_20px_80px_rgba(207,181,59,0.3)] active:scale-95 flex items-center gap-5 uppercase text-sm tracking-[0.3em]"
                 >
                    <IconScan size={28} className="group-hover:rotate-90 transition-transform duration-700" /> 
                    {t('admin_overview')}
                 </button>
            </div>

            {/* واجهة الفوز (Victory Overlay) */}
            <AnimatePresence>
                {showResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/98 z-[40000] flex flex-col items-center justify-center p-8 backdrop-blur-3xl">
                        <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-[#0c0c0c] border-2 border-[#cfb53b]/30 p-16 rounded-[4rem] w-full max-w-2xl shadow-2xl text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#cfb53b] shadow-[0_0_30px_#cfb53b]"></div>
                            <IconCircleCheck size={100} className="text-emerald-500 mx-auto mb-10" stroke={1} />
                            <h2 className="text-5xl font-black text-white mb-12 tracking-tighter uppercase italic">Mission_Accomplished</h2>
                            <div className="grid grid-cols-2 gap-4 mb-12 max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                                {items.map(word => (
                                    <div key={word.id} className="flex flex-col items-center p-5 bg-white/5 rounded-3xl border border-white/5">
                                        <span className="text-[#cfb53b] font-black text-lg uppercase">{word.text}</span>
                                        <span className="text-white/20 text-[10px] mt-1 font-bold">{word.trans}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setLevel(l => l + 1)} className="w-full py-6 bg-white text-black font-black rounded-3xl shadow-2xl transition-all uppercase tracking-widest text-xs hover:bg-[#cfb53b]">
                                {t('archive_load_more')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* توقيع المبرمج في الركن */}
        <div className="absolute bottom-10 left-12 opacity-10 flex flex-col pointer-events-none">
            <span className="text-[10px] font-black tracking-[0.5em] text-white">ENGINEERED BY</span>
            <span className="text-2xl font-serif font-black tracking-widest text-[#cfb53b]">ИСЛАМ АЗАЙЗИЯ</span>
        </div>
    </div>
  );
}

/**
 * مكون الكلمة القابل للسحب (المعزول) لضمان الأداء
 */
function DraggableNode({ word, onDragEnd }) {
    return (
        <motion.div
            layout
            drag
            dragMomentum={false}
            onDragEnd={(e, i) => onDragEnd(e, i, word.id)}
            whileDrag={{ scale: 1.15, zIndex: 1000 }}
            whileHover={{ y: -3, scale: 1.05 }}
            className="cursor-grab active:cursor-grabbing"
        >
            <div className="px-6 py-3 bg-gradient-to-br from-[#cfb53b] to-[#a38b24] text-black text-[11px] font-black rounded-2xl border-2 border-white/20 shadow-2xl flex items-center gap-2 uppercase tracking-tighter">
                <IconGripVertical size={14} className="opacity-30"/>
                {word.text}
            </div>
        </motion.div>
    );
}