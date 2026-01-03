"use client";
import React from "react";

export const CosmicBackground = React.memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] bg-[#030014]">
      {/* 1. تدرج لوني ثابت وعميق (بدون أنيميشن لقتل اللاق تماماً) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: `
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 100%, hsla(240, 50%, 15%, 1) 0, transparent 50%),
            radial-gradient(at 0% 100%, hsla(280, 50%, 15%, 1) 0, transparent 50%),
            linear-gradient(to bottom, transparent, #030014)
          `
        }}
      />

      {/* 2. طبقة نويز خفيفة جداً للملمس */}
      <div className="absolute inset-0 w-full h-full opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
      
      {/* 3. شبكة خفيفة جداً */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
    </div>
  );
});

CosmicBackground.displayName = "CosmicBackground";