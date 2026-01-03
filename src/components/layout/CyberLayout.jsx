"use client";
import React from 'react';
import { CosmicBackground } from '../ui/CosmicBackground';
import { CyberHUD } from '../ui/CyberHUD';

export default function CyberLayout({ children }) {
  return (
    // إزالة خلفيات التحديد وإضافة h-screen ثابت
    <div className="relative h-screen w-full overflow-hidden font-sans bg-transparent">
      
      {/* الخلفية الكونية المتغيرة */}
      <CosmicBackground />
      
      {/* طبقة واجهة المستخدم (اختيارية، يمكن إزالتها إذا أردت نظافة أكثر) */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <CyberHUD />
      </div>

      {/* المحتوى الرئيسي: 
          - h-full: يملأ الشاشة
          - pt-24: بادينغ علوي ثابت لمنع التصاق المحتوى بالأعلى
          - overflow-y-auto: يسمح بالسكرول داخل هذا العنصر فقط
      */}
      <main className="relative z-10 w-full h-full flex flex-col pt-24 pb-6 overflow-y-auto custom-scrollbar">
          {children}
      </main>
    </div>
  );
}