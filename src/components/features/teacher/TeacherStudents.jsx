"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { 
  IconChartBar, IconTrophy, IconActivity, IconClock, 
  IconFlame, IconUser, IconBook, IconAlertTriangle, IconTrendingUp, IconBrain
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// مكون فرعي لرسم بياني دائري بسيط (SVG)
const CircularProgress = ({ value, color, label, subLabel }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;
    
    return (
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <div className="relative w-16 h-16 shrink-0">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                    <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" 
                        className={color} 
                        strokeDasharray={circumference} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                    {Math.round(value)}%
                </div>
            </div>
            <div>
                <div className="text-white font-bold text-sm uppercase">{label}</div>
                <div className="text-xs text-white/40 font-mono">{subLabel}</div>
            </div>
        </div>
    );
};

export default function TeacherProgress() {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. جلب بيانات الطلاب (الخاصين بالأستاذ فقط)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users"),
      where("teacherId", "==", user.uid),
      orderBy("xp", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(data);
      setLoading(false);
    }, (error) => {
      console.error("Analytics Error:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  // 2. خوارزميات التحليل الذكي (Smart Analytics Engine)
  const analytics = useMemo(() => {
    const totalStudents = students.length;
    if (totalStudents === 0) return null;

    const now = new Date();
    
    // أ. حساب النشاط والغياب
    const activeThreshold = 3 * 24 * 60 * 60 * 1000; // 3 أيام
    const dangerThreshold = 7 * 24 * 60 * 60 * 1000; // 7 أيام
    
    let activeCount = 0;
    let atRiskCount = 0;
    let totalXP = 0;
    let totalStreak = 0;

    const studentsWithStatus = students.map(s => {
        const lastLoginTime = s.lastLogin?.toDate ? s.lastLogin.toDate() : new Date(0);
        const timeDiff = now - lastLoginTime;
        
        let status = 'active'; // active, dormant, critical
        if (timeDiff > dangerThreshold) {
            status = 'critical';
            atRiskCount++;
        } else if (timeDiff > activeThreshold) {
            status = 'dormant';
        } else {
            activeCount++;
        }

        totalXP += (s.xp || 0);
        totalStreak += (s.streak || 0);

        return { ...s, status, lastLoginDate: lastLoginTime };
    });

    // ب. الحسابات المعقدة
    const retentionRate = (activeCount / totalStudents) * 100;
    const avgXP = Math.floor(totalXP / totalStudents);
    const avgWords = Math.floor(avgXP / 10); // فرضية: 10 XP = كلمة
    const engagementScore = Math.min(100, (retentionRate * 0.6) + ((totalStreak / totalStudents) * 2)); // خوارزمية تقدير التفاعل

    return {
        totalStudents,
        activeCount,
        atRiskCount,
        retentionRate,
        avgXP,
        avgWords,
        engagementScore,
        totalXP,
        enhancedStudents: studentsWithStatus
    };
  }, [students]);

  // دالة مساعدة لتنسيق الوقت
  const formatTimeAgo = (date) => {
      const diff = (new Date() - date) / 1000;
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
      return `${Math.floor(diff/86400)}d ago`;
  };

  if (loading) return (
      <div className="h-full flex items-center justify-center">
          <IconActivity className="animate-spin text-cyan-500" size={32}/>
      </div>
  );

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-8 font-sans pb-32" dir={dir}>
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-end animate-in fade-in slide-in-from-top-4">
            <div>
                <div className="flex items-center gap-2 text-cyan-500 mb-1">
                    <IconBrain size={20} className="animate-pulse"/>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Analytics v2.0</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    Squad Performance
                </h1>
            </div>
            <div className="text-right hidden md:block">
                <div className="text-2xl font-black text-white">{analytics?.totalStudents || 0}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Total Operatives</div>
            </div>
        </div>

        {!analytics ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl opacity-50">
                <IconUser size={48} className="mb-4"/>
                <p className="text-xs font-black uppercase tracking-widest">No Data to Analyze</p>
            </div>
        ) : (
            <div className="space-y-6">
                
                {/* 1. KPIs Section (المؤشرات الرئيسية) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Engagement */}
                    <div className="bg-gradient-to-br from-indigo-900/40 to-[#0a0a0a] border border-indigo-500/30 p-5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 text-indigo-400 group-hover:scale-110 transition-transform"><IconActivity size={40}/></div>
                        <div className="text-[9px] text-indigo-300 font-black uppercase tracking-widest mb-1">Engagement</div>
                        <div className="text-3xl font-black text-white">{Math.round(analytics.engagementScore)}<span className="text-sm">%</span></div>
                        <div className="w-full bg-white/10 h-1 mt-3 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{width: `${analytics.engagementScore}%`}}/>
                        </div>
                    </div>

                    {/* Retention */}
                    <div className="bg-gradient-to-br from-emerald-900/40 to-[#0a0a0a] border border-emerald-500/30 p-5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 text-emerald-400 group-hover:scale-110 transition-transform"><IconUsers size={40}/></div>
                        <div className="text-[9px] text-emerald-300 font-black uppercase tracking-widest mb-1">Active Squad</div>
                        <div className="text-3xl font-black text-white">{analytics.activeCount}<span className="text-lg text-white/30">/{analytics.totalStudents}</span></div>
                        <div className="text-[10px] text-emerald-400/60 mt-2 font-mono">Retention Rate: {Math.round(analytics.retentionRate)}%</div>
                    </div>

                    {/* Velocity */}
                    <div className="bg-gradient-to-br from-cyan-900/40 to-[#0a0a0a] border border-cyan-500/30 p-5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 text-cyan-400 group-hover:scale-110 transition-transform"><IconTrendingUp size={40}/></div>
                        <div className="text-[9px] text-cyan-300 font-black uppercase tracking-widest mb-1">Learning Velocity</div>
                        <div className="text-3xl font-black text-white">~{analytics.avgWords}</div>
                        <div className="text-[10px] text-cyan-400/60 mt-2 font-mono">Words / Student</div>
                    </div>

                    {/* Risk Alert */}
                    <div className="bg-gradient-to-br from-red-900/40 to-[#0a0a0a] border border-red-500/30 p-5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-20 text-red-400 group-hover:scale-110 transition-transform"><IconAlertTriangle size={40}/></div>
                        <div className="text-[9px] text-red-300 font-black uppercase tracking-widest mb-1">Critical Status</div>
                        <div className="text-3xl font-black text-white">{analytics.atRiskCount}</div>
                        <div className="text-[10px] text-red-400/60 mt-2 font-mono">Inactive &gt; 7 Days</div>
                    </div>
                </div>

                {/* 2. Detailed Roster (القائمة التفصيلية) */}
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex-1 min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <IconChartBar size={20} className="text-white/50"/> Live Roster Analysis
                        </h3>
                        <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                            <span className="w-2 h-2 rounded-full bg-yellow-500" title="Dormant"></span>
                            <span className="w-2 h-2 rounded-full bg-red-500" title="Critical"></span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {analytics.enhancedStudents.map((student, i) => (
                            <motion.div 
                                key={student.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-1 h-10 rounded-full ${
                                        student.status === 'active' ? 'bg-emerald-500' : 
                                        student.status === 'dormant' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></div>
                                    
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden border border-white/10">
                                        <img src={student.photoURL || "/avatars/avatar1.png"} className="w-full h-full object-cover"/>
                                    </div>
                                    
                                    <div>
                                        <div className="font-bold text-white text-sm uppercase">{student.displayName}</div>
                                        <div className="text-[9px] text-white/30 font-mono flex items-center gap-2">
                                            <span>LVL.{Math.floor((student.xp || 0) / 500) + 1}</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                            <span>Last seen: {formatTimeAgo(student.lastLoginDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center hidden sm:block">
                                        <div className="text-[8px] text-white/20 uppercase font-black">Words</div>
                                        <div className="text-white font-bold">{Math.floor((student.xp || 0) / 10)}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[8px] text-white/20 uppercase font-black">XP</div>
                                        <div className="text-cyan-400 font-bold">{student.xp || 0}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}