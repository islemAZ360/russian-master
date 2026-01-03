"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: استخدام @ للمسارات
import { GRAVITY_DATA } from '@/data/games/gravityData';
import { IconBox, IconArrowLeft, IconCheck, IconX, IconLock, IconLockOpen } from '@tabler/icons-react';

export default function GravityProtocol({ onClose }) {
  const [level, setLevel] = useState(0);
  const [floorOrbs, setFloorOrbs] = useState([]); 
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  
  const [isBoxOpen, setIsBoxOpen] = useState(false);

  const currentData = GRAVITY_DATA[level % GRAVITY_DATA.length];
  const boxRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const uniqueOptions = [...new Set(currentData.options)]; 
    const orbs = uniqueOptions.map((word, i) => {
        const randomLeft = (i * (90 / uniqueOptions.length)) + 5;
        const randomBottom = 20 + Math.random() * 150;
        return {
            id: `orb-${level}-${i}`,
            text: word,
            left: randomLeft,
            bottom: randomBottom,
            delay: i * 0.15
        };
    });
    setFloorOrbs(orbs);
    setIsBoxOpen(false);
  }, [level, currentData]);

  const handleDragStart = () => {
      setIsBoxOpen(true);
  };

  const handleDragEnd = (event, info, id, text) => {
    setIsBoxOpen(false);
    const dropPoint = { x: info.point.x, y: info.point.y };
    const boxRect = boxRef.current.getBoundingClientRect();

    const isInsideBox = (
        dropPoint.x >= boxRect.left && 
        dropPoint.x <= boxRect.right && 
        dropPoint.y >= boxRect.top && 
        dropPoint.y <= boxRect.bottom
    );

    if (isInsideBox) {
        if (text === currentData.correct) {
            setScore(s => s + 100);
            setFeedback({ type: 'success', text: "DATA SECURED" });
            setFloorOrbs(prev => prev.filter(o => o.id !== id));
            setTimeout(() => {
                setFeedback(null);
                setLevel(l => l + 1);
            }, 1000);
        } else {
            setFeedback({ type: 'error', text: "INVALID DATA" });
            setTimeout(() => setFeedback(null), 1000);
        }
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] bg-[#050505] text-cyan-500 font-mono overflow-hidden select-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="absolute top-0 w-full p-6 flex justify-between z-10 pointer-events-none">
         <button onClick={onClose} className="pointer-events-auto flex items-center gap-2 border border-cyan-500/30 px-4 py-2 rounded-full text-xs hover:bg-cyan-900/20 text-white transition-all">
             <IconArrowLeft size={16}/> ABORT
         </button>
         <div className="text-2xl font-black text-cyan-400 drop-shadow-[0_0_10px_cyan]">{score}</div>
      </div>

      <div className="absolute top-24 w-full text-center pointer-events-none z-10 px-4">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg leading-tight">
          {currentData.sentence.replace('___', '_____')}
        </h2>
        <span className="bg-black/60 px-4 py-1 rounded border border-cyan-500/30 text-sm text-cyan-200/70">
            {currentData.translation}
        </span>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <motion.div 
            ref={boxRef}
            animate={{ 
                scale: isBoxOpen ? 1.1 : 1,
                borderColor: feedback?.type === 'error' ? '#ef4444' : feedback?.type === 'success' ? '#22c55e' : isBoxOpen ? '#00f2ff' : 'rgba(6,182,212,0.3)'
            }}
            className="relative w-64 h-64 border-4 rounded-3xl flex items-center justify-center bg-black/80 backdrop-blur-md overflow-hidden transition-colors duration-200"
          >
              <motion.div 
                initial={{ y: "0%" }}
                animate={{ y: isBoxOpen ? "-100%" : "0%" }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="absolute inset-0 bg-[#151515] z-30 border-b-4 border-white/10 flex items-center justify-center"
              >
                  <IconLock size={48} className="text-white/30" />
              </motion.div>

              <div className="text-center opacity-100 relative z-10">
                  <IconLockOpen size={64} className="mx-auto mb-2 text-cyan-400 animate-bounce" />
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white font-bold">DROP HERE</p>
              </div>
              <div className="absolute inset-0 bg-cyan-500/10 animate-pulse z-0"></div>
          </motion.div>
      </div>

      <div className="absolute inset-0 z-30 pointer-events-none">
          {floorOrbs.map((orb) => (
              <motion.div
                key={orb.id}
                drag
                dragConstraints={containerRef}
                dragElastic={0.2}
                dragSnapToOrigin={true}
                dragMomentum={false}
                onDragStart={handleDragStart}
                onDragEnd={(e, i) => handleDragEnd(e, i, orb.id, orb.text)}
                whileDrag={{ scale: 1.2, zIndex: 9999, cursor: 'grabbing' }}
                whileHover={{ scale: 1.1, zIndex: 50, cursor: 'grab' }}
                initial={{ y: -1000, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ type: "spring", stiffness: 50, damping: 12, delay: orb.delay }}
                style={{ position: 'absolute', left: `${orb.left}%`, bottom: `${orb.bottom}px`, touchAction: "none", pointerEvents: 'auto' }}
                className="w-24 h-24"
              >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-600 to-blue-900 border-2 border-white/50 shadow-[0_0_25px_rgba(0,242,255,0.5)] flex items-center justify-center text-white font-bold text-lg backdrop-blur-md">
                      {orb.text}
                  </div>
              </motion.div>
          ))}
      </div>

      <AnimatePresence>
        {feedback && (
            <motion.div 
                initial={{ opacity: 0, y: 20, x: "-50%", scale: 0.8 }}
                animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.8 }}
                className={`fixed bottom-12 left-1/2 px-6 py-2 rounded-full font-bold text-xs md:text-sm tracking-[0.2em] uppercase z-[200] backdrop-blur-md border shadow-xl flex items-center gap-3 whitespace-nowrap
                ${feedback.type === 'success' 
                    ? 'bg-green-950/80 border-green-500/50 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]' 
                    : 'bg-red-950/80 border-red-500/50 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}
            >
                {feedback.type === 'success' ? <IconCheck size={16} /> : <IconX size={16} />}
                {feedback.text}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}