"use client";
import React from 'react';
import { CosmicBackground } from '../ui/CosmicBackground';
import { CyberHUD } from '../ui/CyberHUD';

export default function CyberLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-white bg-transparent">
      
      {/* الخلفية الثابتة الخفيفة */}
      <CosmicBackground />
      
      {/* عناصر التجميل (اختياري) */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <CyberHUD />
      </div>

      {/* المحتوى */}
      {/* تم تقليل البادينغ العلوي ليكون طبيعياً */}
      <main className="relative z-10 w-full h-full flex flex-col pt-4 pb-6 overflow-y-auto custom-scrollbar">
          {children}
      </main>
    </div>
  );
}