"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // الإعدادات الافتراضية
  const [settings, setSettings] = useState({
    soundEffects: true, // تفعيل المؤثرات الصوتية
    speech: true,       // تفعيل نطق الكلمات
    visualEffects: true, // تفعيل الجرافيك العالي
    difficulty: 'normal', // مستوى الصعوبة
  });

  // تحميل الإعدادات المحفوظة عند فتح الموقع
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('russian_master_config');
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {
          console.error("Error parsing settings", e);
        }
      }
    }
  }, []);

  // دالة لتحديث الإعدادات وحفظها
  const updateSettings = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem('russian_master_config', JSON.stringify(newSettings));
      }
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook لاستخدام الإعدادات في أي مكان
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};