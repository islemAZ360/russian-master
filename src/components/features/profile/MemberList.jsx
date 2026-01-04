"use client";
import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { 
  IconShieldCheck, IconCrown, IconUser, IconMedal, 
  IconUsers, IconActivity, IconTrophy 
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * مكون قائمة الأعضاء (MemberList)
 * يعرض كافة العملاء المسجلين في النظام مع رتبهم وإحصائياتهم المترجمة
 */
export default function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, dir, isRTL } = useLanguage();

  // 1. جلب بيانات العملاء من Firestore بترتيب الـ XP
  useEffect(() => {
    const q = query(
        collection(db, "users"), 
        orderBy("xp", "desc"),
        limit(50) // جلب أفضل 50 عميل لضمان الأداء
    );

    const unsubscribe = onSnapshot(q, (snap) => {
        const usersList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMembers(usersList);
        setLoading(false);
    }, (error) => {
        console.error("Neural Network Access Denied:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * دالة مساعدة لتحديد لون وأيقونة الرتبة بناءً على الدور
   */
  const getRoleBadge = (role) => {
      switch(role) {
          case 'master': return { color: 'text-red-500', icon: <IconCrown size={16}/>, label: t('rank_cybergod') };
          case 'admin': return { color: 'text-purple-500', icon: <IconShieldCheck size={16}/>, label: t('rank_commander') };
          case 'junior': return { color: 'text-cyan-400', icon: <IconMedal size={16}/>, label: t('rank_hacker') };
          default: return { color: 'text-gray-500', icon: <IconUser size={16}/>, label: t('rank_recruit') };
      }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-0 pb-40 animate-in fade-in duration-700" dir={dir}>
        
        {/* هيدر القائمة */}
        <div className="flex items-center gap-4 mb-10 px-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <IconUsers size={28} />
            </div>
            <div>
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter italic">
                    {t('admin_operatives')}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Neural_Network_Online</span>
                </div>
            </div>
        </div>

        {/* شبكة الأعضاء */}
        <div className="grid gap-4">
            {loading ? (
                /* حالة التحميل */
                [...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 w-full bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                ))
            ) : (
                <AnimatePresence>
                    {members.map((m, i) => {
                        const roleInfo = getRoleBadge(m.role);
                        return (
                            <motion.div 
                                key={m.id}
                                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-[#0a0a0a]/60 border border-white/5 p-4 md:p-6 rounded-[2rem] flex items-center gap-5 hover:bg-white/[0.03] hover:border-white/10 transition-all shadow-xl relative overflow-hidden"
                            >
                                {/* مؤشر الترتيب */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* الصورة الشخصية (Avatar) */}
                                <div className="relative shrink-0">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-cyan-500/30 transition-colors shadow-2xl">
                                        <img 
                                            src={m.photoURL || `/avatars/avatar1.png`} 
                                            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" 
                                            alt="Avatar"
                                        />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-black border border-white/10 rounded-lg px-2 py-0.5 text-[9px] font-black text-white shadow-xl">
                                        #{i+1}
                                    </div>
                                </div>

                                {/* معلومات العميل */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1">
                                        <span className="font-black text-white text-lg tracking-tight truncate uppercase">
                                            {m.displayName || "Unknown_Agent"}
                                        </span>
                                        
                                        {/* شارة الرتبة المترجمة */}
                                        <div className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/5 w-fit ${roleInfo.color}`}>
                                            {roleInfo.icon}
                                            <span className="text-[9px] font-black uppercase tracking-widest">{roleInfo.label}</span>
                                        </div>
                                    </div>

                                    {/* شريط الإحصائيات الصغير */}
                                    <div className="flex items-center gap-4 mt-2">
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

                                {/* أيقونة تجميلية في الطرف الآخر */}
                                <div className="hidden sm:block opacity-10 group-hover:opacity-40 group-hover:scale-110 transition-all">
                                    {m.role === 'master' ? <IconCrown size={40} className="text-red-500" /> : <IconActivity size={40} className="text-white" />}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            )}
        </div>

        {/* فوتر القائمة */}
        <div className="mt-12 p-8 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-30">
            <p className="text-[10px] font-black font-mono uppercase tracking-[0.5em]">End_of_Operative_Directory</p>
        </div>
    </div>
  );
}