"use client";
import { useMemo, useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";
import { translations } from "@/data/translations";

/**
 * هوك احترافي لإدارة اللغات والترجمة داخل النظام
 * يضمن عدم انهيار الواجهة في حال فقدان أي مفتاح ترجمة
 */
export const useLanguage = () => {
  const { settings, mounted } = useSettings();

  // تحديد اللغة الحالية: ننتظر التحميل (mounted) أولاً، ونستخدم 'ar' كقيمة افتراضية صلبة
  const lang = useMemo(() => {
    if (!mounted || !settings?.systemLanguage) return 'ar';
    return settings.systemLanguage;
  }, [mounted, settings?.systemLanguage]);

  /**
   * دالة الترجمة t(key)
   * تبحث في اللغة المختارة، ثم الإنجليزية كبديل، ثم العربية، ثم تعيد المفتاح نفسه
   */
  const t = useCallback((key) => {
    if (!key) return "";

    // 1. محاولة جلب النص باللغة الحالية (روسي، عربي، إنجليزي)
    const currentDict = translations[lang];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }

    // 2. إذا لم يتوفر، المحاولة بالإنجليزية (لغة تقنية احتياطية)
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }

    // 3. إذا لم يتوفر، المحاولة بالعربية
    if (translations['ar'] && translations['ar'][key]) {
      return translations['ar'][key];
    }

    // 4. الخيار الأخير: إعادة المفتاح نفسه لكي يلاحظ المبرمج وجود نقص
    return key;
  }, [lang]);

  // خصائص واجهة المستخدم بناءً على اللغة
  const dir = useMemo(() => (lang === 'ar' ? 'rtl' : 'ltr'), [lang]);
  const isRTL = useMemo(() => lang === 'ar', [lang]);

  return { 
    t, 
    dir, 
    isRTL, 
    lang,
    isLoaded: mounted // لمعرفة ما إذا كان النظام جاهزاً لعرض النصوص الصحيحة
  };
};