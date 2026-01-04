"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BALANCE_DATA } from '@/data/games/balanceData';
import { 
  IconArrowLeft, IconScan, IconAtom, IconComponents, 
  IconScale, IconAnalyze, IconCircleCheck, IconAlertCircle 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * لعبة ميزان الكلمات (Word Scale)
 * تهدف لتحقيق التوازن اللغوي عبر تصنيف الكلمات حسب ثقلها المرجعي
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
  const bankRef = useRef(null);

  const currentLevelData = BALANCE_DATA[level % BALANCE_DATA.length];

  // 1. تهيئة البيانات عند بداية كل مستوى
  useEffect(() => {
      const words = [currentLevelData.mainWord, ...currentLevelData.subWords].map((w, i) => ({
          uniqueId: `scale-${level}-${i}-${w.text}`,
          ...w,
          location: 'bank'
      }));
      setItems(words);
      setShowResult(false);
      setIsError(false);
  }, [level, currentLevelData]);

  // 2. حسابات الفيزياء (الوزن والميلان)
  const leftWeight = items.filter(i => i.location === 'left').reduce((acc, w) => acc + (w.weight || 0), 0);
  const rightWeight = items.filter(i => i.location === 'right').reduce((acc, w) => acc + (w.weight || 0), 0);
  
  // حساب زاوية الميلان (بحد أقصى 25 درجة)
  const weightDiff = rightWeight - leftWeight;
  const rotationAngle = Math.max(-25, Math.min(25, weightDiff / 5));

  // 3. معالجة السحب والإفلات (Drag & Drop)
  const handleDragEnd = (event, info, uniqueId) => {
      const dropPoint = { x: info.point.x, y: info.point.y };
      const leftRect = leftPanRef.current?.getBoundingClientRect();
      const rightRect = rightPanRef.current?.getBoundingClientRect();
      
      let newLocation = 'bank';

      // التحقق من الإسقاط في الكفة اليسرى
      if (leftRect && 
          dropPoint.x >= leftRect.left - 50 && dropPoint.x <= leftRect.right + 50 && 
          dropPoint.y >= leftRect.top - 100 && dropPoint.y <= leftRect.bottom + 50) {
          newLocation = 'left';
      } 
      // التحقق من الإسقاط في الكفة اليمنى
      else if (rightRect && 
          dropPoint.x >= rightRect.left - 50 && dropPoint.x <= rightRect.right + 50 && 
          dropPoint.y >= rightRect.top - 100 && dropPoint.y <= rightRect.bottom + 50) {
          newLocation = 'right';
      }

      setItems(prev => prev.map(item => 
          item.uniqueId === uniqueId ? { ...item, location: newLocation } : item
      ));
  };

  // 4. التحقق من صحة الحل (Validation)
  const checkBalance = () => {
      const leftItems = items.filter(i => i.location === 'left');
      const rightItems = items.filter(i => i.location === 'right');
      
      if (leftItems.length === 0 && rightItems.length === 0) return;

      // المنطق: يجب أن تكون الكلمة الرئيسية في كفة، وكل الكلمات الفرعية في الكفة الأخرى لتحقيق التوازن
      const mainInLeft = leftItems.some(w => w.text === currentLevelData.mainWord.text);
      const allSubsInRight = currentLevelData.subWords.every(sub => rightItems.some(rw => rw.text === sub.text));
      
      const mainInRight = rightItems.some(w => w.text === currentLevelData.mainWord.text);
      const allSubsInLeft = currentLevelData.subWords.every(sub => leftItems.some(lw => lw.text === sub.text));

      if ((mainInLeft && allSubsInRight && leftItems.length === 1) || 
          (mainInRight && allSubsInLeft && rightItems.length === 1)) {
          setShowResult(true);
      } else {
          setIsError(true);
          setTimeout(() => setIsError(false), 500);
      }
  };

  const DraggableWord = ({ word }) => (
    <motion.div
        layoutId={word.uniqueId}
        drag
        dragMomentum={false}
        onDragEnd={(e, i) => handleDragEnd(e, i, word.uniqueId)}
        whileDrag={{ scale: 1.1, zIndex: 1000, cursor: 'grabbing' }}
        whileHover={{ scale: 1.05, cursor: 'grab' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-50"
    >
        <div className={`px-4 py-2 bg-amber-500 text-black text-xs font-black rounded-lg border-2 border-amber-300 shadow-xl whitespace-nowrap transition-colors hover:bg-white`}>
            {word.text}
        </div>
    </motion.div>
  );

  return (
    <div 
      className="fixed inset-0 z-[20000] bg-[#050402] text-amber-500 font-sans flex flex-col overflow-hidden select-none"
      dir={dir}
    >
        {/* طبقة التدرج اللوني الخلفي */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.05),transparent_70%)] pointer-events-none"></div>
        
        {/* الهيدر العلوي المترجم */}
        <div className="w-full p-8 flex justify-between items-center z-50 relative pointer-events-none">
             <button 
                onClick={onClose} 
                className="pointer-events-auto flex items-center gap-3 text-white/40 hover:text-white border border-white/10 px-6 py-3 rounded-2xl bg-white/5 uppercase text-[10px] font-black tracking-widest transition-all"
             >
                <IconArrowLeft size={18}/> ABORT
             </button>
             <div className="text-right pointer-events-auto">
                <h1 className="text-2xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-100 uppercase">
                    {t('game_scale_title')}
                </h1>
                <p className="text-[8px] font-bold text-amber-600 uppercase tracking-[0.4em] mt-1">Linguistic_Equilibrium_v4.0</p>
             </div>
        </div>

        {/* منطقة الميزان (The Scale) */}
        <div className="flex-1 flex flex-col items-center justify-start relative pt-16">
            <div className={`relative w-full max-w-4xl h-[400px] transition-transform duration-100 ${isError ? 'animate-shake' : ''}`}>
                
                {/* قاعدة الميزان */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-10 bg-zinc-900 rounded-t-[2rem] border-t-2 border-amber-500/20 shadow-2xl"></div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-6 h-64 bg-gradient-to-b from-zinc-700 to-zinc-900 border-x border-white/5"></div>
                
                {/* نقطة الارتكاز المضيئة */}
                <div className="absolute top-[40px] left-1/2 -translate-x-1/2 w-16 h-16 bg-zinc-800 rounded-full border-4 border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.3)] z-20 flex items-center justify-center">
                    <IconAtom size={32} className="text-amber-400 animate-spin-slow" />
                </div>

                {/* عارضة الميزان المتحركة */}
                <motion.div 
                    className="absolute top-[65px] left-1/2 w-full max-w-[90%] h-4 bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-700 rounded-full origin-center z-10 border border-white/10 shadow-2xl"
                    animate={{ rotate: rotationAngle }}
                    transition={{ type: "spring", stiffness: 50, damping: 12 }}
                    style={{ x: "-50%" }}
                >
                    {/* الكفة اليسرى */}
                    <div className="absolute left-4 top-4 w-[1px] h-32 bg-gradient-to-b from-amber-500/50 to-transparent origin-top" style={{ transform: `rotate(${-rotationAngle}deg)` }}>
                        <div ref={leftPanRef} className="absolute bottom-0 -left-32 w-64 min-h-[160px] translate-y-full">
                            <div className="w-full h-full border-2 border-amber-500/20 bg-amber-950/20 rounded-[2.5rem] backdrop-blur-xl relative shadow-inner flex flex-wrap content-start justify-center p-4 gap-2">
                                <AnimatePresence>
                                    {items.filter(i => i.location === 'left').map(w => <DraggableWord key={w.uniqueId} word={w} />)}
                                </AnimatePresence>
                                {items.filter(i => i.location === 'left').length === 0 && (
                                    <IconScale size={40} className="text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* الكفة اليمنى */}
                    <div className="absolute right-4 top-4 w-[1px] h-32 bg-gradient-to-b from-amber-500/50 to-transparent origin-top" style={{ transform: `rotate(${-rotationAngle}deg)` }}>
                        <div ref={rightPanRef} className="absolute bottom-0 -right-32 w-64 min-h-[160px] translate-y-full">
                            <div className="w-full h-full border-2 border-amber-500/20 bg-amber-950/20 rounded-[2.5rem] backdrop-blur-xl relative shadow-inner flex flex-wrap content-start justify-center p-4 gap-2">
                                <AnimatePresence>
                                    {items.filter(i => i.location === 'right').map(w => <DraggableWord key={w.uniqueId} word={w} />)}
                                </AnimatePresence>
                                {items.filter(i => i.location === 'right').length === 0 && (
                                    <IconScale size={40} className="text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* بنك الكلمات (Word Bank) */}
            <div ref={bankRef} className="mt-56 w-full max-w-4xl px-8 flex flex-col items-center z-30">
                 <div className="w-full min-h-[120px] bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-center gap-3 border-dashed">
                     <AnimatePresence>
                         {items.filter(i => i.location === 'bank').map(word => (
                            <DraggableWord key={word.uniqueId} word={word} />
                         ))}
                     </AnimatePresence>
                     {items.filter(i => i.location === 'bank').length === 0 && (
                         <span className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">All_Nodes_Deployed</span>
                     )}
                 </div>

                 {/* زر التحليل المترجم */}
                 <button 
                    onClick={checkBalance} 
                    className="group relative mt-10 px-12 py-5 bg-amber-600 text-black font-black rounded-2xl hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] active:scale-95 flex items-center gap-3 uppercase text-xs tracking-widest"
                 >
                    <IconScan size={22} className="group-hover:rotate-90 transition-transform" /> 
                    {t('admin_overview')}
                 </button>
            </div>

            {/* واجهة النتيجة (Success Modal) */}
            <AnimatePresence>
                {showResult && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 z-[30000] flex flex-col items-center justify-center p-8 backdrop-blur-2xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#0a0a0a] border-2 border-emerald-500/40 p-12 rounded-[3rem] w-full max-w-lg shadow-[0_0_100px_rgba(16,185,129,0.2)] text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 shadow-[0_0_20px_#10b981]"></div>
                            <IconCircleCheck size={80} className="text-emerald-500 mx-auto mb-6" stroke={1.5} />
                            
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">EQUILIBRIUM_ESTABLISHED</h2>
                            
                            <div className="space-y-3 mb-10 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                                {items.map(word => (
                                    <div key={word.uniqueId} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-colors">
                                        <span className="text-amber-400 font-black text-sm uppercase tracking-tight">{word.text}</span>
                                        <span className="text-white/40 text-xs font-bold font-cairo">{word.trans}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={() => setLevel(l => l + 1)} 
                                className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-2xl transition-all uppercase tracking-widest text-xs"
                            >
                                {t('archive_load_more')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* شعار اللعبة في الأسفل */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-10 pointer-events-none`}>
            <div className="h-px w-16 bg-amber-500"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white">Quantum_Balance_Protocol</span>
            <div className="h-px w-16 bg-amber-500"></div>
        </div>
    </div>
  );
}