"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BALANCE_DATA } from '@/data/games/balanceData';
import { 
  IconArrowLeft, IconScan, IconAtom, IconScale, 
  IconAnalyze, IconCircleCheck, IconAlertCircle, IconWeight 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * لعبة ميزان الكلمات (Word Scale) - النسخة الفاخرة المحدثة
 * تم إصلاح مشكلة اختفاء الكلمات وتحسين منطق التوازن الفيزيائي
 */
export default function WordScale({ onClose }) {
  const { t, dir, isRTL } = useLanguage();
  
  // --- حالات اللعبة ---
  const [level, setLevel] = useState(0);
  const [items, setItems] = useState([]); 
  const [showResult, setShowResult] = useState(false);
  const [isError, setIsError] = useState(false);

  const leftPanRef = useRef(null);
  const rightPanRef = useRef(null);
  const containerRef = useRef(null);

  const currentLevelData = BALANCE_DATA[level % BALANCE_DATA.length];

  // 1. تهيئة الكلمات عند بداية كل مستوى - تأمين الـ Visibility
  useEffect(() => {
      const words = [currentLevelData.mainWord, ...currentLevelData.subWords].map((w, i) => ({
          uniqueId: `node-${level}-${i}-${w.text}`, // معرف فريد لضمان عدم الاختفاء
          ...w,
          location: 'bank'
      }));
      setItems(words);
      setShowResult(false);
      setIsError(false);
  }, [level, currentLevelData]);

  // 2. حسابات الوزن والميلان (Physics Engine)
  const leftWeight = items.filter(i => i.location === 'left').reduce((acc, w) => acc + (w.weight || 0), 0);
  const rightWeight = items.filter(i => i.location === 'right').reduce((acc, w) => acc + (w.weight || 0), 0);
  
  const weightDiff = rightWeight - leftWeight;
  const rotationAngle = Math.max(-25, Math.min(25, weightDiff / 4));

  // 3. معالجة السحب والإفلات بدقة (Smart Drop Logic)
  const handleDragEnd = (event, info, uniqueId) => {
      const dropPoint = { x: info.point.x, y: info.point.y };
      const leftRect = leftPanRef.current?.getBoundingClientRect();
      const rightRect = rightPanRef.current?.getBoundingClientRect();
      
      let newLocation = 'bank';

      // توسيع منطقة الحساسية للكفات لسهولة اللعب
      const BUFFER = 60;

      if (leftRect && 
          dropPoint.x >= leftRect.left - BUFFER && dropPoint.x <= leftRect.right + BUFFER && 
          dropPoint.y >= leftRect.top - BUFFER && dropPoint.y <= leftRect.bottom + BUFFER) {
          newLocation = 'left';
      } 
      else if (rightRect && 
          dropPoint.x >= rightRect.left - BUFFER && dropPoint.x <= rightRect.right + BUFFER && 
          dropPoint.y >= rightRect.top - BUFFER && dropPoint.y <= rightRect.bottom + BUFFER) {
          newLocation = 'right';
      }

      setItems(prev => prev.map(item => 
          item.uniqueId === uniqueId ? { ...item, location: newLocation } : item
      ));
  };

  // 4. التحقق من التوازن الكمي
  const checkBalance = () => {
      const leftItems = items.filter(i => i.location === 'left');
      const rightItems = items.filter(i => i.location === 'right');
      
      if (leftItems.length === 0 && rightItems.length === 0) return;

      const mainInLeft = leftItems.some(w => w.text === currentLevelData.mainWord.text);
      const allSubsInRight = currentLevelData.subWords.every(sub => rightItems.some(rw => rw.text === sub.text));
      
      const mainInRight = rightItems.some(w => w.text === currentLevelData.mainWord.text);
      const allSubsInLeft = currentLevelData.subWords.every(sub => leftItems.some(lw => lw.text === sub.text));

      if ((mainInLeft && allSubsInRight && leftItems.length === 1) || 
          (mainInRight && allSubsInLeft && rightItems.length === 1)) {
          setShowResult(true);
      } else {
          setIsError(true);
          setTimeout(() => setIsError(false), 600);
      }
  };

  // مكون الكلمة القابل للسحب
  const DraggableWord = ({ word }) => (
    <motion.div
        layoutId={word.uniqueId}
        drag
        dragMomentum={false}
        onDragEnd={(e, i) => handleDragEnd(e, i, word.uniqueId)}
        whileDrag={{ scale: 1.1, zIndex: 1000, cursor: 'grabbing' }}
        whileHover={{ scale: 1.05, cursor: 'grab' }}
        className="relative z-50 pointer-events-auto"
    >
        <div className="px-5 py-2.5 bg-gradient-to-br from-[#cfb53b] to-[#8a6e2f] text-black text-xs font-black rounded-xl border-2 border-amber-200/50 shadow-[0_10px_20px_rgba(0,0,0,0.3)] whitespace-nowrap uppercase tracking-tighter">
            {word.text}
        </div>
    </motion.div>
  );

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[20000] bg-black text-amber-500 font-sans flex flex-col overflow-hidden"
      dir={dir}
    >
        {/* الخلفية الفاخرة */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,181,59,0.06),transparent_80%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
        
        {/* Header */}
        <div className="w-full p-10 flex justify-between items-center z-50 relative pointer-events-none">
             <button 
                onClick={onClose} 
                className="pointer-events-auto flex items-center gap-3 text-white/20 hover:text-white border border-white/10 px-8 py-3 rounded-2xl bg-white/5 uppercase text-[10px] font-black tracking-widest transition-all hover:bg-red-600"
             >
                <IconArrowLeft size={18}/> ABORT
             </button>
             <div className="text-right pointer-events-auto">
                <h1 className="text-3xl font-black tracking-tighter text-[#cfb53b] uppercase italic leading-none">
                    {t('game_scale_title')}
                </h1>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.5em] mt-2">Quantum_Equilibrium_Module</p>
             </div>
        </div>

        {/* الميزان (The Apparatus) */}
        <div className="flex-1 flex flex-col items-center justify-start relative pt-20">
            <div className={`relative w-full max-w-5xl h-[450px] transition-transform duration-100 ${isError ? 'animate-shake' : ''}`}>
                
                {/* العمود الفقري للميزان */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-12 bg-[#111] rounded-t-[3rem] border-t-2 border-white/5 shadow-2xl"></div>
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-8 h-72 bg-gradient-to-b from-[#1a1a1a] to-black border-x border-white/5"></div>
                
                {/* المحور المركزي المضيء */}
                <div className="absolute top-[45px] left-1/2 -translate-x-1/2 w-20 h-20 bg-[#0c0c0c] rounded-full border-[6px] border-[#cfb53b]/40 shadow-[0_0_50px_rgba(207,181,59,0.2)] z-20 flex items-center justify-center">
                    <IconAtom size={36} className="text-[#cfb53b] animate-spin-slow" />
                </div>

                {/* عارضة التوازن (The Beam) */}
                <motion.div 
                    className="absolute top-[75px] left-1/2 w-full max-w-[95%] h-5 bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] rounded-full origin-center z-10 border border-white/10 shadow-2xl"
                    animate={{ rotate: rotationAngle }}
                    transition={{ type: "spring", stiffness: 40, damping: 12 }}
                    style={{ x: "-50%" }}
                >
                    {/* الكفة اليسرى (Left Pan) */}
                    <motion.div 
                        className="absolute left-6 top-5 w-[1px] h-36 bg-gradient-to-b from-[#cfb53b]/50 to-transparent origin-top" 
                        animate={{ rotate: -rotationAngle }}
                    >
                        <div ref={leftPanRef} className="absolute bottom-0 -left-36 w-72 min-h-[180px] translate-y-full">
                            <div className="w-full h-full border-2 border-white/5 bg-zinc-900/40 rounded-[3rem] backdrop-blur-xl relative shadow-2xl flex flex-wrap content-start justify-center p-6 gap-3 border-dashed">
                                <AnimatePresence>
                                    {items.filter(i => i.location === 'left').map(w => <DraggableWord key={w.uniqueId} word={w} />)}
                                </AnimatePresence>
                                <IconWeight size={50} className="text-white/[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </motion.div>

                    {/* الكفة اليمنى (Right Pan) */}
                    <motion.div 
                        className="absolute right-6 top-5 w-[1px] h-36 bg-gradient-to-b from-[#cfb53b]/50 to-transparent origin-top" 
                        animate={{ rotate: -rotationAngle }}
                    >
                        <div ref={rightPanRef} className="absolute bottom-0 -right-36 w-72 min-h-[180px] translate-y-full">
                            <div className="w-full h-full border-2 border-white/5 bg-zinc-900/40 rounded-[3rem] backdrop-blur-xl relative shadow-2xl flex flex-wrap content-start justify-center p-6 gap-3 border-dashed">
                                <AnimatePresence>
                                    {items.filter(i => i.location === 'right').map(w => <DraggableWord key={w.uniqueId} word={w} />)}
                                </AnimatePresence>
                                <IconWeight size={50} className="text-white/[0.02] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* بنك الكلمات السفلي (The Vault) */}
            <div className="mt-64 w-full max-w-5xl px-10 flex flex-col items-center z-30">
                 <div className="w-full min-h-[140px] bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 backdrop-blur-md shadow-inner flex flex-wrap items-center justify-center gap-4 relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
                     <AnimatePresence>
                         {items.filter(i => i.location === 'bank').map(word => (
                            <DraggableWord key={word.uniqueId} word={word} />
                         ))}
                     </AnimatePresence>
                     {items.filter(i => i.location === 'bank').length === 0 && (
                         <span className="text-[10px] font-black text-white/5 uppercase tracking-[0.6em] animate-pulse">All_Data_Packets_Transferred</span>
                     )}
                 </div>

                 {/* زر التحليل المترجم */}
                 <button 
                    onClick={checkBalance} 
                    className="group relative mt-12 px-16 py-6 bg-[#cfb53b] text-black font-black rounded-2xl hover:bg-white transition-all shadow-[0_20px_50px_rgba(207,181,59,0.3)] active:scale-95 flex items-center gap-4 uppercase text-xs tracking-[0.2em]"
                 >
                    <IconScan size={26} className="group-hover:rotate-90 transition-transform duration-500" /> 
                    INITIATE_ANALYSIS
                 </button>
            </div>

            {/* واجهة النجاح (Success Modal) */}
            <AnimatePresence>
                {showResult && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="fixed inset-0 bg-black/98 z-[30000] flex flex-col items-center justify-center p-8 backdrop-blur-3xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#080808] border-2 border-[#cfb53b]/40 p-16 rounded-[4rem] w-full max-w-xl shadow-[0_0_150px_rgba(207,181,59,0.15)] text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#cfb53b] to-transparent shadow-[0_0_30px_#cfb53b]"></div>
                            <IconCircleCheck size={100} className="text-[#cfb53b] mx-auto mb-8" stroke={1} />
                            
                            <h2 className="text-4xl font-black text-white mb-10 tracking-tighter uppercase italic">Perfect_Balance</h2>
                            
                            <div className="space-y-3 mb-12 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                                {items.map(word => (
                                    <div key={word.uniqueId} className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/5 transition-all hover:bg-white/[0.08]">
                                        <span className="text-[#cfb53b] font-black text-lg uppercase tracking-tighter">{word.text}</span>
                                        <span className="text-white/30 text-xs font-bold font-cairo">{word.trans}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => setLevel(l => l + 1)} 
                                className="w-full py-6 bg-white text-black font-black rounded-3xl shadow-2xl transition-all uppercase tracking-widest text-xs hover:bg-[#cfb53b]"
                            >
                                NEXT_MISSION_START
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* العلامة التجارية */}
        <div className="absolute bottom-8 left-10 opacity-10 flex flex-col pointer-events-none">
            <span className="text-xs font-black tracking-[0.5em] text-white">SYSTEMS BY</span>
            <span className="text-xl font-serif font-black tracking-widest text-[#cfb53b]">ИСЛАМ АЗАЙЗИЯ</span>
        </div>
    </div>
  );
}