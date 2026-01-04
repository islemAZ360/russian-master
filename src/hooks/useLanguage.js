"use client";
import { useSettings } from "@/context/SettingsContext";
import { translations } from "@/data/translations";

export const useLanguage = () => {
  const { settings, mounted } = useSettings();
  
  // حل مشكلة الانهيار: نستخدم اللغة من الإعدادات أو "العربية" كقيمة افتراضية صلبة
  const lang = (mounted && settings?.systemLanguage) ? settings.systemLanguage : 'ar';
  
  const t = (key) => {
    // التأكد من أن القاموس موجود للغة المحددة، وإلا العودة للعربية
    const dictionary = translations[lang] || translations['ar'];
    
    // إذا لم يجد المفتاح، يعيد المفتاح نفسه بدلاً من undefined
    if (!dictionary[key]) {
      // محاولة البحث في الإنجليزية كحل أخير قبل إظهار الكود
      return translations['en'][key] || key;
    }
    
    return dictionary[key];
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = lang === 'ar';

  return { t, dir, isRTL, lang };
};