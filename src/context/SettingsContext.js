"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  sound: true,
  sfx: true,
  theme: 'dark', // dark, light, system
  language: 'ar',
};

const STORAGE_KEY = 'russian_master_config_v3';

export const SettingsProvider = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isDark, setIsDark] = useState(true);

  const applySettings = (newSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    let themeToApply = newSettings.theme;
    
    if (themeToApply === 'system') {
      themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    setIsDark(themeToApply === 'dark');
    
    if (themeToApply === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // تنظيف الإعدادات القديمة (مثل quality)
        const cleanSettings = {
            sound: parsed.sound ?? true,
            sfx: parsed.sfx ?? true,
            theme: parsed.theme || 'dark',
            language: 'ar'
        };
        setSettings(cleanSettings);
        applySettings(cleanSettings);
      } catch(e) { applySettings(DEFAULT_SETTINGS); }
    } else {
      applySettings(DEFAULT_SETTINGS);
    }
  }, []);

  const updateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isDark, mounted }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};