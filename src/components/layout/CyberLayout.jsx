"use client";
import React from 'react';
import { CosmicBackground } from '../ui/CosmicBackground';
import { CyberHUD } from '../ui/CyberHUD';
import DigitalRain from '../ui/DigitalRain';

// استخدام React.memo لمنع إعادة الريندر للخلفية عند تغيير محتوى الصفحة
const StaticBackground = React.memo(() => (
  <>
    <CosmicBackground />
    <DigitalRain />
    <CyberHUD />
  </>
));

StaticBackground.displayName = "StaticBackground";

export default function CyberLayout({ children }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans text-white selection:bg-indigo-500/30">
      {/* طبقة الخلفية الثابتة */}
      <StaticBackground />

      {/* طبقة المحتوى */}
      <main className="relative z-10 w-full h-full flex flex-col">
          {children}
      </main>
    </div>
  );
}