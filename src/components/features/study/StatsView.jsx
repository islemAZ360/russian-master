"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  IconTrophy, IconFlame, IconActivity, IconSchool, 
  IconLock, IconMedal, IconChartBar 
} from "@tabler/icons-react";

export function StatsView({ cards }) {
  // حساب الإحصائيات
  const total = cards.length;
  const mastered = cards.filter(c => c.level >= 5).length;
  const learning = cards.filter(c => c.level > 0 && c.level < 5).length;
  const fresh = cards.filter(c => c.level === 0).length;
  
  // نظام النقاط والمستويات (تقديري)
  const xp = (mastered * 100) + (learning * 20);
  const level = Math.floor(xp / 500) + 1;
  const nextLevelXp = level * 500;
  const progress = Math.min(100, (xp / nextLevelXp) * 100);

  // قائمة الأوسمة
  const BADGES = [
    { name: "Novice", desc: "Add 5 words", icon: <IconSchool/>, unlocked: total >= 5 },
    { name: "Scholar", desc: "Master 10 words", icon: <IconMedal/>, unlocked: mastered >= 10 },
    { name: "Veteran", desc: "Reach Lvl 5", icon: <IconTrophy/>, unlocked: level >= 5 },
    { name: "Legend", desc: "1000 XP", icon: <IconFlame/>, unlocked: xp >= 1000 },
  ];

  const StatCard = ({ icon: Icon, title, value, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay }}
        className="bg-[#0f0f0f] border border-white/10 p-6 rounded-2xl relative overflow-hidden group hover:border-white/30 transition-colors"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={80} />
        </div>
        <div className={`p-3 rounded-xl w-fit mb-4 ${color} bg-opacity-10 border border-white/5`}>
            <Icon size={24} />
        </div>
        <div className="text-4xl font-black text-white mb-1 font-mono">{value}</div>
        <div className="text-white/40 font-bold uppercase tracking-widest text-xs">{title}</div>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar pb-32 font-sans">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 mb-8">
            <IconChartBar size={32} className="text-cyan-500" />
            <h2 className="text-3xl font-black text-white tracking-widest">NEURAL STATS</h2>
        </div>

        {/* Level Progress Section */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-cyan-500/30 p-8 rounded-3xl mb-8 relative overflow-hidden"
        >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Level Circle */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="60" className="stroke-gray-800" strokeWidth="8" fill="transparent" />
                        <circle 
                            cx="64" cy="64" r="60" 
                            className="stroke-cyan-500" strokeWidth="8" fill="transparent"
                            strokeDasharray="377" 
                            strokeDashoffset={377 - (377 * progress) / 100}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm text-cyan-400 font-bold">LEVEL</span>
                        <span className="text-4xl font-black text-white">{level}</span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex justify-between text-white mb-2 font-bold tracking-wider">
                        <span>XP PROGRESS</span>
                        <span className="text-cyan-400">{xp} / {nextLevelXp} XP</span>
                    </div>
                    <div className="h-3 bg-black rounded-full overflow-hidden border border-white/10">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 relative"
                        >
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                        </motion.div>
                    </div>
                    <p className="mt-4 text-white/40 text-sm font-mono">
                        &gt; System Analysis: Keep reviewing cards to increase neural density.
                    </p>
                </div>
            </div>
        </motion.div>

        {/* Stats Grid */}
        <h3 className="text-white/50 font-bold uppercase tracking-widest text-sm mb-4">Database Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon={IconSchool} title="Total Data" value={total} color="text-blue-500" delay={0.1} />
            <StatCard icon={IconTrophy} title="Mastered" value={mastered} color="text-emerald-500" delay={0.2} />
            <StatCard icon={IconActivity} title="Learning" value={learning} color="text-purple-500" delay={0.3} />
            <StatCard icon={IconFlame} title="New" value={fresh} color="text-orange-500" delay={0.4} />
        </div>

        {/* Badges Section */}
        <h3 className="text-white/50 font-bold uppercase tracking-widest text-sm mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BADGES.map((badge, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                        badge.unlocked 
                        ? 'bg-yellow-900/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                        : 'bg-black/40 border-white/5 opacity-50 grayscale'
                    }`}
                >
                    <div className={`mb-3 text-3xl ${badge.unlocked ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'text-white/20'}`}>
                        {badge.unlocked ? badge.icon : <IconLock size={28}/>}
                    </div>
                    <div className={`font-black text-sm mb-1 ${badge.unlocked ? 'text-white' : 'text-white/40'}`}>
                        {badge.name}
                    </div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider font-bold">
                        {badge.desc}
                    </div>
                </motion.div>
            ))}
        </div>

      </div>
    </div>
  );
}