"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  IconUser, IconTrophy, IconFlame, IconTarget, 
  IconActivity, IconLock, IconMedal, IconCrown, IconBolt, IconBrain, IconDna
} from "@tabler/icons-react";

// --- بيانات الرتب (كما هي) ---
const RANKS = [
    { name: "RECRUIT", min: 0, color: "text-gray-400", border: "border-gray-500", icon: <IconUser /> },
    { name: "SOLDIER", min: 100, color: "text-green-400", border: "border-green-500", icon: <IconTarget /> },
    { name: "HACKER", min: 500, color: "text-cyan-400", border: "border-cyan-500", icon: <IconActivity /> },
    { name: "ELITE", min: 1500, color: "text-purple-400", border: "border-purple-500", icon: <IconMedal /> },
    { name: "COMMANDER", min: 3000, color: "text-orange-400", border: "border-orange-500", icon: <IconTrophy /> },
    { name: "LEGEND", min: 5000, color: "text-yellow-400", border: "border-yellow-500", icon: <IconCrown /> },
    { name: "CYBER GOD", min: 10000, color: "text-red-500", border: "border-red-500", icon: <IconFlame /> },
];

// --- مكون مخطط الرادار (Skill Radar) ---
const SkillRadar = ({ stats }) => {
  // تحويل القيم إلى إحداثيات للمضلع
  // القيم الافتراضية للزوايا (أعلى، يمين، أسفل يمين، أسفل يسار، يسار)
  const values = [
    stats.vocab || 20, // مفردات
    stats.streak > 10 ? 100 : stats.streak * 10, // استمرار
    stats.xp > 1000 ? 100 : stats.xp / 10, // خبرة
    stats.mastered > 50 ? 100 : stats.mastered * 2, // إتقان
    80 // تركيز (قيمة افتراضية جمالية)
  ];

  const points = values.map((val, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const r = (val / 100) * 40; // نصف القطر (40% من حجم الـ SVG)
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative w-full aspect-square max-w-[200px] mx-auto">
      {/* الخلفية الشبكية */}
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
        {/* المضلع الخلفي (الحدود القصوى) */}
        <polygon points="50,10 90,40 75,90 25,90 10,40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <polygon points="50,30 70,45 62,70 38,70 30,45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        
        {/* المحاور */}
        <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(255,255,255,0.1)" />
        <line x1="50" y1="50" x2="90" y2="40" stroke="rgba(255,255,255,0.1)" />
        <line x1="50" y1="50" x2="75" y2="90" stroke="rgba(255,255,255,0.1)" />
        <line x1="50" y1="50" x2="25" y2="90" stroke="rgba(255,255,255,0.1)" />
        <line x1="50" y1="50" x2="10" y2="40" stroke="rgba(255,255,255,0.1)" />

        {/* مضلع البيانات (Data Polygon) */}
        <motion.polygon 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
          points={points} 
          fill="rgba(6, 182, 212, 0.4)" 
          stroke="#06b6d4" 
          strokeWidth="2"
          className="drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
        />
      </svg>
      
      {/* التسميات */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[8px] font-bold text-cyan-400">VOCAB</div>
      <div className="absolute top-[35%] right-0 translate-x-2 text-[8px] font-bold text-purple-400">STREAK</div>
      <div className="absolute bottom-0 right-0 translate-x-1 text-[8px] font-bold text-green-400">XP</div>
      <div className="absolute bottom-0 left-0 -translate-x-1 text-[8px] font-bold text-yellow-400">MASTERY</div>
      <div className="absolute top-[35%] left-0 -translate-x-3 text-[8px] font-bold text-red-400">FOCUS</div>
    </div>
  );
};

// --- المكون الرئيسي ---
export default function CyberDeck({ user, stats, cards }) {
  const xp = stats?.xp || 0;
  
  // حساب الرتبة
  const { currentRank, nextRank, progress } = useMemo(() => {
    const idx = RANKS.findIndex((r, i) => {
        const next = RANKS[i + 1];
        return xp >= r.min && (!next || xp < next.min);
    });
    const rank = RANKS[idx] || RANKS[0];
    const next = RANKS[idx + 1];
    
    let prog = 100;
    if (next) {
        prog = Math.min(100, Math.max(0, ((xp - rank.min) / (next.min - rank.min)) * 100));
    }
    return { currentRank: rank, nextRank: next, progress: prog };
  }, [xp]);

  const masteredWords = cards.filter(c => c.level >= 5).length;
  const analysisData = {
      vocab: Math.min(100, (cards.length / 50) * 100),
      streak: stats.streak || 0,
      xp: xp,
      mastered: masteredWords
  };

  return (
    <div className="w-full pb-20 font-sans">
        
        {/* 1. Header & ID Card Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            
            {/* بطاقة المشغل (Operator ID) - تصميم زجاجي متقدم */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 relative group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f0f]/80 backdrop-blur-xl"
            >
                {/* تأثيرات الخلفية */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/10 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                
                {/* شريط علوي تقني */}
                <div className="h-10 border-b border-white/5 bg-black/20 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                        <span className="text-[10px] font-mono text-green-500/70 tracking-[0.2em]">OPERATIVE_ONLINE</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/30">ID: {user?.uid?.slice(0,8).toUpperCase()}</div>
                </div>

                <div className="p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    {/* الصورة */}
                    <div className="relative">
                        <div className={`w-32 h-32 rounded-2xl border-2 ${currentRank.border} p-1 relative z-10 bg-black`}>
                            <img src={user?.photoURL || '/avatars/avatar1.png'} className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        {/* تأثيرات حول الصورة */}
                        <div className={`absolute -inset-2 ${currentRank.color} opacity-20 blur-xl rounded-full`}></div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-3 py-1 rounded text-[10px] font-bold text-white uppercase tracking-widest whitespace-nowrap z-20">
                            LVL {Math.floor(xp / 500) + 1}
                        </div>
                    </div>

                    {/* المعلومات */}
                    <div className="flex-1 w-full text-center md:text-left">
                        <h3 className={`text-xs font-bold tracking-[0.4em] uppercase mb-1 ${currentRank.color}`}>
                            {currentRank.name} CLASS
                        </h3>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">
                            {user?.displayName || "UNKNOWN AGENT"}
                        </h1>
                        
                        {/* شريط الخبرة */}
                        <div className="mt-6">
                            <div className="flex justify-between text-xs font-mono text-white/40 mb-2">
                                <span>PROGRESS</span>
                                <span className={currentRank.color}>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className={`h-full ${currentRank.color.replace('text-', 'bg-')} shadow-[0_0_15px_currentColor]`}
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-mono text-white/20">
                                <span>{xp} XP</span>
                                <span>TARGET: {nextRank ? nextRank.min : 'MAX'} XP</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* بطاقة تحليل المهارات (Radar Chart) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center relative overflow-hidden"
            >
                <div className="absolute top-4 left-4 flex gap-2 items-center text-cyan-500/50">
                    <IconBrain size={16}/> <span className="text-[10px] font-black tracking-widest uppercase">Neural Scan</span>
                </div>
                <SkillRadar stats={analysisData} />
            </motion.div>
        </div>

        {/* 2. Stats Grid (Holographic Boxes) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatTile icon={<IconBolt />} value={stats.streak} label="Day Streak" color="text-yellow-400" border="border-yellow-500/30" />
            <StatTile icon={<IconDna />} value={cards.length} label="Memory Core" color="text-blue-400" border="border-blue-500/30" />
            <StatTile icon={<IconCrown />} value={masteredWords} label="Mastered" color="text-purple-400" border="border-purple-500/30" />
            <StatTile icon={<IconTrophy />} value={`#${Math.floor(Math.random()*100)+1}`} label="Global Rank" color="text-red-400" border="border-red-500/30" />
        </div>

        {/* 3. Badges Grid */}
        <div className="relative">
            <div className="flex items-center gap-3 mb-6">
                <IconMedal className="text-white" size={24} />
                <h2 className="text-2xl font-black text-white tracking-tighter">SERVICE BADGES</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {RANKS.map((r, i) => {
                    const isUnlocked = xp >= r.min;
                    if (i === 0) return null; // تخطي أول رتبة
                    
                    return (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            viewport={{ once: true }}
                            className={`relative p-1 rounded-2xl overflow-hidden group ${isUnlocked ? 'cursor-pointer' : 'opacity-50 grayscale'}`}
                        >
                            {/* حدود مضيئة عند التحويم */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${isUnlocked ? 'from-white/10 to-transparent group-hover:from-[var(--accent-color)]/20' : 'from-transparent to-transparent'} transition-all duration-500`}></div>
                            
                            <div className="relative bg-[#111] border border-white/5 rounded-xl p-5 flex items-center gap-5 h-full hover:border-white/20 transition-colors">
                                {/* أيقونة الشارة */}
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0 relative overflow-hidden ${isUnlocked ? `${r.border} bg-white/5` : 'border-white/10 bg-black'}`}>
                                    <div className={`relative z-10 ${isUnlocked ? r.color : 'text-gray-600'}`}>
                                        {isUnlocked ? r.icon : <IconLock size={20} />}
                                    </div>
                                    {isUnlocked && <div className={`absolute inset-0 ${r.color.replace('text-', 'bg-')} opacity-10 animate-pulse`}></div>}
                                </div>

                                <div>
                                    <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{r.name}</h4>
                                    <p className="text-[10px] text-white/40 font-mono leading-relaxed">
                                        {isUnlocked ? "UNLOCKED: FULL ACCESS" : `REQUIRES ${r.min} XP`}
                                    </p>
                                </div>

                                {/* علامة الصح */}
                                {isUnlocked && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </div>
  );
}

// --- مكون إحصائيات صغير ---
const StatTile = ({ icon, value, label, color, border }) => (
    <div className={`bg-[#111]/50 border ${border} p-5 rounded-2xl relative overflow-hidden group hover:bg-[#111] transition-colors`}>
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity scale-150 ${color}`}>
            {React.cloneElement(icon, { size: 40 })}
        </div>
        <div className={`${color} mb-2`}>{icon}</div>
        <div className="text-2xl font-black text-white font-mono">{value}</div>
        <div className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1">{label}</div>
    </div>
);