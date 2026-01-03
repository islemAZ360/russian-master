"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  IconUser, IconTrophy, IconFlame, IconTarget, 
  IconActivity, IconLock, IconMedal, IconCrown, 
  IconDna, IconChartRadar
} from "@tabler/icons-react";
import { useLanguage } from "@/hooks/useLanguage";

// --- تكوين الرتب (Global Ranks Config) ---
const RANKS = [
    { name: "RECRUIT", min: 0, color: "text-zinc-400", bg: "bg-zinc-500", icon: <IconUser /> },
    { name: "SOLDIER", min: 100, color: "text-emerald-400", bg: "bg-emerald-500", icon: <IconTarget /> },
    { name: "HACKER", min: 500, color: "text-cyan-400", bg: "bg-cyan-500", icon: <IconActivity /> },
    { name: "ELITE", min: 1500, color: "text-violet-400", bg: "bg-violet-500", icon: <IconMedal /> },
    { name: "COMMANDER", min: 3000, color: "text-orange-400", bg: "bg-orange-500", icon: <IconTrophy /> },
    { name: "LEGEND", min: 5000, color: "text-yellow-400", bg: "bg-yellow-500", icon: <IconCrown /> },
    { name: "CYBER GOD", min: 10000, color: "text-red-500", bg: "bg-red-500", icon: <IconFlame /> },
];

