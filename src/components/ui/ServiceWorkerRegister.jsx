"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      
      const CURRENT_VERSION = 'v5.2.2-force-clean'; // تغيير هذا الرقم يجبر النظام على التنظيف

      const cleanup = async () => {
        try {
          // 1. إلغاء تسجيل أي Service Workers نشطة قد تسبب المشكلة
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for(let registration of registrations) {
              await registration.unregister();
              console.log('Service Worker Unregistered to fix cache issues.');
            }
          }

          // 2. تنظيف مخزن الكاش (Cache Storage)
          if ('caches' in window) {
            const storedVersion = localStorage.getItem('sw_cache_version');
            
            // إذا كان الإصدار مختلفاً أو غير موجود، قم بمسح كل شيء
            if (storedVersion !== CURRENT_VERSION) {
                const keys = await caches.keys();
                await Promise.all(
                    keys.map(key => caches.delete(key))
                );
                console.log('System Caches Purged Successfully.');
                
                // تحديث الإصدار لمنع المسح في المرات القادمة (للحفاظ على الأداء)
                localStorage.setItem('sw_cache_version', CURRENT_VERSION);
                
                // إعادة تحميل الصفحة لمرة واحدة لضمان جلب الملفات الجديدة
                if (sessionStorage.getItem('reloaded_for_update') !== 'true') {
                    sessionStorage.setItem('reloaded_for_update', 'true');
                    window.location.reload();
                }
            }
          }
        } catch (error) {
          console.error("Cleanup Failed:", error);
        }
      };

      cleanup();
    }
  }, []);

  return null;
}