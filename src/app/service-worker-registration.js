"use client";

export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          // التحقق من وجود تحديثات كل 10 دقائق
          setInterval(() => { reg.update(); }, 1000 * 60 * 10);

          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // تفعيل التحديث فوراً
                if (confirm("New neural patch detected. Reboot system now?")) {
                  window.location.reload();
                }
              }
            };
          };
        });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        window.location.reload();
        refreshing = true;
      }
    });
  }
};