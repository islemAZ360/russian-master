"use client";
import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '@/context/AuthContext'; // نحتاج هذا لنعرف من هو المستخدم الحالي لتحديث بياناته
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  IconBell, IconX, IconUserPlus, IconAward, 
  IconMessageCircle, IconShieldAlert, IconCheck, IconLoader
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotificationCenter() {
  const { notifications, removeNotification, setCurrentView, setShowSupport } = useUI();
  const { user } = useAuth(); // المستخدم الحالي
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null); // لتتبع الإشعار الذي يتم معالجته حالياً
  const { t, dir } = useLanguage();

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  /**
   * معالجة قبول الدعوة (Accept Invite)
   * هذه الدالة هي التي تحول المستخدم العادي إلى طالب
   */
  const handleAcceptInvite = async (notification) => {
    if (!user || !notification.actionPayload) return;
    
    setProcessingId(notification.id);

    try {
        const { teacherId, newRole } = notification.actionPayload;

        // 1. تحديث مستند المستخدم الحالي
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            role: newRole,      // تحويله إلى 'student'
            teacherId: teacherId, // ربطه بالأستاذ
            updatedAt: serverTimestamp()
        });

        // 2. إشعار الأستاذ بأن الطالب قبل الدعوة
        await addDoc(collection(db, "notifications"), {
            userId: teacherId,
            type: "info",
            title: "RECRUITMENT SUCCESSFUL",
            message: `${user.displayName || "Agent"} has joined your squad.`,
            createdAt: serverTimestamp(),
            read: false
        });

        // 3. حذف إشعار الدعوة
        await removeNotification(notification.id);

        // 4. إعادة تحميل الصفحة لتطبيق الصلاحيات الجديدة (الواجهة ستتغير بالكامل)
        window.location.reload();

    } catch (error) {
        console.error("Failed to accept invite:", error);
        alert("System Error: Could not process uplink.");
        setProcessingId(null);
    }
  };

  /**
   * معالجة الرفض أو الحذف العادي
   */
  const handleDismiss = async (e, id) => {
      e.stopPropagation();
      await removeNotification(id);
  };

  /**
   * معالجة الضغط على الإشعارات الأخرى (التوجيه)
   */
  const handleNavigation = (n) => {
    if (n.type === 'invite') return; // الدعوات لا تقوم بالتوجيه، بل تتطلب إجراء

    if (n.type === 'support_reply') setShowSupport(true);
    else if (n.type === 'rank') setCurrentView('leaderboard');
    else if (n.type === 'admin_alert') setCurrentView('admin_panel');
    
    // إغلاق القائمة بعد التوجيه
    setIsOpen(false);
    // يمكننا حذف الإشعار أو تركه، سنحذفه ليبقى المركز نظيفاً
    removeNotification(n.id);
  };

  const getNotifTitle = (type) => {
    const map = {
      'invite': t('notif_type_invite'),
      'rank': t('notif_type_rank'),
      'support_reply': t('notif_type_support'),
      'admin_alert': t('notif_type_admin')
    };
    return map[type] || "SYSTEM ALERT";
  };

  return (
    <div className={`fixed top-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-[9999]`} dir={dir}>
      {/* زر الجرس العائم */}
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

      {/* قائمة الإشعارات */}
      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute top-16 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-85 bg-[#0d0d0d] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl`}
                style={{ width: '360px' }}
            >
                {/* Header */}
                <div className="p-5 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('notif_title')}</span>
                    </div>
                    <button onClick={()=>setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-colors">
                        <IconX size={18}/>
                    </button>
                </div>
                
                {/* Content */}
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {safeNotifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <IconBell size={48} className="mx-auto mb-4 text-white/5" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-relaxed">
                                {t('notif_empty')}
                            </p>
                        </div>
                    ) : (
                        safeNotifications.map(n => (
                            <div 
                                key={n.id} 
                                onClick={() => handleNavigation(n)}
                                className={`p-5 border-b border-white/5 flex gap-4 items-start group transition-all relative overflow-hidden ${n.type !== 'invite' ? 'cursor-pointer hover:bg-white/5' : ''}`}
                            >
                                {/* Icon */}
                                <div className="mt-1 shrink-0 p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
                                    {n.type === 'invite' && <IconUserPlus size={20}/>}
                                    {n.type === 'rank' && <IconAward size={20}/>}
                                    {n.type === 'support_reply' && <IconMessageCircle size={20}/>}
                                    {n.type === 'admin_alert' && <IconShieldAlert size={20}/>}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">
                                            {getNotifTitle(n.type)}
                                        </h4>
                                        <span className="text-[8px] font-mono text-white/20 uppercase">
                                            {n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "NOW"}
                                        </span>
                                    </div>
                                    
                                    <p className="text-[11px] text-white/50 leading-relaxed font-medium mb-3">
                                        {n.message}
                                    </p>
                                    
                                    {/* Invite Actions - أزرار القبول والرفض للدعوات فقط */}
                                    {n.type === 'invite' && (
                                        <div className="flex gap-2 mt-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleAcceptInvite(n); }}
                                                disabled={processingId === n.id}
                                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                                            >
                                                {processingId === n.id ? <IconLoader className="animate-spin" size={12}/> : <IconCheck size={12}/>}
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
                
                {/* Footer */}
                {safeNotifications.length > 0 && (
                    <div className="p-3 bg-black/40 border-t border-white/5 text-center">
                        <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                            Secure Uplink v4.2
                        </span>
                    </div>
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}