"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  sound: true,
  sfx: true,
  quality: 'high',
  theme: 'system',
  language: 'ar',
};

const STORAGE_KEY = 'russian_master_config_v2';

export const SettingsProvider = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isDark, setIsDark] = useState(true);

  const applySettings = (newSettings) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    let theme = newSettings.theme;
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    setIsDark(theme === 'dark');
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('light');
      root.classList.add('dark');
    }

    body.classList.remove('quality-low', 'quality-medium', 'quality-high');
    body.classList.add(`quality-${newSettings.quality}`);
  };

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applySettings(parsed);
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

// تعريف الـ Hook هنا
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};