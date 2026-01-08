"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch, IconHome, IconSettings, IconUser, IconCpu, 
  IconMessage, IconDeviceGamepad, IconLogout, IconTerminal,
  IconSchool, IconChartBar, IconUsers, IconBroadcast, IconShield
} from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/hooks/useLanguage';

export default function CommandMenu({ isOpen, onClose, onNavigate, onAction }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { user, isTeacher, isStudent, isAdmin, logout } = useAuth();
  const { t } = useLanguage();

  // بناء القائمة ديناميكياً بناءً على الرتبة
  const actions = useMemo(() => {
    const baseActions = [
      { id: 'home', label: t('nav_home') || 'Base', icon: IconHome, group: 'Navigation' },
      { id: 'profile', label: t('nav_rank') || 'Profile', icon: IconUser, group: 'Navigation' },
      { id: 'settings', label: t('nav_settings') || 'System Config', icon: IconSettings, group: 'System' },
    ];

    if (isTeacher) {
      baseActions.push(
        { id: 'teacher_students', label: t('nav_students') || 'Squad Management', icon: IconUsers, group: 'Command' },
        { id: 'teacher_progress', label: t('nav_progress') || 'Analytics', icon: IconChartBar, group: 'Command' },
        { id: 'teacher_db', label: t('nav_create_db') || 'Content Database', icon: IconCpu, group: 'Command' },
        { id: 'live', label: t('nav_live') || 'Live Stream', icon: IconBroadcast, group: 'Command' },
      );
    }

    if (isStudent) {
      baseActions.push(
        { id: 'category', label: t('nav_study') || 'Start Mission', icon: IconCpu, group: 'Mission' },
        { id: 'leaderboard', label: t('nav_rewards') || 'Rankings', icon: IconUser, group: 'Mission' },
        { id: 'live', label: t('nav_live') || 'Join Uplink', icon: IconSchool, group: 'Mission' },
      );
    }

    if (isAdmin) {
      baseActions.push(
        { id: 'admin_panel', label: t('nav_admin') || 'Admin Terminal', icon: IconShield, group: 'Root' },
      );
    }

    // إضافة الخيارات العامة والألعاب
    baseActions.push(
        { id: 'games', label: t('nav_games') || 'Arcade', icon: IconDeviceGamepad, group: 'Extras' },
        { id: 'chat', label: t('nav_chat') || 'Comms', icon: IconMessage, group: 'Extras' },
        { id: 'logout', label: t('logout_btn') || 'Terminate Session', icon: IconLogout, group: 'System', color: 'text-red-500' }
    );

    return baseActions;
  }, [isTeacher, isStudent, isAdmin, t]);

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e) => {
      // فتح القائمة بـ Ctrl+K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : onAction('open_cmd');
      }
      
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        const item = filtered[selectedIndex];
        if (item) {
          if (item.id === 'logout') {
              logout();
          } else {
              onNavigate(item.id);
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered, onClose, onAction, onNavigate, logout]);

  // تصفير التحديد عند تغيير البحث
  useEffect(() => setSelectedIndex(0), [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-[#09090b] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
      >
        <div className="flex items-center px-4 py-4 border-b border-white/10 bg-white/[0.02]">
          <IconSearch className="text-cyan-500 mr-3 animate-pulse" size={20} />
          <input 
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Run command..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 font-mono text-sm uppercase tracking-widest"
          />
          <div className="text-[10px] text-white/20 bg-white/5 px-2 py-1 rounded font-bold">ESC</div>
        </div>
        
        <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/30 text-xs font-mono uppercase tracking-widest">No matching protocols.</div>
          ) : (
            filtered.map((action, i) => (
              <div
                key={`${action.group}-${action.id}`}
                onClick={() => { 
                    if(action.id === 'logout') logout();
                    else onNavigate(action.id); 
                    onClose(); 
                }}
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-all border-l-2
                  ${i === selectedIndex 
                    ? 'bg-white/10 border-cyan-500 text-white' 
                    : 'border-transparent text-white/50 hover:bg-white/5'
                  }`}
              >
                <action.icon size={18} className={action.color || (i === selectedIndex ? "text-cyan-400" : "text-white/40")} />
                <div className="flex flex-col">
                    <span className={`text-sm font-bold ${i === selectedIndex ? 'text-white' : ''}`}>{action.label}</span>
                    {i === selectedIndex && <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">{action.group}</span>}
                </div>
                {i === selectedIndex && <IconTerminal size={14} className="ml-auto text-cyan-500 animate-pulse" />}
              </div>
            ))
          )}
        </div>
        
        <div className="px-4 py-2 bg-black/50 border-t border-white/5 flex justify-between items-center text-[9px] text-white/30 uppercase tracking-wider font-mono">
            <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                System Operational
            </span>
            <span className="flex items-center gap-2">
                Select <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white">↵</kbd>
            </span>
        </div>
      </motion.div>
    </div>
  );
}