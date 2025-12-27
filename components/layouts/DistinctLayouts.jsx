"use client";
import React from "react";
import { motion } from "framer-motion";
import { IconDeviceGamepad, IconDatabase, IconCpu } from "@tabler/icons-react";

// 1. THE HUB LAYOUT (للصفحة الرئيسية - تصميم مركز القيادة)
export const HubLayout = ({ children }) => (
  <div className="relative h-full w-full bg-black overflow-hidden flex flex-col items-center justify-center">
    {/* دوائر خلفية دوارة */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[800px] h-[800px] border border-cyan-500/20 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="w-[600px] h-[600px] border border-cyan-500/30 rounded-full absolute animate-[spin_40s_linear_infinite_reverse] border-dashed"></div>
    </div>
    {/* شبكة أرضية */}
    <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-cyan-900/20 to-transparent"></div>
    
    <div className="relative z-10 w-full h-full p-8 flex flex-col">
        {children}
    </div>
  </div>
);

// 2. ARCADE LAYOUT (للألعاب - تصميم ريترو نيون)
export const ArcadeLayout = ({ children }) => (
  <div className="relative h-full w-full bg-[#090014] overflow-hidden font-mono text-fuchsia-400">
    {/* Scanlines Effect */}
    <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]"></div>
    
    {/* Neon Grid Floor */}
    <div className="absolute bottom-0 left-0 w-full h-[60%] bg-[linear-gradient(transparent_0%,#2c003e_100%)]"></div>
    <div className="absolute inset-0 opacity-20" 
         style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255, 0, 255, .3) 25%, rgba(255, 0, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .3) 75%, rgba(255, 0, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 0, 255, .3) 25%, rgba(255, 0, 255, .3) 26%, transparent 27%, transparent 74%, rgba(255, 0, 255, .3) 75%, rgba(255, 0, 255, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px', transform: 'perspective(200px) rotateX(60deg) translateY(100px) scale(2)'}}>
    </div>

    {/* Header الخاص بالألعاب */}
    <div className="absolute top-0 w-full p-4 flex justify-between items-center border-b-2 border-fuchsia-600 bg-fuchsia-900/20 backdrop-blur-md z-40">
        <div className="flex items-center gap-2">
            <IconDeviceGamepad className="animate-bounce" />
            <span className="text-xl font-black tracking-[0.2em] animate-pulse">CYBER_ARCADE</span>
        </div>
        <div className="text-xs">INSERT COIN [FREE PLAY]</div>
    </div>

    <div className="relative z-10 w-full h-full pt-20 p-6 overflow-y-auto">
        {children}
    </div>
  </div>
);

// 3. ARCHIVE LAYOUT (للبيانات - تصميم ملفات سرية)
export const ArchiveLayout = ({ children }) => (
  <div className="relative h-full w-full bg-[#0c0a09] text-orange-50 font-sans flex flex-col md:flex-row overflow-hidden">
    {/* Sidebar وهمي للديكور */}
    <div className="w-16 md:w-24 bg-[#1c1917] border-r border-orange-500/20 flex flex-col items-center py-8 gap-8 shrink-0 z-20">
        <div className="w-10 h-10 border border-orange-500/50 rounded flex items-center justify-center text-orange-500"><IconDatabase size={20}/></div>
        <div className="w-[1px] h-full bg-orange-500/10"></div>
        <div className="text-[10px] text-orange-500/50 [writing-mode:vertical-rl] tracking-widest uppercase">Classified Data</div>
    </div>

    {/* Main Content Area */}
    <div className="flex-1 relative flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-orange-500/20 bg-[#1c1917]/50 flex items-center px-6 justify-between backdrop-blur-sm z-20">
            <h1 className="text-orange-500 font-bold tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                Secure Archive
            </h1>
            <span className="text-xs text-orange-500/40 font-mono">LEVEL 3 ENCRYPTION</span>
        </div>

        {/* Content with Paper Texture overlay */}
        <div className="flex-1 overflow-y-auto relative p-6 custom-scrollbar">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
            {children}
        </div>
    </div>
  </div>
);

// 4. NEURAL LINK LAYOUT (للدراسة - تصميم تركيز)
export const FocusLayout = ({ children }) => (
    <div className="relative h-full w-full bg-[#020617] text-cyan-50 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        
        {/* HUD Elements */}
        <div className="absolute top-8 left-8 border-l border-t border-cyan-500/30 w-16 h-16 pointer-events-none"></div>
        <div className="absolute top-8 right-8 border-r border-t border-cyan-500/30 w-16 h-16 pointer-events-none"></div>
        <div className="absolute bottom-8 left-8 border-l border-b border-cyan-500/30 w-16 h-16 pointer-events-none"></div>
        <div className="absolute bottom-8 right-8 border-r border-b border-cyan-500/30 w-16 h-16 pointer-events-none"></div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {children}
        </div>
    </div>
);