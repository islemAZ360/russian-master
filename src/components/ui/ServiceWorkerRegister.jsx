"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      
      // تغيير رقم الإصدار هنا يجبر النظام على تنظيف الكاش وتحميل التعديلات الجديدة
      // هذا ضروري جداً بعد التعديلات الكبيرة التي قمنا بها
      const CURRENT_VERSION = 'v5.6.5-TEACHER-FIX'; 

      const cleanup = async () => {
        try {
          // 1. إلغاء تسجيل أي Service Workers قديمة لمنع المشاكل
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for(let registration of registrations) {
              await registration.unregister();
              console.log('Old Service Worker Unregistered.');
            }
          }

          // 2. تنظيف مخزن الكاش (Cache Storage) لضمان تحميل الملفات الجديدة
          if ('caches' in window) {
            const storedVersion = localStorage.getItem('sw_cache_version');
            
            // إذا كان الإصدار مختلفاً (أو غير موجود)، قم بمسح كل شيء
            if (storedVersion !== CURRENT_VERSION) {
                const keys = await caches.keys();
                await Promise.all(
                    keys.map(key => caches.delete(key))
                );
                console.log('System Caches Purged for Update.');
                
                // تحديث الإصدار في التخزين المحلي
                localStorage.setItem('sw_cache_version', CURRENT_VERSION);
                
                // إعادة تحميل الصفحة لمرة واحدة فقط لتطبيق التحديث
                // نستخدم sessionStorage لمنع الدخول في حلقة إعادة تحميل لا نهائية
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