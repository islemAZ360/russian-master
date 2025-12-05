// FILE: components/ranks/RankSystem.jsx
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { IconCrown, IconMedal, IconStar } from '@tabler/icons-react';

export default function RankSystem({ xp }) {
  // حساب الرتبة (معادلة بسيطة)
  const level = Math.floor(Math.sqrt(xp / 100)); 
  const progress = (xp - (level * level * 100)) / ((level + 1) * 100 - (level * level * 100)) * 100;
  
  const ranks = ["Recruit", "Soldier", "Corporal", "Sergeant", "Lieutenant", "Captain", "Major", "Colonel", "General", "Marshal"];
  const rankName = ranks[Math.min(level, ranks.length - 1)] || "Legend";

  return (
    <div className="w-full glass-card p-6 rounded-2xl border-t-4 border-t-purple-500">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest">Current Rank</h3>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
                {level >= 8 ? <IconCrown className="text-yellow-400"/> : <IconMedal className="text-purple-400"/>}
                {rankName}
            </h2>
        </div>
        <div className="text-right">
            <div className="text-3xl font-black text-white">{level}</div>
            <div className="text-[10px] text-white/30 uppercase">Level</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-black/50 rounded-full overflow-hidden border border-white/10">
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-500"
        />
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-shimmer"></div>
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] text-white/40 font-mono">
        <span>{xp} XP</span>
        <span>NEXT: {((level + 1) * (level + 1) * 100)} XP</span>
      </div>
    </div>
  );
}