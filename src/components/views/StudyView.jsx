"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconInfinity, IconCpu } from '@tabler/icons-react';

// FIX: المسار الصحيح للبطاقة داخل features/study
import { StudyCard } from '@/components/features/study/StudyCard';
import { useUI } from '@/context/UIContext'; // استخدام @

export default function StudyView({ 
  currentCard, sessionStats, handleSwipe, setSessionStats, playSFX, speak 
}) {
  const { setCurrentView } = useUI();
  const [combo, setCombo] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState([]);

  const spawnFloatingText = (text, type) => {
      const id = Date.now();
      setFloatingTexts(prev => [...prev, { id, text, type, x: Math.random() * 60 - 30 }]);
      setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000);
  };

  const handleResult = (known) => {
      if (known) {
          const newCombo = combo + 1;
          setCombo(newCombo);
          setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
          playSFX('success');
          spawnFloatingText("+10 XP", "success");
      } else {
          setCombo(0);
          setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
          playSFX('error');
          spawnFloatingText("GLITCH", "error");
      }
      setTimeout(() => handleSwipe(known ? 'right' : 'left'), 300);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative pb-32">
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <AnimatePresence>
                {floatingTexts.map(ft => (
                    <motion.div key={ft.id} initial={{ opacity: 0, y: 0, x: ft.x, scale: 0.5 }} animate={{ opacity: 1, y: -120, scale: 1.5 }} exit={{ opacity: 0 }} className={`absolute font-black text-4xl italic drop-shadow-lg z-[100] ${ft.type === 'success' ? 'text-yellow-400' : 'text-red-500'}`}>{ft.text}</motion.div>
                ))}
            </AnimatePresence>
        </div>
        {combo > 1 && (
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} key={combo} className="absolute top-24 text-center z-20">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-orange-600 drop-shadow-xl italic">{combo}x STREAK</div>
            </motion.div>
        )}
        {currentCard ? (
            <motion.div key={currentCard.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="relative z-10 flex flex-col items-center w-full">
                <div className="mb-4 flex items-center gap-2 text-cyan-500/40"><IconInfinity size={20} className="animate-pulse" /><span className="text-[10px] font-mono tracking-[0.4em] uppercase">Neural Link Active</span></div>
                <StudyCard card={currentCard} sessionStats={sessionStats} onResult={handleResult} speak={speak} />
            </motion.div>
        ) : (
            <div className="text-center p-12 glass-card-pro rounded-[3rem] backdrop-blur-xl border-cyan-500/20">
                <IconCpu size={80} className="text-cyan-500 mx-auto mb-6 animate-pulse" />
                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase italic">Data Synced</h2>
                <button onClick={() => setCurrentView('home')} className="px-12 py-4 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 shadow-lg transition-all uppercase tracking-widest text-xs">Return to Base</button>
            </div>
        )}
    </div>
  );
}