"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { 
  IconChartBar, IconTrophy, IconActivity, IconClock, 
  IconFlame, IconAlertTriangle, IconUser 
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

export default function TeacherProgress() {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب بيانات الطلاب التابعين للأستاذ
  useEffect(() => {
    if (!user) return;

    // جلب الطلاب وترتيبهم حسب آخر ظهور (الأحدث أولاً)
    const q = query(
      collection(db, "users"),
      where("teacherId", "==", user.uid),
      orderBy("lastLogin", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(data);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // 2. حساب الإحصائيات العامة للفصل
  const classStats = useMemo(() => {
    const total = students.length;
    if (total === 0) return { avgXp: 0, activeToday: 0, topStudent: null };

    const totalXp = students.reduce((acc, s) => acc + (s.xp || 0), 0);
    
    // حساب عدد الطلاب النشطين اليوم (خلال آخر 24 ساعة)
    const now = new Date();
    const activeToday = students.filter(s => {
        if (!s.lastLogin) return false;
        const last = s.lastLogin.toDate();
        return (now - last) < 86400000; // 24 ساعة
    }).length;

    // تحديد الطالب الأفضل (الأكثر XP)
    const topStudent = [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0))[0];

    return {
        avgXp: Math.floor(totalXp / total),
        activeToday,
        topStudent
    };
  }, [students]);

  // دالة مساعدة لتنسيق الوقت (منذ متى)
  const formatLastSeen = (timestamp) => {
      if (!timestamp) return "Never";
      const date = timestamp.toDate();
      const now = new Date();
      const diffMinutes = Math.floor((now - date) / 60000);
      
      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes/60)}h ago`;
      return date.toLocaleDateString();
  };

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 font-sans pb-32" dir={dir}>
        
        {/* Header Section */}
        <div className="mb-10">
            <div className="flex items-center gap-3 text-yellow-500 mb-2">
                <IconChartBar size={32} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Performance_Analytics</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-8">
                {t('nav_progress') || "Class Progress"}
            </h1>

            {/* بطاقات الإحصائيات العلوية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Average Level Card */}
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-cyan-500"><IconActivity size={64}/></div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-2">AVG. CLASS LEVEL</div>
                    <div className="text-4xl font-black text-white font-mono">
                        LVL.{Math.floor(classStats.avgXp / 500) + 1}
                    </div>
                    <div className="text-xs text-cyan-500 mt-1 font-bold">{classStats.avgXp} XP Avg</div>
                </div>

                {/* 2. Active Duty Card */}
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500"><IconClock size={64}/></div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-2">ACTIVE TODAY</div>
                    <div className="text-4xl font-black text-white font-mono">
                        {classStats.activeToday} <span className="text-lg text-white/20">/ {students.length}</span>
                    </div>
                    {/* شريط نسبة الحضور */}
                    <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-1000" 
                            style={{ width: `${(classStats.activeToday / (students.length || 1)) * 100}%` }}
                        />
                    </div>
                </div>

                {/* 3. Top Student Card */}
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-yellow-500"><IconTrophy size={64}/></div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-2">TOP OPERATIVE</div>
                    {classStats.topStudent ? (
                        <>
                            <div className="text-xl font-black text-white truncate uppercase">
                                {classStats.topStudent.displayName}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <IconFlame size={16} className="text-orange-500 fill-orange-500"/>
                                <span className="text-xs text-orange-500 font-bold">{classStats.topStudent.streak} Day Streak</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-white/20 text-sm font-mono">N/A</div>
                    )}
                </div>
            </div>
        </div>

        {/* قائمة الطلاب التفصيلية */}
        <div className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Operative Roster</h3>
                <div className="text-[9px] font-mono text-white/30 uppercase">Live Data Feed</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="text-center py-10 opacity-30 text-xs font-mono animate-pulse">SYNCING DATA...</div>
                ) : students.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center opacity-30">
                        <IconUser size={48} className="mb-4"/>
                        <p className="text-xs font-black uppercase tracking-widest">No operatives in roster</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {students.map((student, i) => {
                            // حساب نسبة التقدم للمستوى التالي
                            const currentLevel = Math.floor((student.xp || 0) / 500) + 1;
                            const nextLevelXp = currentLevel * 500;
                            const currentLevelBaseXp = (currentLevel - 1) * 500;
                            const progressPercent = Math.min(100, ((student.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100);
                            
                            // تنبيه إذا لم يدخل الطالب منذ أسبوع
                            const isInactive = student.lastLogin && (new Date() - student.lastLogin.toDate()) > 604800000;

                            return (
                                <motion.div 
                                    key={student.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group flex flex-col md:flex-row items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all"
                                >
                                    {/* 1. الترتيب والصورة */}
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="text-white/20 font-black font-mono text-lg w-6 text-center">
                                            #{i + 1}
                                        </div>
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden border border-white/10">
                                                <img src={student.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/>
                                            </div>
                                            {isInactive && (
                                                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border-2 border-[#0a0a0a]" title="Inactive > 7 days">
                                                    <IconAlertTriangle size={10} className="text-white"/>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 md:w-40">
                                            <div className="font-bold text-white text-sm truncate uppercase">{student.displayName}</div>
                                            <div className="text-[9px] text-white/30 font-mono flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${student.lastLogin && (new Date() - student.lastLogin.toDate() < 300000) ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                                                {formatLastSeen(student.lastLogin)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. شريط التقدم */}
                                    <div className="flex-1 w-full px-4">
                                        <div className="flex justify-between text-[9px] font-black uppercase mb-1">
                                            <span className="text-cyan-500">LVL.{currentLevel}</span>
                                            <span className="text-white/20">{student.xp || 0} / {nextLevelXp} XP</span>
                                        </div>
                                        <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressPercent}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 relative"
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* 3. الإحصائيات السريعة */}
                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0 mt-2 md:mt-0">
                                        <div className="flex flex-col items-center">
                                            <IconFlame size={16} className="text-orange-500 mb-1"/>
                                            <span className="text-[10px] font-black text-white">{student.streak || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <IconTrophy size={16} className="text-yellow-500 mb-1"/>
                                            <span className="text-[10px] font-black text-white">{Math.floor((student.xp||0)/1000)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}