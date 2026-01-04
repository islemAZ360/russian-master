"use client";
import { useMemo, useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";
import { translations } from "@/data/translations";

/**
 * هوك احترافي لإدارة اللغات والترجمة داخل النظام
 * تم تصميمه ليكون المحرك الوحيد والمسؤول عن عرض النصوص بناءً على إعدادات المستخدم
 */
export const useLanguage = () => {
  const { settings, mounted } = useSettings();

  // 1. تحديد الكود الخاص باللغة الحالية
  // ننتظر حتى يتم تحميل المكون (mounted) لضمان قراءة الإعدادات من LocalStorage
  const lang = useMemo(() => {
    if (!mounted || !settings?.systemLanguage) return 'ar';
    return settings.systemLanguage;
  }, [mounted, settings?.systemLanguage]);

  /**
   * 2. دالة الترجمة المركزية t(key)
   * تبحث في القاموس المختار، وإذا لم تجد المفتاح تبحث في الإنجليزية كبديل (Fallback)
   */
  const t = useCallback((key) => {
    if (!key) return "";

    // جلب القاموس الخاص باللغة الحالية (ru, ar, en)
    const dictionary = translations[lang] || translations['ar'];

    if (dictionary[key]) {
      return dictionary[key];
    }

    // إذا لم يتوفر المفتاح في اللغة المختارة، نبحث عنه في الإنجليزية لضمان عدم ظهور "undefined"
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }

    // الخيار الأخير: إعادة المفتاح نفسه إذا كان مفقوداً تماماً من كل القواميس
    return key;
  }, [lang]);

  /**
   * 3. خصائص واجهة المستخدم (UI Properties)
   * dir: اتجاه النص (rtl للعربية، ltr للباقي)
   * isRTL: قيمة منطقية للتحقق السريع
   */
  const dir = useMemo(() => (lang === 'ar' ? 'rtl' : 'ltr'), [lang]);
  const isRTL = useMemo(() => lang === 'ar', [lang]);

  return { 
    t, 
    dir, 
    isRTL, 
    lang,
    isLoaded: mounted // تتيح للمكونات معرفة ما إذا كانت الإعدادات قد تم تحميلها فعلياً
  };
};