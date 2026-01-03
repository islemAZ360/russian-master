"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  IconUser, IconTrophy, IconFlame, IconTarget, 
  IconActivity, IconLock, IconClock, IconMedal, IconCrown 
} from "@tabler/icons-react";

// --- نظام الرتب ---
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
  // 1. استخراج البيانات وحمايتها من القيم الفارغة
  const xp = stats?.xp || 0;
  const streak = stats?.streak || 0;
  
  // 2. حساب الرتبة الحالية
  const currentRankIndex = RANKS.findIndex((r, i) => {
      const next = RANKS[i + 1];
      return xp >= r.min && (!next || xp < next.min);
  });
  const rank = RANKS[currentRankIndex] || RANKS[0];
  const nextRank = RANKS[currentRankIndex + 1];

  // 3. حساب نسبة التقدم للرتبة التالية
  let progress = 100;
  if (nextRank) {
      const totalNeeded = nextRank.min - rank.min;
      const currentEarned = xp - rank.min;
      progress = Math.min(100, Math.max(0, (currentEarned / totalNeeded) * 100));
  }

  // 4. إحصائيات مشتقة
  const masteredWords = cards.filter(c => c.level >= 5).length;
  // تقدير: كل 10 نقاط تعادل دقيقتين من الدراسة (مجرد تقدير لملء البيانات)
  const estimatedMinutes = Math.floor(xp * 1.5); 
  const hoursPlayed = (estimatedMinutes / 60).toFixed(1);

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
            
            {/* --- بطاقة الهوية (ID CARD) --- */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-10 overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.05)]"
            >
                {/* خلفية زخرفية */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    
                    {/* صورة الرتبة */}
                    <div className="relative shrink-0">
                        <div className={`w-32 h-32 rounded-2xl bg-black border-2 border-dashed ${rank.color.replace('text-', 'border-')} flex items-center justify-center`}>
                            <div className={`scale-[2.5] ${rank.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
                                {rank.icon}
                            </div>
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#111] border border-white/20 px-3 py-1 rounded-full text-[10px] uppercase font-bold text-white whitespace-nowrap">
                            LVL {currentRankIndex + 1}
                        </div>
                    </div>

                    {/* معلومات اللاعب */}
                    <div className="flex-1 text-center md:text-left w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                            <h2 className="text-sm font-bold text-white/40 tracking-[0.3em] uppercase">Operative ID</h2>
                            <span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 border border-white/10 ${rank.color}`}>
                                {rank.name}
                            </span>
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 truncate max-w-full">
                            {user?.email?.split('@')[0].toUpperCase() || "UNKNOWN"}
                        </h1>
                        
                        {/* شريط التقدم للرتبة التالية */}
                        <div className="mt-6">
                            <div className="flex justify-between text-xs font-mono text-cyan-400 mb-1">
                                <span>CURRENT XP: {xp}</span>
                                <span>NEXT: {nextRank ? nextRank.min : "MAX"}</span>
                            </div>
                            <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5 relative">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-cyan-600 via-blue-500 to-purple-500"
                                />
                                {/* لمعان الشريط */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                            <p className="text-[10px] text-white/30 mt-2 text-right">
                                {nextRank 
                                    ? `${nextRank.min - xp} XP needed for promotion` 
                                    : "Maximum Rank Achieved"}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- شبكة الإحصائيات (Stats Grid) --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox 
                    icon={<IconFlame size={24}/>} 
                    value={streak} 
                    label="Day Streak" 
                    color="text-orange-500" 
                    borderColor="border-orange-500/20" 
                />
                <StatBox 
                    icon={<IconTarget size={24}/>} 
                    value={cards.length} 
                    label="Total Words" 
                    color="text-blue-500" 
                    borderColor="border-blue-500/20" 
                />
                <StatBox 
                    icon={<IconTrophy size={24}/>} 
                    value={masteredWords} 
                    label="Mastered" 
                    color="text-yellow-500" 
                    borderColor="border-yellow-500/20" 
                />
                <StatBox 
                    icon={<IconClock size={24}/>} 
                    value={`${hoursPlayed}h`} 
                    label="Training Time" 
                    color="text-emerald-500" 
                    borderColor="border-emerald-500/20" 
                />
            </div>

            {/* --- قائمة الجوائز (Achievements) --- */}
            <div className="pt-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <IconMedal className="text-purple-500" /> 
                    MISSION BADGES
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RANKS.map((r, i) => {
                        const isUnlocked = xp >= r.min;
                        if (i === 0) return null; // لا نعرض رتبة المجند كإنجاز
                        return (
                            <div 
                                key={i} 
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                                    isUnlocked 
                                    ? 'bg-gradient-to-r from-[#111] to-[#0a0a0a] border-white/10 opacity-100' 
                                    : 'bg-black border-white/5 opacity-40 grayscale'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${isUnlocked ? `bg-white/5 ${r.color.replace('text-', 'border-')}` : 'border-white/10 bg-white/5'}`}>
                                    {isUnlocked ? r.icon : <IconLock size={18} />}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${isUnlocked ? 'text-white' : 'text-white/30'}`}>
                                        Reach {r.name}
                                    </h4>
                                    <p className="text-xs text-white/30">
                                        Required: {r.min} XP
                                    </p>
                                </div>
                                {isUnlocked && (
                                    <div className="ml-auto">
                                        <IconLock className="text-green-500 opacity-0" size={16} /> 
                                        {/* أيقونة مخفية للحفاظ على التنسيق أو يمكن استبدالها بـ Check */}
                                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    </div>
  );
}

// مكون فرعي للمربعات الصغيرة
const StatBox = ({ icon, value, label, color, borderColor }) => (
    <div className={`bg-[#0a0a0a] border ${borderColor} p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-[#111] transition-colors group`}>
        <div className={`${color} mb-3 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
        <div className="text-3xl font-black text-white mb-1">{value}</div>
        <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{label}</div>
    </div>
);