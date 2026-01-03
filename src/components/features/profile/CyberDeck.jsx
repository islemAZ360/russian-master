"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  IconUser, IconTrophy, IconFlame, IconTarget, 
  IconActivity, IconLock, IconClock, IconMedal, IconCrown 
} from "@tabler/icons-react";

// (RANKS array code remains the same as before...)
const RANKS = [
    { name: "RECRUIT (مجند)", min: 0, color: "text-gray-400", icon: <IconUser /> },
    { name: "SOLDIER (جندي)", min: 100, color: "text-green-400", icon: <IconTarget /> },
    { name: "HACKER (هاكر)", min: 500, color: "text-cyan-400", icon: <IconActivity /> },
    { name: "ELITE (نخبة)", min: 1500, color: "text-purple-400", icon: <IconMedal /> },
    { name: "COMMANDER (قائد)", min: 3000, color: "text-orange-400", icon: <IconTrophy /> },
    { name: "LEGEND (أسطورة)", min: 5000, color: "text-yellow-400", icon: <IconCrown /> },
    { name: "CYBER GOD (إله سيبراني)", min: 10000, color: "text-red-500", icon: <IconFlame /> },
];

export default function CyberDeck({ user, stats, cards }) {
  const xp = stats?.xp || 0;
  const streak = stats?.streak || 0;
  
  const currentRankIndex = RANKS.findIndex((r, i) => {
      const next = RANKS[i + 1];
      return xp >= r.min && (!next || xp < next.min);
  });
  const rank = RANKS[currentRankIndex] || RANKS[0];
  const nextRank = RANKS[currentRankIndex + 1];

  let progress = 100;
  if (nextRank) {
      const totalNeeded = nextRank.min - rank.min;
      const currentEarned = xp - rank.min;
      progress = Math.min(100, Math.max(0, (currentEarned / totalNeeded) * 100));
  }

  const masteredWords = cards.filter(c => c.level >= 5).length;
  const estimatedMinutes = Math.floor(xp * 1.5); 
  const hoursPlayed = (estimatedMinutes / 60).toFixed(1);

  return (
    // تم إزالة overflow-y-auto من هنا لأن الحاوية الأم في CyberLayout تقوم بذلك الآن
    <div className="w-full pb-10">
        <div className="max-w-4xl mx-auto space-y-8">
            
            {/* بطاقة الهوية */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 overflow-hidden shadow-xl"
            >
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    
                    <div className="relative shrink-0">
                        <div className={`w-32 h-32 rounded-2xl bg-black/40 border-2 border-dashed ${rank.color.replace('text-', 'border-')} flex items-center justify-center`}>
                            <div className={`scale-[2.5] ${rank.color} drop-shadow-lg`}>
                                {rank.icon}
                            </div>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#111] border border-white/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold text-white whitespace-nowrap">
                            LVL {currentRankIndex + 1}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                            <h2 className="text-sm font-bold text-white/40 tracking-[0.3em] uppercase">Operative ID</h2>
                            <span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 border border-white/10 ${rank.color}`}>
                                {rank.name}
                            </span>
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 truncate max-w-full">
                            {user?.displayName || user?.email?.split('@')[0].toUpperCase() || "UNKNOWN"}
                        </h1>
                        
                        <div className="mt-6">
                            <div className="flex justify-between text-xs font-mono text-[var(--accent-color)] mb-1">
                                <span>CURRENT XP: {xp}</span>
                                <span>NEXT: {nextRank ? nextRank.min : "MAX"}</span>
                            </div>
                            <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5 relative">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-[var(--accent-color)] to-purple-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* الإحصائيات */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox icon={<IconFlame size={24}/>} value={streak} label="Day Streak" color="text-orange-500" />
                <StatBox icon={<IconTarget size={24}/>} value={cards.length} label="Total Words" color="text-blue-500" />
                <StatBox icon={<IconTrophy size={24}/>} value={masteredWords} label="Mastered" color="text-yellow-500" />
                <StatBox icon={<IconClock size={24}/>} value={`${hoursPlayed}h`} label="Training Time" color="text-emerald-500" />
            </div>

            {/* الإنجازات */}
            <div className="pt-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <IconMedal className="text-purple-500" /> MISSION BADGES
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RANKS.map((r, i) => {
                        const isUnlocked = xp >= r.min;
                        if (i === 0) return null;
                        return (
                            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${isUnlocked ? 'bg-black/30 border-white/10' : 'bg-black/10 border-white/5 opacity-50 grayscale'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isUnlocked ? `bg-white/5 ${r.color.replace('text-', 'border-')}` : 'border-white/10 bg-white/5'}`}>
                                    {isUnlocked ? r.icon : <IconLock size={18} />}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-white/30'}`}>{r.name}</h4>
                                    <p className="text-xs text-white/30">Required: {r.min} XP</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    </div>
  );
}

const StatBox = ({ icon, value, label, color }) => (
    <div className="bg-black/20 border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-black/30 transition-colors backdrop-blur-sm">
        <div className={`${color} mb-3`}>{icon}</div>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{label}</div>
    </div>
);