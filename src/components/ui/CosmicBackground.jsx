"use client";
import React from "react";

export const CosmicBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-[#050505]">
      {/* 1. السديم الثابت (صورة خفيفة) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      
      {/* 2. الدوامة البنفسجية - بدون Blend Mode */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] opacity-20 animate-spin-slow-reverse will-change-transform transform-gpu">
        <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,#7000ff_40deg,transparent_180deg)] blur-[60px] rounded-full"></div>
      </div>

      {/* 3. الدوامة السماوية - بدون Blend Mode */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] opacity-20 animate-spin-slow will-change-transform transform-gpu">
        <div className="w-full h-full bg-[conic-gradient(from_180deg,transparent_0deg,#00f2ff_40deg,transparent_180deg)] blur-[50px] rounded-full"></div>
      </div>

      {/* 4. القلب الأسود (للعمق) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-[#050505] rounded-full blur-[40px] z-0"></div>

      {/* 5. الشبكة (بسيطة جداً) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>

      {/* 6. نجوم بسيطة CSS */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
      <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-75"></div>
      <div className="absolute top-1/3 left-3/4 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-150"></div>

      <style jsx>{`
        .animate-spin-slow { 
            animation: spin 80s linear infinite; 
            will-change: transform;
        }
        .animate-spin-slow-reverse { 
            animation: spin 60s linear infinite reverse; 
            will-change: transform;
        }
        
        @keyframes spin { 
            from { transform: translate(-50%, -50%) rotate(0deg); } 
            to { transform: translate(-50%, -50%) rotate(360deg); } 
        }
      `}</style>
    </div>
  );
};