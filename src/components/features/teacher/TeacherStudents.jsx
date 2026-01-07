"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { 
  IconChartBar, IconActivity, IconClock, IconFlame, 
  IconTrendingUp, IconUsers, IconBrain, IconTarget,
  IconTrophy, IconAlertOctagon
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

// --- مكونات الرسوم البيانية (SVG Charts) ---

// 1. شريط التقدم الدائري المعقد
const ProgressRing = ({ radius, stroke, progress, color, icon: Icon, label }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          <circle
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white">
            <Icon size={24} className={progress > 0 ? "opacity-100" : "opacity-30"} style={{ color }} />
        </div>
      </div>
      <div className="mt-2 text-center">
          <div className="text-2xl font-black text-white font-mono">{progress}%</div>
          <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold">{label}</div>
      </div>
    </div>
  );
};

// 2. رسم بياني خطي بسيط (SVG Sparkline)
const SparkLine = ({ data, color, height = 60 }) => {
    if (!data || data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100;
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className="w-full relative overflow-hidden" style={{ height: `${height}px` }}>
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                />
                <polygon
                    fill={color}
                    fillOpacity="0.1"
                    points={`0,100 ${points} 100,100`}
                />
            </svg>
        </div>
    );
};

export default function TeacherProgress() {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // جلب البيانات
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users"), where("teacherId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(d => d.data()));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // تحليل البيانات المتقدم
  const insights = useMemo(() => {
    if (!students.length) return null;

    const totalXP = students.reduce((acc, s) => acc + (s.xp || 0), 0);
    const avgXP = Math.floor(totalXP / students.length);
    
    // النشاط (آخر 24 ساعة)
    const now = new Date();
    const activeToday = students.filter(s => s.lastLogin && (now - s.lastLogin.toDate()) < 86400000).length;
    const activeRate = Math.round((activeToday / students.length) * 100);

    // مستويات الإتقان (افتراضي)
    const masteryLevels = {
        beginner: students.filter(s => (s.xp || 0) < 1000).length,
        intermediate: students.filter(s => (s.xp || 0) >= 1000 && (s.xp || 0) < 5000).length,
        advanced: students.filter(s => (s.xp || 0) >= 5000).length,
    };

    // بيانات وهمية للرسم البياني (محاكاة نشاط أسبوعي)
    const activityTrend = [45, 52, 48, 60, 55, 70, activeRate]; 

    return {
        totalXP,
        avgXP,
        activeRate,
        masteryLevels,
        activityTrend,
        topStreaks: students.filter(s => s.streak > 0).length
    };
  }, [students]);

  if (loading) return (
      <div className="h-full flex flex-col items-center justify-center text-cyan-500/50 gap-4">
          <IconActivity className="animate-spin" size={40}/>
          <span className="text-xs font-mono uppercase tracking-[0.3em]">Processing Neural Data...</span>
      </div>
  );

  if (!insights) return (
      <div className="h-full flex flex-col items-center justify-center opacity-40">
          <IconChartBar size={64} className="mb-4"/>
          <p className="text-sm font-black uppercase">No Class Data Available</p>
      </div>
  );

  return (
    <div className="w-full h-full p-6 md:p-10 pb-40 overflow-y-auto custom-scrollbar font-sans" dir={dir}>
        
        {/* Header */}
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-2 text-cyan-500">
                <IconBrain size={28}/>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Deep Analysis Protocol</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                Class Insights
            </h1>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Activity Monitor (Large) */}
            <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Engagement Pulse</h3>
                        <p className="text-[10px] text-white/40 font-mono mt-1">Weekly activity trend analysis</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <IconTrendingUp size={14} className="text-emerald-500"/>
                        <span className="text-[10px] font-bold text-emerald-400">LIVE</span>
                    </div>
                </div>
                
                {/* The Sparkline */}
                <div className="h-40 w-full relative z-10">
                    <SparkLine data={insights.activityTrend} color="#06b6d4" height={160} />
                </div>

                {/* Data Points */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5 relative z-10">
                    <div>
                        <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Active Rate</div>
                        <div className="text-3xl font-black text-white">{insights.activeRate}%</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">Total XP</div>
                        <div className="text-3xl font-black text-cyan-400">{(insights.totalXP / 1000).toFixed(1)}k</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-white/30 uppercase font-black tracking-widest mb-1">On Streak</div>
                        <div className="text-3xl font-black text-orange-500">{insights.topStreaks}</div>
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 to-transparent pointer-events-none"></div>
            </div>

            {/* 2. Proficiency Gauge (Side) */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5"><IconTarget size={100}/></div>
                
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 text-center w-full">Mastery Distribution</h3>
                
                <div className="flex justify-center items-center gap-4">
                    <ProgressRing 
                        radius={60} stroke={8} 
                        progress={Math.round((insights.masteryLevels.advanced / students.length) * 100) || 0} 
                        color="#a855f7" 
                        icon={IconTrophy} 
                        label="Elite"
                    />
                </div>

                <div className="w-full mt-10 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-white/60">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Advanced</span>
                        <span>{insights.masteryLevels.advanced}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-white/60">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Intermediate</span>
                        <span>{insights.masteryLevels.intermediate}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-white/60">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-600"></span> Beginner</span>
                        <span>{insights.masteryLevels.beginner}</span>
                    </div>
                </div>
            </div>

            {/* 3. Risk Assessment */}
            <div className="lg:col-span-3 bg-red-900/10 border border-red-500/20 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20">
                        <IconAlertOctagon size={32}/>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white uppercase">Retention Alert</h4>
                        <p className="text-xs text-red-400 font-mono mt-1">
                            {students.length - insights.activeRate > 0 
                                ? `${Math.round(100 - insights.activeRate)}% of squad is dormant.` 
                                : "Squad is fully active."}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-[#0a0a0a] rounded-xl border border-white/5 text-center min-w-[100px]">
                        <div className="text-xs text-white/30 font-black uppercase mb-1">Dormant</div>
                        <div className="text-2xl font-black text-white">{students.length - (insights.masteryLevels.advanced + insights.masteryLevels.intermediate + insights.masteryLevels.beginner) > 0 ? "..." : (students.length - Math.round(students.length * (insights.activeRate/100)))}</div>
                    </div>
                    <div className="px-6 py-3 bg-[#0a0a0a] rounded-xl border border-white/5 text-center min-w-[100px]">
                        <div className="text-xs text-white/30 font-black uppercase mb-1">Avg Lvl</div>
                        <div className="text-2xl font-black text-cyan-400">{Math.floor(insights.avgXP / 500) + 1}</div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}