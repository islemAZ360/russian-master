"use client";
import React from 'react';
import { CosmicBackground } from '../ui/CosmicBackground';

export default function CyberLayout({ children }) {
  return (
    <div className="relative h-screen w-full overflow-hidden font-sans text-[var(--text-main)] bg-transparent">
      
      {/* الخلفية التفاعلية الجديدة (DarkVeil) */}
      <CosmicBackground />
      
      {/* 
         المحتوى الرئيسي:
         - z-10: ليكون فوق الخلفية
         - pt-20 / md:pt-24: مسافة علوية لتجنب التصاق المحتوى (مخصصة للهاتف والحاسوب)
         - pb-32: مسافة سفلية كبيرة في الهاتف لتجنب تغطية المحتوى بواسطة شريط التنقل السفلي
         - md:pb-10: مسافة سفلية عادية للحاسوب
         - overflow-y-auto: للسماح بالتمرير داخل الصفحة
      */}
      <main className="relative z-10 w-full h-full flex flex-col pt-20 md:pt-24 pb-32 md:pb-10 px-3 md:px-6 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
            {children}
          </div>
      </main>
    </div>
  );
}