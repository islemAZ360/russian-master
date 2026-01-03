"use client";
import React from 'react';
import { CosmicBackground } from '../ui/CosmicBackground';
import { CyberHUD } from '../ui/CyberHUD';

// قمنا بإزالة DigitalRain مؤقتاً للتأكد من القضاء على اللاق تماماً
// الخلفية هنا ثابتة ولا يعاد تحميلها
export default function CyberLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-white bg-transparent selection:bg-purple-500/30">
      
      {/* الخلفية توضع هنا مرة واحدة في أعلى الهرم */}
      <CosmicBackground />
      
      {/* واجهة المستخدم التجميلية */}
      <CyberHUD />

      {/* المحتوى الرئيسي */}
      <main className="relative z-10 w-full h-full flex flex-col">
          {children}
      </main>
    </div>
  );
}