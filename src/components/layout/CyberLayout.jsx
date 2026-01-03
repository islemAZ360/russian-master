"use client";
import React from 'react';
import { CosmicBackground } from '../ui/CosmicBackground';

export default function CyberLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-[var(--text-main)]">
      
      {/* الخلفية الملونة الثابتة */}
      <CosmicBackground />
      
      {/* تم حذف CyberHUD (نظام الكاميرا) من هنا نهائياً */}

      {/* 
         المحتوى الرئيسي:
         pt-28: مسافة علوية كافية (112px) لتجنب التصاق المحتوى بالأعلى
         pb-24: مسافة سفلية للشريط السفلي
      */}
      <main className="relative z-10 w-full h-full flex flex-col pt-28 pb-24 px-4 md:px-8 overflow-y-auto custom-scrollbar">
          {children}
      </main>
    </div>
  );
}