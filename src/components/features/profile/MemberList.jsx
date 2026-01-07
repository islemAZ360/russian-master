"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit, where } from 'firebase/firestore';
import { 
  IconShieldCheck, IconCrown, IconUser, IconMedal, 
  IconUsers, IconActivity, IconTrophy, IconSchool 
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { useAuth } from '@/hooks/useAuth';

export default function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('global'); // 'global' or 'squad'
  
  const { t, dir, isRTL } = useLanguage();
  const { user, userData, isStudent, isTeacher, isUser } = useAuth();

  // تغيير وضع الفلترة تلقائياً بناءً على الرتبة
  useEffect(() => {
      if (isStudent || isTeacher) {
          setFilterMode('squad');
      }
  }, [isStudent, isTeacher]);

  // جلب البيانات بناءً على الفلتر
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let q;

    // 1. وضع الفصل (Squad Mode)
    if (filterMode === 'squad') {
        let teacherIdToQuery = null;

        if (isTeacher) {
            teacherIdToQuery = user.uid; // الأستاذ يرى طلابه
        } else if (isStudent && userData?.teacherId) {
            teacherIdToQuery = userData.teacherId; // الطالب يرى زملاءه (نفس الأستاذ)
        }

        if (teacherIdToQuery) {
            q = query(
                collection(db, "users"),
                where("teacherId", "==", teacherIdToQuery),
                orderBy("xp", "desc"),
                limit(50)
            );
        } else {
            // حالة نادرة: طالب بدون أستاذ أو مستخدم عادي ضغط على الزر
            setMembers([]);
            setLoading(false);
            return;
        }
    } 
    // 2. الوضع العالمي (Global Mode)
    else {
        q = query(
            collection(db, "users"), 
            orderBy("xp", "desc"),
            limit(50)
        );
    }

    const unsubscribe = onSnapshot(q, (snap) => {
        const usersList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMembers(usersList);
        setLoading(false);
    }, (error) => {
        console.error("Leaderboard Error:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [filterMode, user, isTeacher, isStudent, userData]);

  const getRoleBadge = (role) => {
      switch(role) {
          case 'master': return { color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: <IconCrown size={14}/>, label: t('rank_cybergod') };
          case 'admin': return { color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', icon: <IconShieldCheck size={14}/>, label: t('rank_commander') };
          case 'teacher': return { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: <IconSchool size={14}/>, label: "INSTRUCTOR" };
          case 'student': return { color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', icon: <IconMedal size={14}/>, label: t('rank_soldier') };
          default: return { color: 'text-gray-500 bg-white/5 border-white/10', icon: <IconUser size={14}/>, label: t('rank_recruit') };
      }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-0 pb-40 animate-in fade-in duration-700" dir={dir}>
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 px-4 gap-6">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-900/20">
                    <IconTrophy size={32} />
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
                        {filterMode === 'squad' ? "SQUAD RANKING" : "GLOBAL ELITE"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                            {loading ? "SYNCING..." : "LIVE FEED ONLINE"}
                        </span>
                    </div>
                </div>
            </div>

            {/* زر التبديل (يظهر فقط للطلاب والأساتذة) */}
            {(!isUser) && (
                <div className="bg-[#0f0f0f] p-1 rounded-xl border border-white/10 flex">
                    <button 
                        onClick={() => setFilterMode('squad')}
                        className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                        ${filterMode === 'squad' ? 'bg-cyan-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        <IconUsers size={14}/> MY SQUAD
                    </button>
                    <button 
                        onClick={() => setFilterMode('global')}
                        className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2
                        ${filterMode === 'global' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                    >
                        <IconWorld size={14}/> GLOBAL
                    </button>
                </div>
            )}
        </div>

        {/* قائمة الأعضاء */}
        <div className="grid gap-3">
            {loading ? (
                [...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 w-full bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                ))
            ) : members.length === 0 ? (
                <div className="text-center py-20 opacity-30 flex flex-col items-center border-2 border-dashed border-white/10 rounded-[2rem]">
                    <IconUsers size={48} className="mb-4"/>
                    <p className="text-xs font-black uppercase tracking-widest">NO DATA AVAILABLE IN THIS SECTOR</p>
                </div>
            ) : (
                <AnimatePresence mode='popLayout'>
                    {members.map((m, i) => {
                        const roleInfo = getRoleBadge(m.role);
                        const isMe = m.id === user.uid;
                        
                        return (
                            <motion.div 
                                key={m.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`group relative p-4 md:p-5 rounded-[2rem] flex items-center gap-5 transition-all overflow-hidden
                                ${isMe 
                                    ? 'bg-gradient-to-r from-cyan-900/20 to-black border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                                    : 'bg-[#0a0a0a]/60 border border-white/5 hover:bg-white/[0.03] hover:border-white/10'}`}
                            >
                                {/* رقم الترتيب */}
                                <div className={`text-xl font-black font-mono w-8 text-center ${i < 3 ? 'text-yellow-400' : 'text-white/20'}`}>
                                    {i + 1}
                                </div>

                                {/* الصورة */}
                                <div className="relative shrink-0">
                                    <div className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all shadow-xl ${isMe ? 'border-cyan-500' : 'border-white/10 group-hover:border-white/30'}`}>
                                        <img 
                                            src={m.photoURL || `/avatars/avatar1.png`} 
                                            className="w-full h-full object-cover" 
                                            alt="Avatar"
                                        />
                                    </div>
                                    {i === 0 && <div className="absolute -top-2 -right-2 bg-yellow-400 text-black p-1 rounded-full shadow-lg"><IconCrown size={12}/></div>}
                                </div>

                                {/* البيانات */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                        <span className={`font-black text-base tracking-tight truncate uppercase ${isMe ? 'text-cyan-400' : 'text-white'}`}>
                                            {m.displayName || "Unknown_Agent"}
                                        </span>
                                        
                                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border w-fit ${roleInfo.color}`}>
                                            {roleInfo.icon}
                                            <span className="text-[8px] font-black uppercase tracking-wider">{roleInfo.label}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-white/30">
                                            <IconActivity size={12} className="text-cyan-500" />
                                            <span className="text-[10px] font-mono font-bold">{m.xp || 0} XP</span>
                                        </div>
                                        <div className="w-px h-2 bg-white/10" />
                                        <div className="flex items-center gap-1.5 text-white/30">
                                            <IconTrophy size={12} className="text-amber-500" />
                                            <span className="text-[10px] font-mono font-bold">LVL.{Math.floor((m.xp || 0) / 500) + 1}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* الزخرفة */}
                                {isMe && <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500"></div>}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            )}
        </div>
    </div>
  );
}