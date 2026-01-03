"use client";
import React from "react";

// استخدام React.memo يمنع إعادة الرسم غير الضرورية
export const CosmicBackground = React.memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] bg-[#030014]">
      {/* 1. التدرج اللوني العميق (Deep Mesh Gradient) */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: `
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%),
            radial-gradient(at 100% 100%, hsla(240, 50%, 15%, 1) 0, transparent 50%),
            radial-gradient(at 0% 100%, hsla(280, 50%, 15%, 1) 0, transparent 50%)
          `
        }}
      />

      {/* 2. بقعة ضوء مركزية ناعمة جداً لإعطاء عمق */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[radial-gradient(circle,rgba(124,58,237,0.15)_0%,transparent_70%)] blur-[100px] pointer-events-none" />

      {/* 3. طبقة Noise خفيفة جداً لمنع تكسر الألوان وإعطاء ملمس احترافي */}
      <div className="absolute inset-0 w-full h-full opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
      
      {/* 4. شبكة خفيفة (اختياري) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none"></div>
    </div>
  );
});

CosmicBackground.displayName = "CosmicBackground";