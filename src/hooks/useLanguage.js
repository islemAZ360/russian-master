// src/hooks/useLanguage.js
"use client";
import { useSettings } from "@/context/SettingsContext";
import { translations } from "@/data/translations";

export const useLanguage = () => {
  const { settings } = useSettings();
  const lang = settings.systemLanguage || 'ar'; // اللغة الافتراضية
  
  // دالة الترجمة
  const t = (key) => {
    return translations[lang][key] || key;
  };

  // اتجاه النص (عربي = يمين، الباقي = يسار)
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = lang === 'ar';

  return { t, dir, isRTL, lang };
};