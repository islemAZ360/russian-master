"use client";
import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion'; 
import { IconBell, IconX, IconUserPlus, IconAward, IconMessageCircle, IconShieldAlert } from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotificationCenter() {
  const { notifications, removeNotification, setCurrentView } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  // التأكد من أن notifications هي مصفوفة دائماً لتجنب خطأ Line 81
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const handleAction = (n) => {
    if (n.type === 'invite') setCurrentView('chat');
    if (n.type === 'rank') setCurrentView('leaderboard');
    if (n.type === 'support_reply') setCurrentView('settings');
    if (n.type === 'admin_alert') setCurrentView('admin_panel');
    removeNotification(n.id);
    setIsOpen(false);
  };

  const getNotifTitle = (type) => {
    const map = {
      'invite': t('notif_type_invite'),
      'rank': t('notif_type_rank'),
      'support_reply': t('notif_type_support'),
      'admin_alert': t('notif_type_admin')
    };
    return map[type] || t('notif_type_admin');
  };

  return (
    <div className="fixed top-6 right-6 z-[9999]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full border transition-all shadow-lg ${safeNotifications.length > 0 ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse' : 'bg-black/80 border-white/20 text-white/50 hover:text-white'}`}
        title={t('notif_title')}
      >
        <IconBell size={24} />
        {safeNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-black text-white border-2 border-black">
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
                className="absolute top-16 right-0 w-80 bg-[#0a0a0a]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
                <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('notif_title')}</span>
                    <button onClick={()=>setIsOpen(false)} className="text-white/20 hover:text-white transition-colors"><IconX size={18}/></button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {safeNotifications.length === 0 ? (
                        <div className="p-12 text-center text-white/20 text-[10px] font-mono tracking-widest uppercase">
                            {t('notif_empty')}
                        </div>
                    ) : (
                        safeNotifications.map(n => (
                            <div key={n.id} onClick={() => handleAction(n)} className="p-5 border-b border-white/5 hover:bg-white/5 cursor-pointer flex gap-4 items-start group transition-all">
                                <div className="mt-1 shrink-0 p-2 rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                    {n.type === 'invite' && <IconUserPlus size={20}/>}
                                    {n.type === 'rank' && <IconAward size={20}/>}
                                    {n.type === 'support_reply' && <IconMessageCircle size={20}/>}
                                    {n.type === 'admin_alert' && <IconShieldAlert size={20}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors mb-1 truncate uppercase">
                                        {getNotifTitle(n.type)}
                                    </h4>
                                    <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{n.message}</p>
                                    <div className="text-[8px] text-white/20 mt-3 font-mono uppercase">
                                        {n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleTimeString() : t('notif_now')}
                                    </div>
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