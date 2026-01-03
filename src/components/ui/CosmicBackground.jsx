"use client";
import React, { memo } from "react";

// استخدام memo يمنع إعادة رسم الخلفية عند تغيير الصفحات مما يزيل اللاق
const CosmicBackground = memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-[#030014]">
      
      {/* 1. الطبقة الأساسية الملونة (تدرجات ناعمة ثابتة) */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      {/* 2. الألوان المتحركة (GPU Accelerated) */}
      {/* الدائرة البنفسجية */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/20 blur-[100px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      
      {/* الدائرة السماوية */}
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/20 blur-[100px] animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '1s' }}
      />

      {/* الدائرة الوردية (لإضافة حيوية) */}
      <div 
        className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full bg-pink-500/10 blur-[120px]"
      />

      {/* 3. طبقة الشبكة (Grid) خفيفة جداً للعمق */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:50px_50px]"
        style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)' }}
      />

      {/* 4. طبقة Noise خفيفة جداً لإعطاء ملمس سينمائي (اختياري للأجهزة القوية فقط، وضعنا opacity منخفض جداً للأداء) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
    </div>
  );
});

CosmicBackground.displayName = "CosmicBackground";
export { CosmicBackground };