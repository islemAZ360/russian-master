"use client";
import React from "react";

export const CosmicBackground = React.memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden transition-colors duration-700 bg-[var(--bg-primary)]">
      
      {/* 1. Orb 1: كرة لونية كبيرة في الزاوية العلوية اليسرى (تتحرك ببطء) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"
        style={{ backgroundColor: 'var(--orb-1)', animationDelay: '0s' }}
      />
      
      {/* 2. Orb 2: كرة لونية في الزاوية السفلية اليمنى */}
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"
        style={{ backgroundColor: 'var(--orb-2)', animationDelay: '2s' }}
      />

      {/* 3. Orb 3: كرة مركزية لإعطاء عمق */}
      <div 
        className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-blob"
        style={{ backgroundColor: 'var(--orb-3)', animationDelay: '4s' }}
      />

      {/* 4. شبكة خفيفة جداً لإعطاء ملمس تقني (Grid) */}
      <div 
        className="absolute inset-0 z-[1]" 
        style={{ 
            backgroundImage: `linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px)`, 
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />

      {/* 5. طبقة Noise خفيفة جداً لمنع التكسر اللوني */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none z-[2]"></div>
      
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 20s infinite alternate;
        }
      `}</style>
    </div>
  );
});

CosmicBackground.displayName = "CosmicBackground";