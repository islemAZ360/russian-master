"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  IconChartBar, IconTrophy, IconActivity, IconClock, 
  IconFlame, IconAlertTriangle, IconUser, IconUsers
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
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

    // FIX: تمت إزالة orderBy لتجنب مشكلة (Missing Index) التي تسبب تعليق التحميل
    // سنقوم بترتيب النتائج برمجياً بعد جلبها
    const q = query(
      collection(db, "users"),
      where("teacherId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // الترتيب برمجياً هنا (الأحدث ظهوراً أولاً)
      data.sort((a, b) => {
          const timeA = a.lastLogin?.seconds || 0;
          const timeB = b.lastLogin?.seconds || 0;
          return timeB - timeA;
      });

      setStudents(data);
      setLoading(false);
    }, (error) => {
        console.error("Firestore Error:", error);
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
        // التأكد من أن التوقيت كائن Firestore Timestamp
        const last = s.lastLogin.toDate ? s.lastLogin.toDate() : new Date(s.lastLogin);
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
      try {
          const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
          const now = new Date();
          const diffMinutes = Math.floor((now - date) / 60000);
          
          if (diffMinutes < 1) return "Just now";
          if (diffMinutes < 60) return `${diffMinutes}m ago`;
          if (diffMinutes < 1440) return `${Math.floor(diffMinutes/60)}h ago`;
          return date.toLocaleDateString();
      } catch (e) {
          return "Unknown";
      }
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
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-cyan-500 group-hover:scale-110 transition-transform"><IconActivity size={64}/></div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-2">AVG. CLASS LEVEL</div>
                    <div className="text-4xl font-black text-white font-mono">
                        LVL.{Math.floor(classStats.avgXp / 500) + 1}
                    </div>
                    <div className="text-xs text-cyan-500 mt-1 font-bold">{classStats.avgXp} XP Avg</div>
                </div>

                {/* 2. Active Duty Card */}
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500 group-hover:scale-110 transition-transform"><IconClock size={64}/></div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-2">ACTIVE TODAY</div>
                    <div className="text-4xl font-black text-white font-mono">
                        {classStats.activeToday} <span className="text-lg text-white/20">/ {students.length}</span>
                    </div>
                    {/* شريط نسبة الحضور */}
                    <div className="w-full bg-white/10 h-1.5 mt-3 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${students.length > 0 ? (classStats.activeToday / students.length) * 100 : 0}%` }}
                            className="h-full bg-emerald-500" 
                        />
                    </div>
                </div>

                {/* 3. Top Student Card */}
                <div className="bg-[#0a0a0a] border border-white/10 p-6 rounded-3xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-yellow-500 group-hover:scale-110 transition-transform"><IconTrophy size={64}/></div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-2">TOP OPERATIVE</div>
                    {classStats.topStudent ? (
                        <>
                            <div className="text-xl font-black text-white truncate uppercase">
                                {classStats.topStudent.displayName}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <IconFlame size={16} className="text-orange-500 fill-orange-500"/>
                                <span className="text-xs text-orange-500 font-bold">{classStats.topStudent.streak || 0} Day Streak</span>
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
                <div className="text-[9px] font-mono text-white/30 uppercase flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    {loading ? "SYNCING..." : "LIVE FEED"}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {loading && students.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"/>
                        <div className="text-center opacity-30 text-xs font-mono animate-pulse tracking-[0.2em]">INITIALIZING DATA STREAM...</div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-white/5 rounded-3xl m-2">
                        <div className="p-4 bg-white/5 rounded-full mb-4">
                            <IconUsers size={32} />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest mb-1">No Operatives Found</p>
                        <p className="text-[10px] font-mono">Invite students to see their progress here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {students.map((student, i) => {
                                // حساب نسبة التقدم للمستوى التالي
                                const currentLevel = Math.floor((student.xp || 0) / 500) + 1;
                                const nextLevelXp = currentLevel * 500;
                                const currentLevelBaseXp = (currentLevel - 1) * 500;
                                const progressPercent = Math.min(100, ((student.xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100);
                                
                                // تنبيه إذا لم يدخل الطالب منذ أسبوع
                                const lastDate = student.lastLogin?.toDate ? student.lastLogin.toDate() : new Date(student.lastLogin);
                                const isInactive = (new Date() - lastDate) > 604800000; // 7 days
                                const isOnline = (new Date() - lastDate) < 300000; // 5 mins

                                return (
                                    <motion.div 
                                        key={student.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group flex flex-col md:flex-row items-center gap-4 p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] rounded-2xl transition-all"
                                    >
                                        {/* 1. الترتيب والصورة */}
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="text-white/20 font-black font-mono text-lg w-8 text-center">
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
                                                <div className="font-bold text-white text-sm truncate uppercase">{student.displayName || "Unknown Agent"}</div>
                                                <div className="text-[9px] text-white/30 font-mono flex items-center gap-1.5 mt-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                                                    {isOnline ? <span className="text-emerald-500">ONLINE</span> : formatLastSeen(student.lastLogin)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. شريط التقدم */}
                                        <div className="flex-1 w-full px-4">
                                            <div className="flex justify-between text-[9px] font-black uppercase mb-1.5">
                                                <span className="text-cyan-500">LVL.{currentLevel}</span>
                                                <span className="text-white/20">{student.xp || 0} XP</span>
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
                                            <div className="flex flex-col items-center min-w-[50px]">
                                                <IconFlame size={16} className="text-orange-500 mb-1"/>
                                                <span className="text-[10px] font-black text-white">{student.streak || 0}</span>
                                            </div>
                                            <div className="flex flex-col items-center min-w-[50px]">
                                                <IconTrophy size={16} className="text-yellow-500 mb-1"/>
                                                <span className="text-[10px] font-black text-white">{Math.floor((student.xp||0)/1000)}k</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}