"use client";
import React from "react";
import { motion } from "framer-motion";

// 1. ثيم الألعاب (Synthwave / Retro Arcade)
export const GamesTheme = ({ children }) => (
  <div className="relative w-full h-full bg-[#1a0b2e] overflow-hidden text-fuchsia-200 selection:bg-fuchsia-500/30">
    {/* شبكة أرضية متحركة */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(24,0,32,0.9),rgba(24,0,32,0.9)),url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-fuchsia-900/40 to-transparent z-0 pointer-events-none"></div>
    
    {/* Grid Floor Effect */}
    <div className="absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,transparent,black)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ff00ff20_1px,transparent_1px),linear-gradient(to_bottom,#ff00ff20_1px,transparent_1px)] bg-[size:4rem_4rem] [transform:perspective(500px)_rotateX(60deg)_translateY(-100px)_translateZ(-200px)] h-[200vh]"></div>
    </div>

    {/* Sun */}
    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-t from-yellow-400 to-fuchsia-600 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

    <div className="relative z-10 w-full h-full">{children}</div>
  </div>
);

// 2. ثيم الدراسة (Deep Focus / Zen Tech)
export const StudyTheme = ({ children }) => (
  <div className="relative w-full h-full bg-[#020617] overflow-hidden text-cyan-100 selection:bg-cyan-500/30">
    {/* جزيئات هادئة */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0f172a,transparent)] z-0"></div>
    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
    
    {/* إضاءة محيطة */}
    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[120px]"></div>
    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>

    <div className="relative z-10 w-full h-full">{children}</div>
  </div>
);

// 3. ثيم الأدمن (Black Ops / Command Terminal)
export const AdminTheme = ({ children }) => (
  <div className="relative w-full h-full bg-black font-mono text-green-500 selection:bg-green-500 selection:text-black overflow-hidden">
    {/* خطوط المسح (Scanlines) */}
    <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
    
    {/* Grid خفيفة جداً */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff0010_1px,transparent_1px),linear-gradient(to_bottom,#00ff0010_1px,transparent_1px)] bg-[size:20px_20px] opacity-10"></div>

    <div className="relative z-10 w-full h-full">{children}</div>
  </div>
);

// 4. ثيم البيانات (Archive / Library)
export const DataTheme = ({ children }) => (
  <div className="relative w-full h-full bg-[#1c1917] overflow-hidden text-orange-100 selection:bg-orange-500/30">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
    <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
    <div className="relative z-10 w-full h-full">{children}</div>
  </div>
);

// 5. الثيم الافتراضي (Nexus Base)
export const DefaultTheme = ({ children }) => (
    <div className="relative w-full h-full bg-[#050505] text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 pointer-events-none z-0"></div>
        <div className="relative z-10 w-full h-full">{children}</div>
    </div>
);