"use client";
import React from 'react';
import { CosmicBackground } from '../ui/CosmicBackground';

export default function CyberLayout({ children }) {
  return (
    <div className="relative h-screen w-full overflow-hidden font-sans text-[var(--text-main)] bg-transparent">
      
      {/* الخلفية الثابتة */}
      <CosmicBackground />
      
      {/* 
         المحتوى الرئيسي:
         - h-full: يملأ الشاشة
         - pt-20: (80px) مسافة علوية مناسبة (ليست كبيرة جداً)
         - pb-24: مسافة سفلية للشريط العائم
         - overflow-y-auto: هذا هو المسؤول عن تفعيل السكرول في الصفحات الطويلة مثل Archive و ID
      */}
      <main className="relative z-10 w-full h-full flex flex-col pt-20 pb-24 px-4 md:px-6 overflow-y-auto custom-scrollbar scroll-smooth">
          <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
            {children}
          </div>
      </main>
    </div>
  );
}