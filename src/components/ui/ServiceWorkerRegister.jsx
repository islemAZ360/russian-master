"use client";
import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. محاولة إلغاء تسجيل أي Service Worker قديم يسبب المشاكل
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }

      // 2. تنظيف كاش المتصفح العنيف
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }
    }
  }, []);

  return null;
}