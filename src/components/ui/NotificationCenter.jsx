"use client";
import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  IconBell, IconX, IconUserPlus, IconAward, 
  IconMessageCircle, IconShield, IconCheck, IconLoader2, 
  IconInfoCircle, IconBroadcast 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotificationCenter() {
  // إضافة startBroadcast للتعامل مع إشعارات البث
  const { notifications, removeNotification, setCurrentView, setShowSupport, startBroadcast } = useUI();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const { t, dir } = useLanguage();

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const handleAcceptInvite = async (notification) => {
    if (!user || !notification.actionPayload) return;
    
    setProcessingId(notification.id);

    try {
        const { teacherId, newRole } = notification.actionPayload;

        // 1. تحديث بيانات المستخدم
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            role: newRole,
            teacherId: teacherId,
            updatedAt: serverTimestamp()
        });

        // 2. إشعار الأستاذ
        await addDoc(collection(db, "notifications"), {
            userId: teacherId,
            target: 'teacher',
            type: "info",
            title: "RECRUITMENT SUCCESSFUL",
            message: `${user.displayName || "Agent"} has joined your squad.`,
            createdAt: serverTimestamp(),
            read: false
        });

        // 3. حذف الدعوة
        await removeNotification(notification.id);

        // 4. إعادة التحميل
        window.location.reload();

    } catch (error) {
        console.error("Invite Error:", error);
        setProcessingId(null);
    }
  };

  const handleDismiss = async (e, id) => {
      e.stopPropagation();
      await removeNotification(id);
  };

  // --- التوجيه الذكي عند الضغط على الإشعار ---
  const handleNavigation = (n) => {
    // دعوات الانضمام لها أزرار خاصة ولا يتم تفعيلها بالنقر العام
    if (n.type === 'invite') return;

    // 1. معالجة إشعار البث المباشر (الجديد)
    if (n.type === 'live_start' && n.roomId) {
        startBroadcast(n.roomId); // دالة بدء البث من الـ Context
    }
    // 2. ردود الدعم الفني
    else if (n.type === 'support_reply') {
        setShowSupport(true);
    }
    // 3. الترقيات والجوائز
    else if (n.type === 'rank') {
        setCurrentView('leaderboard');
    }
    // 4. تنبيهات الأدمن
    else if (n.type === 'admin_alert') {
        // إذا كان المستخدم أدمن يذهب للوحة، وإلا يكتفي بالقراءة
        // (يمكن توجيهه لصفحة خاصة إذا لزم الأمر)
    }
    
    setIsOpen(false);
    removeNotification(n.id);
  };

  const getNotifTitle = (type) => {
    const map = {
      'invite': t('notif_type_invite') || "INVITATION",
      'rank': t('notif_type_rank') || "PROMOTION",
      'support_reply': t('notif_type_support') || "SUPPORT",
      'admin_alert': t('notif_type_admin') || "ALERT",
      'live_start': "🔴 LIVE STREAM", // عنوان إشعار البث
      'info': "SYSTEM INFO"
    };
    return map[type] || "SYSTEM ALERT";
  };

  const formatTime = (timestamp) => {
      if (!timestamp) return "..."; 
      if (timestamp?.toDate) {
          try {
              return new Date(timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          } catch (e) { return "Now"; }
      }
      return "Now";
  };

  const getIcon = (type) => {
    switch (type) {
        case 'invite': return <IconUserPlus size={20} />;
        case 'rank': return <IconAward size={20} />;
        case 'support_reply': return <IconMessageCircle size={20} />;
        case 'admin_alert': return <IconShield size={20} />;
        case 'live_start': return <IconBroadcast size={20} className="animate-pulse text-red-500" />; // أيقونة البث
        default: return <IconInfoCircle size={20} />;
    }
  };

  return (
    <div className={`fixed top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-[9999]`} dir={dir}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-2xl border transition-all duration-300 shadow-2xl group relative
          ${safeNotifications.length > 0 
            ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse' 
            : 'bg-[#0a0a0a]/80 border-white/10 text-white/40 hover:text-white hover:border-white/20'
          }`}
      >
        <IconBell size={24} className="group-hover:rotate-12 transition-transform" />
        
        {safeNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-black text-white border-2 border-black shadow-lg">
            {safeNotifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute top-16 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-85 bg-[#0d0d0d] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl`}
                style={{ width: '360px' }}
            >
                <div className="p-5 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('notif_title') || "NOTIFICATIONS"}</span>
                    </div>
                    <button onClick={()=>setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-colors">
                        <IconX size={18}/>
                    </button>
                </div>
                
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {safeNotifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <IconBell size={48} className="mx-auto mb-4 text-white/5" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-relaxed">
                                {t('notif_empty') || "NO NEW SIGNALS"}
                            </p>
                        </div>
                    ) : (
                        safeNotifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => handleNavigation(n)} 
                                className={`p-5 border-b border-white/5 flex gap-4 items-start group transition-all relative overflow-hidden ${n.type !== 'invite' ? 'cursor-pointer hover:bg-white/5' : ''}`}
                            >
                                <div className="mt-1 shrink-0 p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
                                    {getIcon(n.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                                            {getNotifTitle(n.type)}
                                        </h4>
                                        <span className="text-[8px] font-mono text-white/20 uppercase">
                                            {formatTime(n.createdAt)}
                                        </span>
                                    </div>
                                    
                                    <p className="text-[11px] text-white/50 leading-relaxed font-medium mb-3">
                                        {n.message}
                                    </p>
                                    
                                    {n.type === 'invite' && (
                                        <div className="flex gap-2 mt-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAcceptInvite(n); }}
                                                disabled={processingId === n.id}
                                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                                            >
                                                {processingId === n.id ? <IconLoader2 className="animate-spin" size={12}/> : <IconCheck size={12}/>}
                                                ACCEPT
                                            </button>
                                            <button 
                                                onClick={(e) => handleDismiss(e, n.id)}
                                                disabled={processingId === n.id}
                                                className="py-2 px-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 border border-white/10 hover:border-red-500/30 rounded-lg transition-all"
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