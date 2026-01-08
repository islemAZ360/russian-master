"use client";
import React, { useState } from 'react';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  IconBell, IconX, IconUserPlus, IconAward, 
  IconMessageCircle, IconShield, IconCheck, IconLoader2, 
  IconInfoCircle, IconBroadcast, IconSchool, IconBook, IconTrendingUp
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotificationCenter() {
  const { notifications, removeNotification, setCurrentView, setShowSupport, startBroadcast } = useUI();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const { t, dir } = useLanguage();

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  // --- 1. معالجة قبول دعوة الانضمام للفريق ---
  const handleAcceptInvite = async (notification) => {
    if (!user || !notification.actionPayload) return;
    
    setProcessingId(notification.id);

    try {
        const { teacherId, teacherName } = notification.actionPayload;

        // أ. تحديث بيانات المستخدم الحالي (الطالب)
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            role: 'student',        
            teacherId: teacherId,   
            updatedAt: serverTimestamp()
        });

        // ب. إرسال إشعار للأستاذ بأن الدعوة قُبلت
        await addDoc(collection(db, "notifications"), {
            userId: teacherId, 
            target: 'teacher',
            type: "recruit_success", 
            title: "✅ RECRUITMENT SUCCESS",
            message: `Operative ${user.displayName || "Agent"} joined your squad.`,
            senderId: user.uid,
            createdAt: serverTimestamp(),
            read: false
        });

        // ج. حذف إشعار الدعوة
        await deleteDoc(doc(db, "notifications", notification.id));

        alert(`You have joined ${teacherName}'s squad! Reloading systems...`);
        window.location.reload();

    } catch (error) {
        console.error("Acceptance Error:", error);
        alert("Failed to join squad. Communication error.");
        setProcessingId(null);
    }
  };

  // --- 2. حذف الإشعار ---
  const handleDismiss = async (e, id) => {
      e.stopPropagation();
      await removeNotification(id);
  };

  // --- 3. التوجيه عند النقر ---
  const handleNavigation = (n) => {
    // الدعوات تتطلب ضغط زر القبول
    if (n.type === 'invite') return;

    // أ. البث المباشر
    if (n.type === 'live_start' && n.roomId) {
        setIsOpen(false);
        setCurrentView('live');
        setTimeout(() => startBroadcast(n.roomId), 500);
        return;
    }
    
    // ب. رسائل الأدمن أو الدعم (تفتح نافذة الدعم)
    if (n.type === 'support_reply' || n.type === 'admin_msg') {
        setShowSupport(true);
    }
    
    // ج. الترقية أو الجوائز (تفتح البروفايل/الترتيب)
    if (n.type === 'rank_up' || n.type === 'recruit_success') {
        setCurrentView('leaderboard'); 
    }

    // د. محتوى جديد من الأستاذ (يفتح صفحة الدروس)
    if (n.type === 'new_content') {
        setCurrentView('category'); 
    }

    // إغلاق القائمة وحذف الإشعار بعد التفاعل
    setIsOpen(false);
    removeNotification(n.id);
  };

  // عناوين الإشعارات حسب النوع
  const getNotifTitle = (type) => {
    const map = {
      'invite': t('notif_type_invite') || "SQUAD INVITE",
      'rank_up': "🎖️ RANK PROMOTION",
      'support_reply': "SUPPORT REPLY",
      'admin_msg': "👮‍♂️ ADMIN MESSAGE",
      'admin_alert': "⚠️ SYSTEM ALERT",
      'live_start': "🔴 LIVE STREAM",
      'recruit_success': "SQUAD UPDATE",
      'new_content': "📚 NEW INTEL",
      'info': "SYSTEM INFO"
    };
    return map[type] || "SYSTEM MESSAGE";
  };

  const formatTime = (timestamp) => {
      if (!timestamp) return "Just now"; 
      try {
          const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
          const now = new Date();
          const diff = (now - date) / 1000;
          if (diff < 60) return "Just now";
          if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
          if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
          return date.toLocaleDateString();
      } catch (e) { return "Now"; }
  };

  const getIcon = (type) => {
    switch (type) {
        case 'invite': return <IconSchool size={20} className="text-purple-400"/>;
        case 'rank_up': return <IconTrendingUp size={20} className="text-yellow-400"/>;
        case 'support_reply': return <IconMessageCircle size={20} className="text-blue-400"/>;
        case 'admin_msg': return <IconShield size={20} className="text-red-500"/>;
        case 'admin_alert': return <IconShield size={20} className="text-red-500"/>;
        case 'live_start': return <IconBroadcast size={20} className="animate-pulse text-red-500" />;
        case 'recruit_success': return <IconUserPlus size={20} className="text-emerald-400"/>;
        case 'new_content': return <IconBook size={20} className="text-cyan-400"/>;
        default: return <IconInfoCircle size={20} className="text-gray-400"/>;
    }
  };

  return (
    <div className={`fixed top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-[9999] font-sans`} dir={dir}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-3 rounded-2xl border transition-all duration-300 shadow-2xl group
          bg-[#0a0a0a]/90 border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/50
        `}
      >
        {/* FIX: إزالة التوهج الغبي (animate-pulse) واستبداله باهتزاز بسيط للأيقونة فقط عند وجود إشعارات */}
        <IconBell 
            size={24} 
            className={safeNotifications.length > 0 ? "text-cyan-400 animate-swing" : "text-white/60"} 
        />
        
        {safeNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full text-[10px] flex items-center justify-center font-black text-white border-2 border-[#0a0a0a] shadow-lg animate-in zoom-in">
            {safeNotifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute top-16 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-[360px] bg-[#0d0d0d] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-3xl`}
            >
                {/* Header */}
                <div className="p-5 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                            {t('notif_title') || "NEURAL ALERTS"}
                        </span>
                    </div>
                    <button onClick={()=>setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full text-white/20 hover:text-white transition-colors">
                        <IconX size={16}/>
                    </button>
                </div>
                
                {/* Body */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {safeNotifications.length === 0 ? (
                        <div className="py-16 flex flex-col items-center justify-center text-center opacity-30">
                            <IconBell size={48} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Active Signals</p>
                        </div>
                    ) : (
                        safeNotifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => handleNavigation(n)} 
                                className={`p-5 border-b border-white/5 flex gap-4 items-start relative group transition-all 
                                ${n.type === 'invite' ? 'bg-purple-500/5' : 'hover:bg-white/5 cursor-pointer'}
                                ${n.type === 'admin_msg' ? 'bg-red-500/5 border-l-2 border-l-red-500' : ''}
                                ${n.type === 'rank_up' ? 'bg-yellow-500/5 border-l-2 border-l-yellow-500' : ''}
                                ${n.type === 'new_content' ? 'bg-cyan-500/5 border-l-2 border-l-cyan-500' : ''}`}
                            >
                                {/* Icon */}
                                <div className="mt-1 shrink-0 p-2.5 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-lg">
                                    {getIcon(n.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className={`text-xs font-black uppercase tracking-tight truncate ${n.type === 'invite' ? 'text-purple-400' : 'text-white'}`}>
                                            {getNotifTitle(n.type)}
                                        </h4>
                                        <span className="text-[9px] font-mono text-white/20 uppercase whitespace-nowrap ml-2">
                                            {formatTime(n.createdAt)}
                                        </span>
                                    </div>
                                    
                                    <p className="text-[11px] text-white/60 leading-relaxed font-medium mb-3">
                                        {n.message}
                                    </p>
                                    
                                    {/* Invite Actions (Only for Invite type) */}
                                    {n.type === 'invite' && (
                                        <div className="flex gap-2 mt-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAcceptInvite(n); }}
                                                disabled={processingId === n.id}
                                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {processingId === n.id ? <IconLoader2 className="animate-spin" size={12}/> : <IconCheck size={12}/>}
                                                ACCEPT
                                            </button>
                                            <button 
                                                onClick={(e) => handleDismiss(e, n.id)}
                                                disabled={processingId === n.id}
                                                className="px-3 py-2 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 border border-white/10 hover:border-red-500/30 rounded-lg transition-all"
                                            >
                                                <IconX size={14}/>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}