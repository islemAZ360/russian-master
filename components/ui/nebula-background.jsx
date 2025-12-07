"use client";
import React from "react";

export const NebulaBackground = ({ children }) => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#030014] overflow-hidden">
      
      {/* 1. GPU Optimized Grid (Fast) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay z-[1]"></div>
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      {/* 2. Light Sources (Static CSS is faster than JS animations) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};