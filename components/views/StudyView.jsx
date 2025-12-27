"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { IconInfinity, IconCpu } from '@tabler/icons-react';
import { StudyCard } from '../StudyCard';
import { useUI } from '../../context/UIContext';

export default function StudyView({ 
  currentCard, 
  sessionStats, 
  handleSwipe, 
  setSessionStats, 
  playSFX, 
  speak 
}) {
  const { setCurrentView } = useUI();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative pb-32">
        {currentCard ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex flex-col items-center"
            >
                <div className="mb-2 flex items-center gap-2 text-cyan-500/50">
                    <IconInfinity size={20} />
                    <span className="text-xs font-mono tracking-[0.3em]">UNLIMITED_LEARNING_PROTOCOL</span>
                </div>

                <StudyCard 
                    card={currentCard} 
                    sessionStats={sessionStats}
                    onResult={(id, known) => {
                         if (known) {
                            setSessionStats(prev => ({ ...prev, correct: prev.correct + 1 }));
                            playSFX('success');
                         } else {
                            setSessionStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
                            playSFX('error');
                         }
                         setTimeout(() => {
                            handleSwipe(known ? 'right' : 'left');
                         }, 300);
                    }} 
                    speak={speak}
                />
            </motion.div>
        ) : (
            <div className="text-center p-10 glass-card-pro rounded-2xl backdrop-blur-md">
                <IconCpu size={64} className="text-cyan-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-black text-cyan-400 mb-2 glitch-text" data-text="ALL DATA PROCESSED">ALL DATA PROCESSED</h2>
                <p className="text-white/50 text-sm mb-6">Neural link synced. No more cards due.</p>
                
                <div className="flex gap-6 justify-center mb-8 text-lg font-mono border border-white/10 p-4 rounded-xl bg-black/40">
                    <div className="text-green-500 font-bold">✓ {sessionStats.correct} Correct</div>
                    <div className="text-red-500 font-bold">✕ {sessionStats.wrong} Wrong</div>
                </div>

                <button onClick={() => setCurrentView('home')} className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-500 shadow-[0_0_20px_#06b6d4]">RETURN TO BASE</button>
            </div>
        )}
    </div>
  );
}