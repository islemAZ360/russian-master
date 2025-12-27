"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { 
  IconBolt, IconPuzzle, IconCode, IconRadioactive, IconClock, 
  IconAbc, IconEar 
} from "@tabler/icons-react";

export default function GamesView({ cards }) {
  const { setActiveOverlayGame } = useUI();

  const GAMES = [
    { id: 'time_traveler', title: 'CHRONO_TRIGGER', desc: 'Master Time', color: 'text-yellow-400', border: 'border-yellow-500', icon: <IconClock size={40}/>, isOverlay: true },
    { id: 'flash', title: 'FLASH_PROTOCOL', desc: 'Speed Binary', color: 'text-cyan-400', border: 'border-cyan-500', icon: <IconBolt size={40}/> },
    { id: 'reactor', title: 'CORE_MELTDOWN', desc: 'Critical Thinking', color: 'text-red-400', border: 'border-red-500', icon: <IconRadioactive size={40}/> },
    { id: 'syntax', title: 'SYNTAX_HACK', desc: 'Code Breaker', color: 'text-purple-400', border: 'border-purple-500', icon: <IconCode size={40}/> },
    { id: 'scramble', title: 'CIPHER_DECODE', desc: 'Reconstruct Data', color: 'text-blue-400', border: 'border-blue-500', icon: <IconAbc size={40}/> },
    { id: 'audio', title: 'AUDIO_INTERCEPT', desc: 'Signal Analysis', color: 'text-green-400', border: 'border-green-500', icon: <IconEar size={40}/> },
    { id: 'logic', title: 'LOGIC_GATE', desc: 'Pattern Match', color: 'text-orange-400', border: 'border-orange-500', icon: <IconPuzzle size={40}/> },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {GAMES.map((game, i) => (
                <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setActiveOverlayGame(game.id)} // استخدام نفس المنطق الأصلي
                    className={`relative h-40 cursor-pointer bg-black/40 border-2 ${game.border} rounded-lg overflow-hidden group hover:bg-white/5 transition-all`}
                >
                    {/* Scanline overlay for card */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 group-hover:scale-105 transition-transform duration-300">
                        <div className={`mb-2 ${game.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`}>{game.icon}</div>
                        <h3 className={`font-black tracking-[0.2em] text-lg ${game.color} drop-shadow-md`}>{game.title}</h3>
                        <p className="text-[10px] text-white/50 font-mono mt-1 uppercase">{game.desc}</p>
                    </div>

                    {/* Corner accents */}
                    <div className={`absolute top-0 left-0 w-2 h-2 ${game.border.replace('border', 'bg')}`}></div>
                    <div className={`absolute bottom-0 right-0 w-2 h-2 ${game.border.replace('border', 'bg')}`}></div>
                </motion.div>
            ))}
        </div>
    </div>
  );
}