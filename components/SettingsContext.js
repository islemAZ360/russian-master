"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // الإعدادات الافتراضية
  const [settings, setSettings] = useState({
    soundEffects: true, // أصوات اللعب
    speech: true,       // نطق الكلمات
    visualEffects: true, // المطر الرقمي والخلفيات
    difficulty: 'normal', // easy, normal, hard
    username: 'Operative'
  });

  // تحميل الإعدادات عند البدء
  useEffect(() => {
    const saved = localStorage.getItem('russian_master_config');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // حفظ الإعدادات عند التغيير
  const updateSettings = (key, value) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('russian_master_config', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);