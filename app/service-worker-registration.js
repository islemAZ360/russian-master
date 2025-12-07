"use client";

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registered: ', registration);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
};

export const checkNetworkStatus = () => {
  return navigator.onLine;
};

export const syncOfflineData = async () => {
  // مزامنة البيانات المحفوظة محلياً عند العودة للاتصال
  const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
  
  for (const action of offlineActions) {
    try {
      // تنفيذ الإجراءات المؤجلة
      await fetch(action.url, action.options);
    } catch (error) {
      console.error('Failed to sync action:', error);
    }
  }
  
  localStorage.removeItem('offlineActions');
};