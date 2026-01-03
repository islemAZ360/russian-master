/* Filename: components/ui/GridBackground.jsx */
"use client";
import React from "react";
import { useSettings } from "../../context/SettingsContext";

export const GridBackground = React.memo(() => {
  const { isDark, settings } = useSettings();
  const quality = settings.quality;

  // وضع الجودة المنخفضة: خلفية سادة (أقصى سرعة)
  if (quality === 'low') {
    return (
      <div 
        className="fixed inset-0 z-[-1] w-full h-full transition-colors duration-500" 
        style={{ background: 'var(--bg-main)' }} 
      />
    );
  }

  // وضع الجودة المتوسطة/العالية: الأورورا الملونة
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-1000 bg-[var(--bg-main)]">
      
      {/* 1. Blob 1: البنفسجي / الأزرق */}
      <div 
        className="aurora-blob w-[60vw] h-[60vw] top-[-10%] left-[-10%]"
        style={{ background: isDark ? '#4c1d95' : '#bfdbfe' }} 
      />

      {/* 2. Blob 2: السماوي / الوردي (يتحرك عكسياً) */}
      <div 
        className="aurora-blob w-[50vw] h-[50vw] bottom-[-10%] right-[-10%]"
        style={{ 
            background: isDark ? '#0891b2' : '#fbcfe8',
            animationDirection: 'reverse',
            animationDelay: '2s'
        }} 
      />

      {/* 3. Blob 3: إضاءة في المنتصف (أقل وضوحاً) */}
      <div 
        className="aurora-blob w-[40vw] h-[40vw] top-[30%] left-[30%]"
        style={{ 
            background: isDark ? 'rgba(124, 58, 237, 0.4)' : 'rgba(167, 139, 250, 0.4)',
            filter: 'blur(100px)',
            animationDuration: '30s'
        }} 
      />

      {/* طبقة الشبكة الرقمية الخفيفة */}
      <div 
        className="absolute inset-0 z-[1] opacity-[0.05] pointer-events-none"
        style={{
            backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '70px 70px'
        }}
      />
      
      {/* طبقة Noise لإخفاء عيوب التدرج وإعطاء ملمس سينمائي */}
      {quality === 'high' && (
        <div className="absolute inset-0 z-[2] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      )}

    </div>
  );
});

GridBackground.displayName = 'GridBackground';