"use client";
import React from "react";

export const CosmicBackground = React.memo(() => {
  return (
    <div className="fixed inset-0 w-full h-full z-[-1] overflow-hidden bg-[var(--bg-primary)] transition-colors duration-700">
      
      {/* 1. دائرة لونية علوية يسار */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-40 transition-colors duration-700"
        style={{ backgroundColor: 'var(--gradient-1)' }}
      />
      
      {/* 2. دائرة لونية سفلية يمين */}
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full blur-[120px] opacity-40 transition-colors duration-700"
        style={{ backgroundColor: 'var(--gradient-2)' }}
      />

      {/* 3. دائرة لونية وسطية */}
      <div 
        className="absolute top-[30%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-30 transition-colors duration-700"
        style={{ backgroundColor: 'var(--gradient-3)' }}
      />

      {/* 4. طبقة نويز خفيفة جداً للملمس */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none"></div>
    </div>
  );
});

CosmicBackground.displayName = "CosmicBackground";