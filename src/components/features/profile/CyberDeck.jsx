"use client";
import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  IconUser, IconTrophy, IconFlame, IconTarget, 
  IconActivity, IconLock, IconMedal, IconCrown, 
  IconDna, IconChartRadar, IconSchool, IconShieldCheck, 
  IconBook, IconMessage, IconId
} from "@tabler/icons-react";
import { useLanguage } from "@/hooks/useLanguage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- تكوين الرتب ---
const RANKS_CONFIG = [
    { id: "recruit", min: 0, color: "text-zinc-400", bg: "bg-zinc-500", icon: <IconUser /> },
    { id: "soldier", min: 100, color: "text-emerald-400", bg: "bg-emerald-500", icon: <IconTarget /> },
    { id: "hacker", min: 500, color: "text-cyan-400", bg: "bg-cyan-500", icon: <IconActivity /> },
    { id: "elite", min: 1500, color: "text-violet-400", bg: "bg-violet-500", icon: <IconMedal /> },
    { id: "commander", min: 3000, color: "text-orange-400", bg: "bg-orange-500", icon: <IconTrophy /> },
    { id: "legend", min: 5000, color: "text-yellow-400", bg: "bg-yellow-500", icon: <IconCrown /> },
    { id: "cybergod", min: 10000, color: "text-red-500", bg: "bg-red-500", icon: <IconFlame /> },
];

const SkillRadar = ({ stats, color }) => {
  const values = [
    Math.min(100, (stats.totalCards / 200) * 100),
    Math.min(100, (stats.streak / 30) * 100),
    Math.min(100, (stats.xp / 5000) * 100),
    Math.min(100, stats.masteryRate),
    Math.min(100, stats.activityScore)
  ];

  const points = values.map((val, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const r = (val / 100) * 45; 
    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
  }).join(" ");

  return (
    <div className="relative w-full aspect-square max-w-[200px] mx-auto my-6">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
        {[20, 40, 60, 80, 100].map((r, i) => (
            <polygon key={i} points={[0,1,2,3,4].map(j => {
                const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
                const rad = (r / 100) * 45;
                return `${50 + rad * Math.cos(angle)},${50 + rad * Math.sin(angle)}`;
            }).join(" ")} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        ))}
        <motion.polygon 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1.5, ease: "circOut" }}
          points={points} 
          fill={`${color}33`} 
          stroke={color} 
          strokeWidth="2" 
        />
      </svg>
      <div className="absolute inset-0 pointer-events-none text-[7px] font-black text-white/30 font-mono uppercase tracking-tighter">
          <span className="absolute top-[-10px] left-1/2 -translate-x-1/2">DATA</span>
          <span className="absolute top-[30%] right-[-15px]">STRK</span>
          <span className="absolute bottom-[-5px] right-[5px]">EXP</span>
          <span className="absolute bottom-[-5px] left-[5px]">MSTR</span>
          <span className="absolute top-[30%] left-[-20px]">ACTV</span>
      </div>
    </div>
  );
};

