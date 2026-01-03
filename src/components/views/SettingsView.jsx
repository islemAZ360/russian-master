"use client";
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext'; 
import { 
  IconMoon, IconSun, IconDeviceDesktop, 
  IconLogout, IconCheck, IconPalette, IconUserCircle
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  
  // مكون الزر الخاص بالثيم
  const ThemeButton = ({ value, icon: Icon, label }) => {
    const isActive = settings.theme === value;
    return (
        <button
            onClick={() => updateSettings('theme', value)}
            className={`floating-card flex items-center justify-between p-5 rounded-2xl w-full group
            ${isActive ? 'border-[var(--accent-color)] ring-1 ring-[var(--accent-color)]' : ''}`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-[var(--accent-color)] text-white' : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)]'}`}>
                    <Icon size={24} />
                </div>
                <span className={`text-base font-bold ${isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>{label}</span>
            </div>
            {isActive && <IconCheck size={20} className="text-[var(--accent-color)]" />}
        </button>
    );
  };

  return (
    // استخدام bg-transparent وإزالة أي خلفيات للحاوية
    <div className="w-full max-w-2xl mx-auto p-6 pb-40 font-sans bg-transparent">
      
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12 text-center">
          <h2 className="text-5xl font-black italic tracking-tighter text-[var(--text-main)] drop-shadow-sm mb-2">
              SYSTEM CONFIG
          </h2>
      </motion.div>

      <div className="space-y-10">
          
          {/* User Profile Section (Floating Card) */}
          <section className="floating-card p-6 rounded-3xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <IconUserCircle size={32} />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-[var(--text-main)]">Operative ID</h3>
                  <p className="text-sm font-mono text-[var(--text-muted)]">{user?.email}</p>
              </div>
          </section>

          {/* Theme Section - Floating Buttons Direct on Background */}
          <section>
              <div className="flex items-center gap-2 mb-6 px-2 text-sm font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                  <IconPalette size={18} /> Interface Appearance
              </div>
              <div className="flex flex-col gap-4">
                  <ThemeButton value="dark" icon={IconMoon} label="Cyber Dark" />
                  <ThemeButton value="light" icon={IconSun} label="Pro Light" />
                  <ThemeButton value="system" icon={IconDeviceDesktop} label="Auto Sync" />
              </div>
          </section>

          {/* Logout Button */}
          <section className="pt-8">
              <button 
                onClick={logout} 
                className="w-full py-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-wider group shadow-lg hover:shadow-red-500/20"
              >
                  <IconLogout size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                  Terminate Session
              </button>
          </section>

      </div>
    </div>
  );
}