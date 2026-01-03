"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// FIX: استخدام @ للمسارات
import { MAGNET_DATA } from '@/data/games/magnetData';
import { IconMagnet, IconArrowLeft, IconAtom } from '@tabler/icons-react';

export default function MagneticField({ onClose }) {
  const [level, setLevel] = useState(0);
  const [collected, setCollected] = useState([]);
  const [magnetPos, setMagnetPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  
  const currentLevel = MAGNET_DATA[level % MAGNET_DATA.length];
  const [words, setWords] = useState([]);

  useEffect(() => {
      setWords(currentLevel.words.map(w => ({
          ...w,
          id: Math.random(),
          x: Math.random() * (window.innerWidth - 300) + 200,
          y: Math.random() * (window.innerHeight - 200) + 100,
          vx: 0, vy: 0,
          isAttracted: false
      })));
      setCollected([]);
  }, [level, currentLevel]);

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
                const ATTRACTION_START_DISTANCE = 130;

                if (dist < ATTRACTION_START_DISTANCE && word.type === 'related') {
                    isAttractedNow = true;
                    const force = 1200 / (dist * dist + 10);
                    newVx += dx * force * 0.15;
                    newVy += dy * force * 0.15;
                    
                    if (dist < 50) {
                        newVx *= 0.6;
                        newVy *= 0.6;
                    } else {
                        newVx *= 0.9;
                        newVy *= 0.9;
                    }
                } else {
                    newVx *= 0.5; 
                    newVy *= 0.5;
                }

                if (word.x < 300) newVx += 1;
                if (word.x > window.innerWidth - 50) newVx -= 1;

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
    updatePhysics();
    return () => cancelAnimationFrame(animationFrame);
  }, [magnetPos, collected]);

  useEffect(() => {
      const interval = setInterval(() => {
          setWords(prev => {
            const newCollected = [];
            prev.forEach(word => {
                if(collected.includes(word.id)) return;
                const dist = Math.sqrt(Math.pow(magnetPos.x - word.x, 2) + Math.pow(magnetPos.y - word.y, 2));
                
                if(dist < 40 && word.type === 'related') { 
                     newCollected.push(word.id);
                }
            });
            if(newCollected.length > 0) setCollected(curr => [...curr, ...newCollected]);
            return prev;
          });
      }, 50);
      return () => clearInterval(interval);
  }, [magnetPos, collected]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#090014] font-sans overflow-hidden cursor-none" 
         onMouseMove={(e) => setMagnetPos({ x: e.clientX, y: e.clientY })}
         ref={containerRef}>
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

      <div className="absolute left-0 top-0 w-72 h-full bg-black/60 border-r border-purple-500/20 backdrop-blur-xl p-6 z-20 pointer-events-auto">
         <button onClick={onClose} className="mb-8 text-white/50 hover:text-white flex gap-2 text-xs font-bold tracking-widest"><IconArrowLeft size={16}/> EXIT</button>
         <div className="mb-6">
             <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-1">Target Root</div>
             <h1 className="text-4xl font-black text-white">{currentLevel.root}</h1>
         </div>
         <div className="space-y-2">
             {currentLevel.words.filter(w => w.type === 'related').map((w, i) => {
                 const isCollected = collected.includes(words.find(wd => wd.text === w.text)?.id);
                 return (
                     <div key={i} className={`p-3 rounded border flex justify-between items-center transition-all ${isCollected ? 'bg-purple-600 border-purple-400 text-white' : 'bg-transparent border-white/10 text-white/30'}`}>
                         <span>{w.text}</span>
                         {isCollected && <IconAtom size={14} className="animate-spin"/>}
                     </div>
                 );
             })}
         </div>
         {collected.length >= currentLevel.words.filter(w => w.type === 'related').length && (
             <button onClick={() => setLevel(l=>l+1)} className="mt-8 w-full py-3 bg-white text-black font-bold rounded shadow-lg animate-pulse">NEXT WAVE</button>
         )}
      </div>

      <div className="fixed pointer-events-none z-50 mix-blend-screen" style={{ left: magnetPos.x, top: magnetPos.y, transform: 'translate(-50%, -50%)' }}>
          <div className="w-16 h-16 rounded-full border-2 border-purple-400 bg-purple-500/20 shadow-[0_0_30px_#a855f7] flex items-center justify-center">
              <IconMagnet className="text-white"/>
          </div>
          <div className="absolute w-[260px] h-[260px] rounded-full border border-white/5 -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {words.map(word => {
          if (collected.includes(word.id)) return null;
          return (
              <motion.div
                 key={word.id}
                 animate={{ x: word.x, y: word.y }}
                 transition={{ duration: 0 }} 
                 className={`absolute px-4 py-2 rounded-lg font-mono text-sm font-bold border flex items-center justify-center transition-all duration-200 z-30
                    ${word.isAttracted 
                        ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_20px_#a855f7] scale-110' 
                        : 'bg-[#1a1a1a] text-gray-500 border-white/10'}`}
                 style={{ x: "-50%", y: "-50%" }}
              >
                  {word.text}
              </motion.div>
          );
      })}
    </div>
  );
}