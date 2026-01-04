"use client";
import { useSettings } from "@/context/SettingsContext";
import { translations } from "@/data/translations";

export const useLanguage = () => {
  const { settings } = useSettings();
  
  // صمام أمان: التأكد من وجود قيمة للغة، وإذا كانت غير موجودة في القاموس نستخدم 'ar'
  const lang = settings?.systemLanguage || 'ar';
  
  // الحصول على مجموعة الترجمة بأمان
  const translationSet = translations[lang] || translations['ar'] || {};

  // دالة الترجمة مع حماية ضد المفاتيح المفقودة
  const t = (key) => {
    if (!translationSet[key]) {
      // إذا كان المفتاح مفقوداً في اللغة الحالية، جربه في العربية، وإذا لم يوجد أرجع المفتاح نفسه
      return translations['ar'][key] || key;
    }
    return translationSet[key];
  };

  // اتجاه النص (عربي = يمين، الباقي = يسار)
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = lang === 'ar';

  return { t, dir, isRTL, lang };
};