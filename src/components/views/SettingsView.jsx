"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext'; 
import { 
  IconCpu, IconMoon, IconSun, IconDeviceDesktop, 
  IconLogout, IconCheck
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

export default function SettingsView() {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  
  // مكون الزر الخاص بالجودة
  const QualityButton = ({ value, label, sub }) => {
    const isActive = settings.quality === value;
    return (
      <button 
        onClick={() => updateSettings('quality', value)}
        className={`relative w-full p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1
        ${isActive 
            ? "bg-purple-600/80 border-purple-400 text-white shadow-[0_0_25px_rgba(147,51,234,0.3)]" 
            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"}`}
      >
        <span className="font-bold tracking-widest text-xs uppercase">{label}</span>
        <span className="text-[9px] opacity-70">{sub}</span>
      </button>
    );
  };

  // مكون الزر الخاص بالثيم
  const ThemeButton = ({ value, icon: Icon, label }) => {
    const isActive = settings.theme === value;
    return (
        <button
            onClick={() => updateSettings('theme', value)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group
            ${isActive 
                ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? "text-purple-400" : "text-gray-500 group-hover:text-white"} />
                <span className="text-sm font-bold">{label}</span>
            </div>
            {isActive && <IconCheck size={18} className="text-purple-400" />}
        </button>
    );
  };

  return (
    // هام: bg-transparent هنا يحل مشكلة الشاشة المقسومة
    <div className="w-full max-w-4xl mx-auto p-6 pb-32 overflow-y-auto custom-scrollbar font-sans bg-transparent">
      
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-10 text-center md:text-left">
          <h2 className="text-4xl font-black italic tracking-tighter text-white drop-shadow-lg mb-2">
              SYSTEM CONFIG
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
                User: {user?.email?.split('@')[0]}
            </p>
          </div>
      </motion.div>

      {/* الحاوية الرئيسية شفافة مع Blur خفيف */}
      <div className="space-y-8 backdrop-blur-md bg-black/30 p-8 rounded-[2rem] border border-white/5 shadow-2xl">
          
          {/* قسم الجرافيكس */}
          <section>
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">
                  <IconCpu size={16} /> Graphics & Performance
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <QualityButton value="low" label="ECO MODE" sub="Max Speed" />
                  <QualityButton value="medium" label="BALANCED" sub="Standard" />
                  <QualityButton value="high" label="ULTRA" sub="High Visuals" />
              </div>
          </section>

          {/* خط فاصل */}
          <div className="h-px w-full bg-white/5"></div>

          {/* قسم الثيم */}
          <section>
              <div className="flex items-center gap-2 mb-4 text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">
                  <IconDeviceDesktop size={16} /> Interface Style
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ThemeButton value="dark" icon={IconMoon} label="Cyber Dark" />
                  <ThemeButton value="light" icon={IconSun} label="Pro Light" />
                  <ThemeButton value="system" icon={IconDeviceDesktop} label="Auto Sync" />
              </div>
          </section>

          {/* خط فاصل */}
          <div className="h-px w-full bg-white/5"></div>

          {/* تسجيل الخروج */}
          <section className="pt-2">
              <button 
                onClick={logout} 
                className="w-full py-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider group"
              >
                  <IconLogout size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                  Terminate Session
              </button>
          </section>

      </div>
    </div>
  );
}