export default function CyberDeck({ user, stats, cards = [] }) {
  const { t, dir } = useLanguage();
  const [commanderName, setCommanderName] = useState(null);

  // جلب اسم المعلم (القائد) إذا كان المستخدم طالباً
  useEffect(() => {
      if (user?.role === 'student' && user?.teacherId) {
          const fetchCommander = async () => {
              try {
                  const docSnap = await getDoc(doc(db, "users", user.teacherId));
                  if (docSnap.exists()) {
                      setCommanderName(docSnap.data().displayName);
                  }
              } catch (err) {
                  console.error("Failed to load commander data", err);
              }
          };
          fetchCommander();
      }
  }, [user]);

  const analytics = useMemo(() => {
    const xp = stats?.xp || 0;
    const streak = stats?.streak || 0;
    const totalCards = cards.length;
    const masteredCards = cards.filter(c => c.level >= 5).length;
    const learningCards = cards.filter(c => c.level > 0 && c.level < 5).length;
    const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
    
    // حساب الرتبة
    const rankIndex = RANKS_CONFIG.findIndex((r, i) => {
        const next = RANKS_CONFIG[i + 1];
        return xp >= r.min && (!next || xp < next.min);
    });
    const xpRank = RANKS_CONFIG[rankIndex] || RANKS_CONFIG[0];
    const nextRank = RANKS_CONFIG[rankIndex + 1];
    
    let rankProgress = 100;
    if (nextRank) {
        rankProgress = Math.min(100, ((xp - xpRank.min) / (nextRank.min - xpRank.min)) * 100);
    }

    const activityScore = Math.min(100, (learningCards * 10 + streak * 5));

    // تحديد العرض النهائي بناءً على الدور
    let displayRank = xpRank;
    let customTitle = null;

    if (user?.role === 'master') {
        displayRank = { color: "text-red-500", bg: "bg-red-500", icon: <IconCrown /> };
        customTitle = t('rank_cybergod');
    } else if (user?.role === 'admin') {
        displayRank = { color: "text-purple-500", bg: "bg-purple-500", icon: <IconShieldCheck /> };
        customTitle = t('rank_commander');
    } else if (user?.role === 'teacher') {
        displayRank = { color: "text-emerald-400", bg: "bg-emerald-500", icon: <IconSchool /> };
        customTitle = "INSTRUCTOR";
    }

    return {
        xp, streak, totalCards, masteredCards,
        masteryRate, displayRank, nextRank, rankProgress, activityScore, customTitle,
        xpRankId: xpRank.id
    };
  }, [stats, cards, user, t]);

  const themeColor = analytics.displayRank.color.includes('text-') 
    ? (analytics.displayRank.color === 'text-red-500' ? '#ef4444' : 
       analytics.displayRank.color === 'text-purple-500' ? '#a855f7' : 
       analytics.displayRank.color === 'text-emerald-400' ? '#34d399' : '#06b6d4')
    : '#06b6d4';

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20" dir={dir}>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. بطاقة الهوية */}
            <div className="lg:col-span-8 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start">
                    <div className="relative">
                        <div className="w-40 h-40 rounded-3xl p-1 bg-gradient-to-br from-white/20 to-transparent shadow-2xl">
                            <div className="w-full h-full rounded-[1.4rem] overflow-hidden bg-black border border-white/10">
                                <img src={user?.photoURL || '/avatars/avatar1.png'} className="w-full h-full object-cover grayscale-[0.5] hover:grayscale-0 transition-all duration-500" alt="Avatar"/>
                            </div>
                        </div>
                        <div className="absolute -bottom-4 inset-x-0 flex justify-center">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-black border border-white/10 shadow-xl ${analytics.displayRank.color}`}>
                                LVL.{Math.floor(analytics.xp / 500) + 1}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 w-full text-center md:text-left">
                        <div className={`flex items-center gap-2 mb-3 justify-center md:justify-start`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${analytics.displayRank.bg}`}></div>
                            <span className={`text-xs font-black tracking-[0.3em] uppercase ${analytics.displayRank.color}`}>
                                {analytics.customTitle || t(`rank_${analytics.xpRankId}`) || "AGENT"} {t('profile_class')}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 truncate uppercase">
                            {user?.displayName || "OPERATIVE"}
                        </h1>

                        {/* --- معلومات الأستاذ --- */}
                        {isTeacher && (
                            <div className="flex flex-col gap-2 mb-4 items-center md:items-start">
                                {user?.subject && (
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <IconBook size={16}/>
                                        <span className="text-sm font-bold uppercase tracking-wide">{user.subject}</span>
                                    </div>
                                )}
                                {user?.contactInfo && (
                                    <div className="flex items-center gap-2 text-white/50">
                                        <IconMessage size={16}/>
                                        <span className="text-xs font-mono">{user.contactInfo}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- معلومات الطالب (القائد) --- */}
                        {isStudent && commanderName && (
                            <div className="mb-4 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <IconId size={16} className="text-purple-400" />
                                <div className="flex flex-col text-left">
                                    <span className="text-[8px] text-purple-400/60 font-black uppercase tracking-widest leading-none mb-0.5">SQUAD COMMANDER</span>
                                    <span className="text-xs text-purple-100 font-bold uppercase">{commanderName}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest">
                                <span>{t('profile_exp')}: {analytics.xp}</span>
                                <span>{t('profile_next')}: {analytics.nextRank ? analytics.nextRank.min : "MAX"}</span>
                            </div>
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${analytics.rankProgress}%` }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className={`h-full rounded-full ${analytics.displayRank.bg} shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/5">
                    <StatBox label={t('profile_stats_cards')} value={analytics.totalCards} color="text-white" icon={<IconDna size={18}/>} />
                    <StatBox label={t('profile_stats_mastered')} value={analytics.masteredCards} color="text-yellow-400" icon={<IconCrown size={18}/>} />
                    <StatBox label={t('profile_stats_streak')} value={analytics.streak} color="text-orange-500" icon={<IconFlame size={18}/>} />
                </div>
            </div>

            {/* 2. رادار الأداء */}
            <div className="lg:col-span-4 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden min-h-[400px]">
                <div className="absolute top-8 left-8 flex items-center gap-2 opacity-30">
                    <IconChartRadar size={20} className={analytics.displayRank.color}/>
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase">{t('profile_metrics')}</span>
                </div>
                
                <SkillRadar stats={analytics} color={themeColor} />
                
                <div className="mt-6 text-center">
                    <div className="text-5xl font-black text-white tracking-tighter">{analytics.masteryRate}%</div>
                    <div className="text-[10px] text-white/20 uppercase tracking-[0.4em] mt-2 font-black">{t('profile_efficiency')}</div>
                </div>
            </div>
        </div>

        {/* 3. شبكة الأوسمة */}
        <div className="space-y-8">
            <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <IconMedal size={24} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t('profile_badges')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {RANKS_CONFIG.map((r, i) => {
                    if (i === 0) return null;
                    const isUnlocked = analytics.xp >= r.min;
                    
                    return (
                        <motion.div 
                            key={i} 
                            whileHover={isUnlocked ? { y: -5 } : {}}
                            className={`p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden ${
                                isUnlocked 
                                ? 'bg-[#111] border-white/10 shadow-xl' 
                                : 'bg-black/40 border-white/5 opacity-40 grayscale'
                            }`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                    isUnlocked ? r.bg + '/20 ' + r.color : 'bg-white/5 text-white/10'
                                }`}>
                                    {isUnlocked ? React.cloneElement(r.icon, { size: 32 }) : <IconLock size={24}/>}
                                </div>
                                <div>
                                    <h4 className={`text-lg font-black tracking-tight uppercase ${isUnlocked ? 'text-white' : 'text-white/20'}`}>
                                        {t(`rank_${r.id}`)}
                                    </h4>
                                    <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">
                                        {isUnlocked ? t('profile_unlocked') : `${t('profile_requires')} ${r.min} XP`}
                                    </p>
                                </div>
                            </div>
                            {isUnlocked && <div className={`absolute bottom-0 left-0 h-1 w-full ${r.bg} opacity-30`}></div>}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </div>
  );
}

function StatBox({ label, value, color, icon }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[9px] text-white/20 font-black uppercase tracking-widest">
                {icon} {label}
            </div>
            <div className={`text-3xl font-black ${color} font-mono tracking-tighter`}>{value}</div>
        </div>
    );
}