"use client";
import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  IconBell, IconX, IconUserPlus, IconAward, 
  IconMessageCircle, IconShieldAlert, IconArrowRight 
} from '@tabler/icons-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function NotificationCenter() {
  const { notifications, removeNotification, setCurrentView, setShowSupport } = useUI();
  const [isOpen, setIsOpen] = useState(false);
  const { t, dir } = useLanguage();

  // تأمين البيانات: نضمن أن المكون يتعامل مع مصفوفة دائماً
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  /**
   * معالجة الضغط على الإشعار
   * تم تعديل المنطق ليدعم "المبادرة بالدردشة" من قبل الأدمن
   */
  const handleAction = (n) => {
    // 1. إذا كان رد من الدعم أو مبادرة من الأدمن -> فتح نافذة الدعم فوراً
    if (n.type === 'support_reply') {
        setShowSupport(true);
    } 
    // 2. إذا كانت دعوة فريق -> الذهاب لصفحة الدردشة
    else if (n.type === 'invite') {
        setCurrentView('chat');
    } 
    // 3. إذا كانت ترقية رتبة -> الذهاب لسجل الرتب
    else if (n.type === 'rank') {
        setCurrentView('leaderboard');
    } 
    // 4. إذا كان تنبيه إداري عام -> الذهاب للوحة التحكم (للأدمن فقط عادة)
    else if (n.type === 'admin_alert') {
        setCurrentView('admin_panel');
    }

    // حذف الإشعار بعد التفاعل معه ليبقى المركز نظيفاً
    removeNotification(n.id);
    setIsOpen(false);
  };

  /**
   * الحصول على عنوان مترجم بناءً على نوع الإشعار
   */
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

      {/* قائمة الإشعارات المنسدلة */}
      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute top-16 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-85 bg-[#0d0d0d] border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-2xl`}
                style={{ width: '340px' }}
            >
                {/* رأس القائمة */}
                <div className="p-5 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{t('notif_title')}</span>
                    </div>
                    <button onClick={()=>setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-colors">
                        <IconX size={18}/>
                    </button>
                </div>
                
                {/* محتوى الإشعارات */}
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
                                onClick={() => handleAction(n)} 
                                className="p-5 border-b border-white/5 hover:bg-white/5 cursor-pointer flex gap-4 items-start group transition-all relative overflow-hidden"
                            >
                                {/* مؤشر جانبي للحركة */}
                                <div className="absolute left-0 top-0 w-1 h-full bg-cyan-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>

                                {/* أيقونة الإشعار بناءً على النوع */}
                                <div className="mt-1 shrink-0 p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all">
                                    {n.type === 'invite' && <IconUserPlus size={20}/>}
                                    {n.type === 'rank' && <IconAward size={20}/>}
                                    {n.type === 'support_reply' && <IconMessageCircle size={20}/>}
                                    {n.type === 'admin_alert' && <IconShieldAlert size={20}/>}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight truncate">
                                            {getNotifTitle(n.type)}
                                        </h4>
                                        <span className="text-[8px] font-mono text-white/20 uppercase">
                                            {n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : t('notif_now')}
                                        </span>
                                    </div>
                                    
                                    <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2 font-medium">
                                        {n.message}
                                    </p>
                                    
                                    <div className="mt-3 flex items-center gap-1 text-[8px] font-black text-cyan-500/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                        <span>Initialize Link</span>
                                        <IconArrowRight size={10} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {/* تذييل القائمة */}
                {safeNotifications.length > 0 && (
                    <div className="p-3 bg-black/40 border-t border-white/5 text-center">
                        <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">
                            Secure Communication Channel v4.0
                        </span>
                    </div>
                )}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}