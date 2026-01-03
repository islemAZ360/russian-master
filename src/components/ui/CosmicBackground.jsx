"use client";
import React from "react";
import DarkVeil from "./DarkVeil";

export const CosmicBackground = React.memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-black transition-colors duration-700">
      {/* 
        حاوية DarkVeil
        تغطي الشاشة بالكامل وتعمل كخلفية
      */}
      <div className="darkveil-container">
        <DarkVeil 
            speed={0.2}         // سرعة هادئة
            hueShift={45}       // تدرج لوني أزرق/بنفسجي
            warpAmount={0.3}    // تموج خفيف
            noiseIntensity={0.03}
        />
      </div>
      
      {/* طبقة إضافية خفيفة جداً لتحسين تباين النصوص (اختياري) */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
    </div>
  );
});

CosmicBackground.displayName = "CosmicBackground";