/* Filename: components/views/SettingsView.jsx */
"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext'; 
import { useUI } from '../../context/UIContext';
import { auth } from '../../lib/firebase';
import { 
  IconCpu, IconMoon, IconSun, IconDeviceDesktop, 
  IconVolume, IconLogout, IconCheck
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  const { user, logout } = useAuth(); // استخدام دالة logout من الكونتكست
  const { settings, updateSettings, isDark } = useSettings();
  const { setShowSupport } = useUI();
  
  // حالة لاكتشاف ما هو النظام الحالي للجهاز
  const [systemPref, setSystemPref] = useState('Checking...');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setSystemPref(isSystemDark ? 'Dark System' : 'Light System');
    }
  }, []);

  const QualityButton = ({ value, label, sub }) => {
    const isActive = settings.quality === value;
    let colorClass = isActive 
        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]" 
        : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10 hover:text-white";

    return (
      <button 
        onClick={() => updateSettings('quality', value)}
        className={`relative w-full p-4 rounded-xl border border-[var(--border-color)] btn-shine flex flex-col items-center gap-1 ${colorClass}`}
      >
        <span className="font-bold tracking-widest text-xs uppercase">{label}</span>
        <span className="text-[9px] opacity-70">{sub}</span>
        {isActive && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></span>
        )}
      </button>
    );
  };

  const ThemeButton = ({ value, icon: Icon, label }) => {
    const isActive = settings.theme === value;
    const isAuto = value === 'system';
    
    // تصميم خاص لزر Auto Sync ليصبح مفيداً
    return (
        <button
            onClick={() => updateSettings('theme', value)}
            className={`group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 btn-shine 
            ${isActive 
                ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_25px_rgba(139,92,246,0.15)]' 
                : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-violet-500/50'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-violet-500 text-white' : 'bg-white/10 text-[var(--text-muted)]'}`}>
                    <Icon size={20} />
                </div>
                <div className="text-left">
                    <div className={`text-sm font-bold ${isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-white'}`}>{label}</div>
                    
                    {/* فائدة زر Auto Sync: عرض الحالة الحالية */}
                    {isAuto && isActive && (
                        <div className="text-[9px] text-green-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Detecting: {systemPref}
                        </div>
                    )}
                </div>
            </div>
            
            {isActive && <IconCheck size={18} className="text-violet-500" />}
        </button>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 pb-32 overflow-y-auto custom-scrollbar font-sans">
      
      {/* Header with Glow */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              SYSTEM CONFIG
          </h2>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
              User: {user?.email}
          </p>
      </motion.div>

      <div className="space-y-8">
          
          {/* Performance Section */}
          <section>
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[var(--text-main)] uppercase tracking-widest">
                  <IconCpu size={18} className="text-[var(--accent-secondary)]" /> 
                  Graphics & Speed
              </div>
              <div className="glass-panel p-2 rounded-2xl grid grid-cols-3 gap-2">
                  <QualityButton value="low" label="ECO MODE" sub="Max Speed / No Effects" />
                  <QualityButton value="medium" label="BALANCED" sub="Standard Experience" />
                  <QualityButton value="high" label="ULTRA" sub="Full Immersion" />
              </div>
          </section>

          {/* Interface Section */}
          <section>
              <div className="flex items-center gap-2 mb-4 text-sm font-bold text-[var(--text-main)] uppercase tracking-widest">
                  <IconDeviceDesktop size={18} className="text-violet-500" /> 
                  Interface Theme
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ThemeButton value="dark" icon={IconMoon} label="Cyber Dark" />
                  <ThemeButton value="light" icon={IconSun} label="Pro Light" />
                  
                  {/* هذا الزر الآن يوضح أنه يعمل */}
                  <ThemeButton value="system" icon={IconDeviceDesktop} label="Auto Sync" />
              </div>
          </section>

          {/* Danger Zone */}
          <section className="pt-6">
              <button 
                onClick={logout} 
                className="w-full py-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all btn-shine flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
              >
                  <IconLogout size={18} /> Terminate Session
              </button>
          </section>

      </div>
    </div>
  );
}