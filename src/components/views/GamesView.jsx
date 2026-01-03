"use client";
import React from 'react';
// هذا هو السطر الذي كان ناقصاً ويسبب المشكلة 👇
import { motion } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { IconClock, IconTarget, IconMagnet, IconScale, IconPlayerPlay } from "@tabler/icons-react";

export default function GamesView() {
  const { setActiveOverlayGame } = useUI();

  const GAMES = [
    { 
      id: 'time_traveler', title: 'CHRONO MASTER', desc: 'Learn Russian time system.', color: 'text-amber-400', icon: <IconClock size={40} />, bg: 'bg-amber-500/10'
    },
    { 
      id: 'gravity', title: 'GRAVITY PROTOCOL', desc: 'Master Russian prepositions.', color: 'text-cyan-400', icon: <IconTarget size={40} />, bg: 'bg-cyan-500/10'
    },
    { 
      id: 'magnet', title: 'MAGNETIC FIELD', desc: 'Extract word roots.', color: 'text-purple-400', icon: <IconMagnet size={40} />, bg: 'bg-purple-500/10'
    },
    { 
      id: 'scale', title: 'WORD SCALE', desc: 'Balance category weights.', color: 'text-emerald-400', icon: <IconScale size={40} />, bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar pb-32">
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-black text-white mb-2">NEURAL ARCADE</h1>
            <p className="text-white/40 font-mono text-xs tracking-widest uppercase">Select Training Module</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {GAMES.map((game) => (
                <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveOverlayGame(game.id)}
                    className={`p-8 rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-xl cursor-pointer flex flex-col justify-between group transition-all hover:border-white/20`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${game.bg} ${game.color}`}>
                            {game.icon}
                        </div>
                        <IconPlayerPlay className="text-white/10 group-hover:text-white/50 transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white mb-2">{game.title}</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{game.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );
}