"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: استخدام @ للمسارات
import { BALANCE_DATA } from '@/data/games/balanceData';
import { IconArrowLeft, IconScan, IconAtom, IconComponents } from '@tabler/icons-react';

export default function WordScale({ onClose }) {
  const [level, setLevel] = useState(0);
  const [items, setItems] = useState([]); 
  const [showResult, setShowResult] = useState(false);
  const [isError, setIsError] = useState(false);

  const leftPanRef = useRef(null);
  const rightPanRef = useRef(null);
  const bankRef = useRef(null);

  const currentData = BALANCE_DATA[level % BALANCE_DATA.length];

  useEffect(() => {
      const words = [currentData.mainWord, ...currentData.subWords].map((w, i) => ({
          uniqueId: `${level}-${i}`,
          ...w,
          location: 'bank'
      }));
      setItems(words);
      setShowResult(false);
  }, [level, currentData]);

  const leftWeight = items.filter(i => i.location === 'left').reduce((acc, w) => acc + w.weight, 0);
  const rightWeight = items.filter(i => i.location === 'right').reduce((acc, w) => acc + w.weight, 0);
  const diff = rightWeight - leftWeight;
  const rotation = Math.max(-25, Math.min(25, diff / 2));

  const handleDragEnd = (event, info, uniqueId) => {
      const dropPoint = { x: info.point.x, y: info.point.y };
      const leftRect = leftPanRef.current?.getBoundingClientRect();
      const rightRect = rightPanRef.current?.getBoundingClientRect();
      
      let newLocation = 'bank';

      if (leftRect && dropPoint.x >= leftRect.left - 50 && dropPoint.x <= leftRect.right + 50 && dropPoint.y >= leftRect.top - 100 && dropPoint.y <= leftRect.bottom + 50) {
          newLocation = 'left';
      } else if (rightRect && dropPoint.x >= rightRect.left - 50 && dropPoint.x <= rightRect.right + 50 && dropPoint.y >= rightRect.top - 100 && dropPoint.y <= rightRect.bottom + 50) {
          newLocation = 'right';
      }

      setItems(prev => prev.map(item => item.uniqueId === uniqueId ? { ...item, location: newLocation } : item));
  };

  const checkSolution = () => {
      const leftWords = items.filter(i => i.location === 'left');
      const rightWords = items.filter(i => i.location === 'right');
      
      if (leftWords.length === 0 && rightWords.length === 0) {
        setIsError(true); setTimeout(() => setIsError(false), 500); return;
      }

      const scenario1 = leftWords.some(w => w.text === currentData.mainWord.text) && 
                        currentData.subWords.every(sub => rightWords.some(rw => rw.text === sub.text)) &&
                        leftWords.length === 1 && rightWords.length === currentData.subWords.length;

      const scenario2 = rightWords.some(w => w.text === currentData.mainWord.text) && 
                        currentData.subWords.every(sub => leftWords.some(lw => lw.text === sub.text)) &&
                        rightWords.length === 1 && leftWords.length === currentData.subWords.length;

      if (scenario1 || scenario2) {
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
        whileDrag={{ scale: 1.1, zIndex: 9999, cursor: 'grabbing' }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-50 m-1"
    >
        <div className="px-3 py-1.5 bg-amber-500 text-black text-xs font-bold rounded-sm border border-amber-300 hover:bg-white transition-colors shadow-lg whitespace-nowrap">
            {word.text}
        </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-[#030005] text-amber-500 font-sans flex flex-col overflow-hidden selection:bg-amber-500/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,20,10,1),#000000)]"></div>
        
        <div className="w-full p-6 flex justify-between items-center z-10 relative">
             <button onClick={onClose} className="flex items-center gap-2 text-white/40 hover:text-white border border-white/10 px-4 py-2 rounded-full hover:bg-white/5 uppercase text-xs font-bold"><IconArrowLeft size={14}/> Abort</button>
             <h1 className="text-xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">QUANTUM SCALE</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-start relative pt-12">
            <div className={`relative w-[340px] md:w-[500px] h-[280px] z-10 transition-transform duration-100 ${isError ? 'translate-x-1 -translate-x-1' : ''}`}>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-gray-900 rounded-t-lg border-t border-white/10 z-0"></div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-56 bg-gradient-to-b from-gray-700 to-gray-900 z-0"></div>
                <div className="absolute top-[50px] left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-800 rounded-full border-2 border-amber-500/50 shadow-[0_0_30px_#f59e0b] z-20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full animate-pulse"></div>
                </div>

                <motion.div 
                    className="absolute top-[65px] left-1/2 w-[95%] h-3 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 rounded-sm origin-center z-10 border border-white/10 shadow-lg"
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 60, damping: 10 }}
                    style={{ x: "-50%" }}
                >
                    <div className="absolute left-2 top-2 w-[1px] h-24 bg-gradient-to-b from-amber-400 to-transparent origin-top" style={{ transform: `rotate(${-rotation}deg)` }}>
                        <div ref={leftPanRef} className="absolute bottom-0 -left-24 w-48 min-h-[120px] translate-y-full">
                            <div className="w-full h-full border-2 border-amber-500/30 bg-amber-900/40 rounded-xl backdrop-blur-md relative shadow-[0_0_30px_rgba(245,158,11,0.1)] flex flex-wrap content-start justify-center p-3 gap-2">
                                <AnimatePresence>{items.filter(i => i.location === 'left').map(w => <DraggableWord key={w.uniqueId} word={w} />)}</AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="absolute right-2 top-2 w-[1px] h-24 bg-gradient-to-b from-amber-400 to-transparent origin-top" style={{ transform: `rotate(${-rotation}deg)` }}>
                        <div ref={rightPanRef} className="absolute bottom-0 -right-24 w-48 min-h-[120px] translate-y-full">
                            <div className="w-full h-full border-2 border-amber-500/30 bg-amber-900/40 rounded-xl backdrop-blur-md relative shadow-[0_0_30px_rgba(245,158,11,0.1)] flex flex-wrap content-start justify-center p-3 gap-2">
                                 <AnimatePresence>{items.filter(i => i.location === 'right').map(w => <DraggableWord key={w.uniqueId} word={w} />)}</AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div ref={bankRef} className="mt-48 w-full max-w-3xl px-6 flex flex-col items-center z-20">
                 <div className="flex flex-wrap gap-3 justify-center w-full min-h-[100px] bg-black/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-inner">
                     <AnimatePresence>{items.filter(i => i.location === 'bank').map(word => <DraggableWord key={word.uniqueId} word={word} />)}</AnimatePresence>
                 </div>
                 <button onClick={checkSolution} className="group relative mt-8 px-10 py-4 bg-amber-900/20 border border-amber-500/50 rounded-full hover:bg-amber-500 hover:text-black transition-all">
                    <span className="font-black tracking-[0.2em] text-xs uppercase flex items-center gap-2"><IconScan size={20}/> Initiate Analysis</span>
                 </button>
            </div>

            <AnimatePresence>
                {showResult && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6">
                        <div className="bg-[#050505] border border-green-500/40 p-8 rounded-3xl w-full max-w-md shadow-2xl text-center">
                            <IconAtom size={56} className="text-green-500 mx-auto mb-4 animate-spin-slow"/>
                            <h2 className="text-3xl font-black text-white mb-6">EQUILIBRIUM</h2>
                            <div className="space-y-3 mb-8 max-h-[220px] overflow-y-auto custom-scrollbar">
                                {items.map(word => (
                                    <div key={word.uniqueId} className="flex justify-between p-3 bg-white/5 rounded text-sm">
                                        <span className="text-amber-400 font-bold">{word.text}</span>
                                        <span className="text-gray-400">{word.trans}</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setLevel(l => l + 1)} className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-500">NEXT BATCH</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}