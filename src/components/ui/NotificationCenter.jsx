"use client";
import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
// هذا هو السطر الذي كان ناقصاً ويسبب المشكلة 👇
import { motion, AnimatePresence } from 'framer-motion'; 
import { IconBell, IconX, IconUserPlus, IconAward, IconMessageCircle } from '@tabler/icons-react';

export default function NotificationCenter() {
  const { notifications, removeNotification, setCurrentView } = useUI();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (n) => {
    if (n.type === 'invite') setCurrentView('chat');
    if (n.type === 'rank') setCurrentView('leaderboard');
    if (n.type === 'support_reply') setCurrentView('settings');
    if (n.type === 'admin_alert') setCurrentView('admin_panel');
    removeNotification(n.id);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-6 right-6 z-[9999]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full border transition-all shadow-lg ${notifications.length > 0 ? 'bg-cyan-600 border-cyan-400 text-white animate-pulse' : 'bg-black/80 border-white/20 text-white/50 hover:text-white'}`}
      >
        <IconBell size={24} />
        {notifications.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white border border-black">{notifications.length}</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute top-14 right-0 w-80 bg-[#111] border border-white/20 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
                <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <span className="text-xs font-bold text-white uppercase tracking-widest">NOTIFICATIONS</span>
                    <button onClick={()=>setIsOpen(false)} className="hover:text-red-500 transition-colors"><IconX size={16}/></button>
                </div>
                
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-white/30 text-xs font-mono">NO NEW SIGNALS</div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} onClick={() => handleAction(n)} className="p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer flex gap-3 items-start group transition-colors">
                                <div className="mt-1 shrink-0">
                                    {n.type === 'invite' && <IconUserPlus className="text-cyan-400" size={20}/>}
                                    {n.type === 'rank' && <IconAward className="text-yellow-400" size={20}/>}
                                    {n.type === 'support_reply' && <IconMessageCircle className="text-purple-400" size={20}/>}
                                    {n.type === 'admin_alert' && <IconMessageCircle className="text-red-500" size={20}/>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors mb-1 truncate">{n.title}</h4>
                                    <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{n.message}</p>
                                    <div className="text-[9px] text-white/20 mt-2 font-mono">{n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleTimeString() : 'Now'}</div>
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