"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export const SettingsContext = createContext(null);

// الإعدادات الافتراضية للنظام
const DEFAULT_SETTINGS = {
  sound: true,
  sfx: true,
  theme: 'dark',           // dark, light, system
  systemLanguage: 'ar',    // ar, en, ru
  cardLanguage: 'ar',      // لغة الترجمة (مستقبلاً)
  quality: 'high'          // جودة التأثيرات البصرية
};

const STORAGE_KEY = 'russian_master_config_v4'; // المفتاح الموحد للإصدار الرابع

export const SettingsProvider = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isDark, setIsDark] = useState(true);

  /**
   * دالة تطبيق الإعدادات على وسم الـ HTML
   * هذه الدالة هي المسؤولة عن قلب اتجاه الموقع وتغيير اللغة الروسية
   */
  const applySystemSettings = (config) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const currentLang = config.systemLanguage || 'ar';
    const currentTheme = config.theme || 'dark';

    // 1. تطبيق اللغة والاتجاه (حل مشكلة بقاء العربية)
    root.setAttribute('lang', currentLang);
    const direction = currentLang === 'ar' ? 'rtl' : 'ltr';
    root.setAttribute('dir', direction);
    
    // 2. تطبيق النمط البصري (ثيم)
    let themeToApply = currentTheme;
    if (currentTheme === 'system') {
      themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    setIsDark(themeToApply === 'dark');
    root.setAttribute('data-theme', themeToApply);
    
    if (themeToApply === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  };

  // تحميل الإعدادات عند بداية التشغيل
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const mergedSettings = { ...DEFAULT_SETTINGS, ...parsed };
        setSettings(mergedSettings);
        applySystemSettings(mergedSettings);
      } catch (e) {
        console.error("Settings Recovery Failed:", e);
        applySystemSettings(DEFAULT_SETTINGS);
      }
    } else {
      applySystemSettings(DEFAULT_SETTINGS);
    }
    setMounted(true);
  }, []);

  /**
   * وظيفة تحديث الإعدادات وحفظها
   */
  const updateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // حفظ في التخزين المحلي
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    
    // تطبيق التغييرات فوراً على واجهة المتصفح
    applySystemSettings(newSettings);
  };

  const value = {
    settings,
    updateSettings,
    isDark,
    mounted
  };

  return (
    <SettingsContext.Provider value={value}>
      {/* نستخدم الـ Opacity لمنع وميض المحتوى قبل تحميل الإعدادات */}
      <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};