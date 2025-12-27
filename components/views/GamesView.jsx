"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useUI } from '../../context/UIContext';
import { IconClock } from "@tabler/icons-react";

export default function GamesView() {
  const { setActiveOverlayGame } = useUI();

  // مصفوفة الألعاب تحتوي الآن عنصراً واحداً فقط
  const GAMES = [
    { 
      id: 'time_traveler', 
      title: 'CHRONO_TRIGGER', 
      desc: 'Master Time', 
      color: 'text-yellow-400', 
      border: 'border-yellow-500', 
      icon: <IconClock size={40}/>, 
      isOverlay: true 
    }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6">
        <div className="grid grid-cols-1 gap-6 w-full max-w-md">
            {GAMES.map((game, i) => (
                <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setActiveOverlayGame(game.id)}
                    className={`relative h-64 cursor-pointer bg-black/40 border-2 ${game.border} rounded-2xl overflow-hidden group hover:bg-white/5 transition-all shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.2)]`}
                >
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[size:100%_4px] opacity-20 pointer-events-none"></div>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 group-hover:scale-105 transition-transform duration-300">
                        <div className={`mb-4 ${game.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] animate-pulse`}>{game.icon}</div>
                        <h3 className={`font-black tracking-[0.2em] text-2xl ${game.color} drop-shadow-md`}>{game.title}</h3>
                        <p className="text-xs text-white/50 font-mono mt-2 uppercase tracking-widest">{game.desc}</p>
                    </div>

                    {/* Corner accents */}
                    <div className={`absolute top-0 left-0 w-3 h-3 ${game.border.replace('border', 'bg')}`}></div>
                    <div className={`absolute top-0 right-0 w-3 h-3 ${game.border.replace('border', 'bg')}`}></div>
                    <div className={`absolute bottom-0 left-0 w-3 h-3 ${game.border.replace('border', 'bg')}`}></div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${game.border.replace('border', 'bg')}`}></div>
                </motion.div>
            ))}
        </div>
    </div>
  );
}