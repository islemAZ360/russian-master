"use client";
import React from "react";
import { motion } from "framer-motion";
import { IconUser, IconTrophy, IconFlame, IconTarget, IconActivity, IconLock } from "@tabler/icons-react";

const ACHIEVEMENTS_LIST = [
    { id: 'rookie', name: 'Neural Link', desc: 'Completed first session', icon: '🔌', req: 10 },
    { id: 'streak_3', name: 'Momentum', desc: '3 Day Streak', icon: '🔥', req: 300 },
    { id: 'pro', name: 'Data Hunter', desc: 'Reached 1000 XP', icon: '💎', req: 1000 },
    { id: 'master', name: 'Cyber Lord', desc: 'Reached 5000 XP', icon: '👑', req: 5000 },
];

export default function CyberDeck({ user, stats, cards }) {
  // حسابات المستوى
  const xp = stats.xp || 0;
  const level = Math.floor(xp / 500) + 1;
  const nextLevelXp = level * 500;
  const progress = ((xp - (level - 1) * 500) / 500) * 100;
  
  const mastered = cards.filter(c => c.level >= 5).length;

  return (
    <div className="w-full h-screen overflow-y-auto custom-scrollbar p-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
            
            {/* بطاقة الهوية (ID CARD) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-r from-[#0a0a0a] to-[#111] border border-cyan-500/30 rounded-3xl p-8 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.1)]"
            >
                {/* Holographic Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-4 opacity-20"><IconUser size={120} className="text-cyan-500"/></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    {/* Avatar Hexagon */}
                    <div className="relative w-32 h-32">
                        <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 rounded-full"></div>
                        <div className="w-full h-full bg-black border-2 border-cyan-500 flex items-center justify-center text-6xl rounded-2xl shadow-lg relative overflow-hidden">
                            {stats.avatar || "👤"}
                            <div className="absolute bottom-0 w-full h-1 bg-cyan-500 animate-[pulse_2s_infinite]"></div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 bg-cyan-600 text-black font-black px-3 py-1 rounded text-xs">LVL {level}</div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="text-cyan-500 text-xs font-bold tracking-[0.3em] uppercase">Operative Profile</div>
                        <h1 className="text-4xl font-black text-white">{user?.email?.split('@')[0].toUpperCase()}</h1>
                        <p className="text-white/40 font-mono text-xs">{user?.uid}</p>
                        
                        {/* XP Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-cyan-400 mb-1 font-bold">
                                <span>PROGRESS</span>
                                <span>{xp} / {nextLevelXp} XP</span>
                            </div>
                            <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} 
                                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite]"></div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* الإحصائيات التكتيكية */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox icon={<IconFlame/>} value={stats.streak || 0} label="Day Streak" color="text-orange-500" border="border-orange-500/20" />
                <StatBox icon={<IconTarget/>} value={cards.length} label="Total Data" color="text-blue-500" border="border-blue-500/20" />
                <StatBox icon={<IconTrophy/>} value={mastered} label="Mastered" color="text-yellow-500" border="border-yellow-500/20" />
                <StatBox icon={<IconActivity/>} value={`${Math.round((mastered/Math.max(cards.length,1))*100)}%`} label="Efficiency" color="text-emerald-500" border="border-emerald-500/20" />
            </div>

            {/* الأوسمة (Achievements) */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><IconTrophy className="text-yellow-500"/> ACHIEVEMENTS</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ACHIEVEMENTS_LIST.map(ach => {
                        const isUnlocked = xp >= ach.req;
                        return (
                            <div key={ach.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${isUnlocked ? 'bg-gradient-to-r from-yellow-900/10 to-black border-yellow-500/30' : 'bg-black/40 border-white/5 opacity-50 grayscale'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border ${isUnlocked ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-white/5 border-white/10'}`}>
                                    {isUnlocked ? ach.icon : <IconLock size={18}/>}
                                </div>
                                <div>
                                    <h3 className={`font-bold ${isUnlocked ? 'text-yellow-400' : 'text-white/40'}`}>{ach.name}</h3>
                                    <p className="text-xs text-white/40">{ach.desc}</p>
                                </div>
                                {isUnlocked && <div className="ml-auto text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">UNLOCKED</div>}
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    </div>
  );
}

const StatBox = ({ icon, value, label, color, border }) => (
    <div className={`bg-[#0a0a0a] border ${border} p-4 rounded-2xl flex flex-col items-center justify-center text-center`}>
        <div className={`${color} mb-2`}>{icon}</div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-[10px] text-white/30 uppercase tracking-widest">{label}</div>
    </div>
);