// --- مكون مخطط الرادار (Skill Radar) ---
const SkillRadar = ({ stats }) => {
  // تحويل القيم إلى مقياس 0-100 للرسم البياني
  const values = [
    Math.min(100, (stats.totalCards / 100) * 100), // سعة الذاكرة (هدف أولي 100 كلمة)
    Math.min(100, (stats.streak / 30) * 100),      // الاستمرارية (هدف شهري)
    Math.min(100, (stats.xp / 5000) * 100),        // الخبرة (نسبة من رتبة Legend)
    Math.min(100, stats.masteryRate),              // معدل الإتقان الفعلي
    Math.min(100, stats.activityScore)             // نشاط التعلم
  ];

  const points = values.map((val, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const r = (val / 100) * 45; 
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="relative w-full aspect-square max-w-[180px] mx-auto my-4">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
        {/* شبكة الخلفية */}
        {[20, 40, 60, 80, 100].map((r, i) => (
            <polygon key={i} points={[0,1,2,3,4].map(j => {
                const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
                const rad = (r / 100) * 45;
                return `${50 + rad * Math.cos(angle)},${50 + rad * Math.sin(angle)}`;
            }).join(" ")} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}
        
        {/* المحاور */}
        {[0,1,2,3,4].map(i => {
             const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
             return <line key={i} x1="50" y1="50" x2={50 + 45 * Math.cos(angle)} y2={50 + 45 * Math.sin(angle)} stroke="rgba(255,255,255,0.1)" />;
        })}

        {/* مضلع البيانات */}
        <motion.polygon 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1 }}
          points={points} 
          fill="rgba(6, 182, 212, 0.2)" 
          stroke="#06b6d4" 
          strokeWidth="2" 
        />
        
        {/* نقاط التقاطع */}
        {values.map((val, i) => {
             const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
             const r = (val / 100) * 45;
             return <circle key={i} cx={50 + r * Math.cos(angle)} cy={50 + r * Math.sin(angle)} r="2" fill="#fff" />;
        })}
      </svg>
      
      {/* التسميات التوضيحية */}
      <div className="absolute inset-0 pointer-events-none text-[8px] font-bold text-white/50 font-mono">
          <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-black/50 px-1">MEMORY</span>
          <span className="absolute top-[35%] right-0 translate-x-2">STREAK</span>
          <span className="absolute bottom-0 right-0 translate-x-1">XP</span>
          <span className="absolute bottom-0 left-0 -translate-x-1">MASTERY</span>
          <span className="absolute top-[35%] left-0 -translate-x-4">ACTIVITY</span>
      </div>
    </div>
  );
};

// --- المكون الرئيسي ---
export default function CyberDeck({ user, stats, cards = [] }) {
  const { t, dir } = useLanguage();

  // 1. معالجة البيانات الحقيقية (Memoized Calculations)
  const analytics = useMemo(() => {
    const xp = stats?.xp || 0;
    const streak = stats?.streak || 0;
    const totalCards = cards.length;
    
    // حساب البطاقات المتقنة (مستوى 5) والجديدة
    const masteredCards = cards.filter(c => c.level >= 5).length;
    const learningCards = cards.filter(c => c.level > 0 && c.level < 5).length;
    
    // نسبة الإتقان
    const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
    
    // تحديد الرتبة الحالية والقادمة
    const rankIndex = RANKS.findIndex((r, i) => {
        const next = RANKS[i + 1];
        return xp >= r.min && (!next || xp < next.min);
    });
    const currentRank = RANKS[rankIndex] || RANKS[0];
    const nextRank = RANKS[rankIndex + 1];
    
    // نسبة التقدم للرتبة التالية
    let rankProgress = 100;
    if (nextRank) {
        const totalNeeded = nextRank.min - currentRank.min;
        const currentEarned = xp - currentRank.min;
        rankProgress = Math.min(100, Math.max(0, (currentEarned / totalNeeded) * 100));
    }

    // درجة النشاط (معادلة بسيطة)
    const activityScore = Math.min(100, learningCards * 5 + masteredCards * 2 + streak * 2);

    return {
        xp, streak, totalCards, masteredCards, learningCards,
        masteryRate, currentRank, nextRank, rankProgress, activityScore
    };
  }, [user, stats, cards]);

  return (
    <div className="w-full pb-20 font-sans p-4 md:p-0" dir={dir}>
        
        {/* --- GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Identity Card (بطاقة الهوية) */}
            <div className="lg:col-span-8 bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden relative group">
                {/* خلفية متحركة خفيفة */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="p-8 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* إطار الصورة */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-2xl p-[2px] bg-gradient-to-br from-white/20 to-transparent">
                                <div className="w-full h-full rounded-xl overflow-hidden bg-black">
                                    <img src={user?.photoURL || '/avatars/avatar1.png'} className="w-full h-full object-cover" alt="Avatar"/>
                                </div>
                            </div>
                            {/* شارة المستوى */}
                            <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                                <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-[#111] border border-white/10 ${analytics.currentRank.color}`}>
                                    {t('profile_lvl')}.{Math.floor(analytics.xp / 500) + 1}
                                </span>
                            </div>
                        </div>

                        {/* معلومات المستخدم */}
                        <div className={`flex-1 text-center ${dir === 'rtl' ? 'md:text-right' : 'md:text-left'} w-full`}>
                            <div className={`flex items-center justify-center ${dir === 'rtl' ? 'md:justify-start' : 'md:justify-start'} gap-2 mb-2`}>
                                <span className={`w-2 h-2 rounded-full ${analytics.currentRank.bg}`}></span>
                                <span className={`text-xs font-bold tracking-[0.2em] uppercase ${analytics.currentRank.color}`}>
                                    {analytics.currentRank.name} {t('profile_class')}
                                </span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter mb-4 truncate">
                                {user?.displayName || "OPERATIVE"}
                            </h1>

                            {/* شريط الخبرة */}
                            <div className="relative pt-2">
                                <div className="flex justify-between text-[10px] font-mono text-white/40 mb-1">
                                    <span>{t('profile_exp')}: {analytics.xp}</span>
                                    <span>{t('profile_next')}: {analytics.nextRank ? analytics.nextRank.min : "MAX"}</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analytics.rankProgress}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className={`h-full ${analytics.currentRank.bg}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* صف الإحصائيات السريعة */}
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                        <StatItem label={t('profile_stats_cards')} value={analytics.totalCards} color="text-white" icon={<IconDna size={16}/>} />
                        <StatItem label={t('profile_stats_mastered')} value={analytics.masteredCards} color="text-yellow-400" icon={<IconCrown size={16}/>} />
                        <StatItem label={t('profile_stats_streak')} value={analytics.streak} color="text-orange-400" icon={<IconFlame size={16}/>} />
                    </div>
                </div>
            </div>

            {/* 2. Neural Scan (تحليل الأداء) */}
            <div className="lg:col-span-4 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center relative min-h-[300px]">
                <div className={`flex items-center gap-2 absolute top-6 text-cyan-500/50 ${dir === 'rtl' ? 'right-6' : 'left-6'}`}>
                    <IconChartRadar size={18}/>
                    <span className="text-[10px] font-black tracking-widest uppercase">{t('profile_metrics')}</span>
                </div>
                
                <SkillRadar stats={analytics} />
                
                <div className="mt-4 text-center">
                    <div className="text-3xl font-black text-white">{analytics.masteryRate}%</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest">{t('profile_efficiency')}</div>
                </div>
            </div>
        </div>

        {/* 3. Badges Grid (شبكة الأوسمة) */}
        <div className="mt-8">
            <div className={`flex items-center gap-3 mb-6 px-2 ${dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <IconMedal className="text-white/20" size={24} />
                <h3 className="text-xl font-black text-white tracking-wide">{t('profile_badges')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {RANKS.map((r, i) => {
                    if (i === 0) return null; // تخطي رتبة المبتدئ
                    const isUnlocked = analytics.xp >= r.min;
                    
                    return (
                        <div key={i} className={`p-4 rounded-2xl border transition-all ${
                            isUnlocked 
                            ? 'bg-[#111] border-white/10 hover:border-white/20' 
                            : 'bg-black border-white/5 opacity-40'
                        }`}>
                            <div className="flex items-center gap-4">
                                {/* أيقونة الرتبة */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUnlocked ? r.bg + '/20 ' + r.color : 'bg-white/5 text-white/20'}`}>
                                    {isUnlocked ? r.icon : <IconLock size={18}/>}
                                </div>
                                {/* تفاصيل الرتبة */}
                                <div>
                                    <h4 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-white/30'}`}>{r.name}</h4>
                                    <p className="text-[10px] font-mono text-white/30">
                                        {isUnlocked ? t('profile_unlocked') : `${t('profile_requires')} ${r.min} XP`}
                                    </p>
                                </div>
                            </div>
                            
                            {/* شريط صغير أسفل البطاقة للمفتوحين */}
                            {isUnlocked && (
                                <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full ${r.bg} w-full`}></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

    </div>
  );
}

// --- مكون مساعد للإحصائيات الصغيرة ---
const StatItem = ({ label, value, color, icon }) => (
    <div className="text-center">
        <div className="flex items-center justify-center gap-1 text-[10px] text-white/30 font-bold uppercase mb-1">
            {icon} {label}
        </div>
        <div className={`text-xl md:text-2xl font-black ${color} font-mono`}>{value}</div>
    </div>
);