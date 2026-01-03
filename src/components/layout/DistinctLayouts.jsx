"use client";
import React from "react";
import { IconDeviceGamepad, IconDatabase, IconWifi, IconTrophy, IconSettings } from "@tabler/icons-react";

const GridOverlay = ({ color = "rgba(255,255,255,0.03)" }) => (
  <div className="absolute inset-0 z-0 pointer-events-none" 
       style={{backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '40px 40px'}}>
  </div>
);

// HUB
export const HubLayout = ({ children }) => (
  <div className="relative h-full w-full bg-transparent overflow-hidden flex flex-col">
    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none"></div>
    <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
  </div>
);

// ARCADE - إزالة Blur
export const ArcadeLayout = ({ children }) => (
  <div className="relative h-full w-full bg-black/60 overflow-hidden font-mono text-fuchsia-400">
    <GridOverlay color="rgba(217, 70, 239, 0.1)" />
    <div className="absolute top-0 w-full p-4 flex justify-between items-center border-b border-fuchsia-500/20 z-40 bg-black/20">
        <div className="flex items-center gap-2 text-fuchsia-500"><IconDeviceGamepad size={18} /><span className="text-sm font-bold tracking-[0.3em]">ARCADE_SYS</span></div>
    </div>
    <div className="relative z-10 w-full h-full pt-20 p-6 overflow-y-auto custom-scrollbar">{children}</div>
  </div>
);

// ARCHIVE - إزالة Blur
export const ArchiveLayout = ({ children }) => (
  <div className="relative h-full w-full bg-black/70 text-orange-50 font-sans flex flex-col md:flex-row overflow-hidden">
    <div className="w-12 border-r border-orange-500/10 flex flex-col items-center py-6 gap-4 z-20 bg-black/30"><IconDatabase size={16} className="text-orange-500/50" /></div>
    <div className="flex-1 relative flex flex-col"><div className="relative z-10 h-full overflow-y-auto custom-scrollbar p-6">{children}</div></div>
  </div>
);

// FOCUS - إزالة Blur
export const FocusLayout = ({ children }) => (
    <div className="relative h-full w-full bg-black/40 text-cyan-50 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-20 border border-cyan-500/5 rounded-[3rem] pointer-events-none"></div>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">{children}</div>
    </div>
);

// COMMS - إزالة Blur
export const CommsLayout = ({ children }) => (
  <div className="relative h-full w-full bg-black/60 overflow-hidden text-emerald-100 flex flex-col">
    <div className="h-10 border-b border-emerald-500/10 flex items-center justify-between px-4 bg-emerald-950/20 shrink-0"><div className="flex items-center gap-2 text-emerald-500/70 text-[10px] tracking-widest font-mono"><IconWifi size={12} className="animate-pulse"/> SIGNAL_SECURE</div></div>
    <div className="relative z-10 w-full h-full flex flex-col">{children}</div>
  </div>
);

// HOLODECK - إزالة Blur
export const HoloDeckLayout = ({ children }) => (
  <div className="relative h-full w-full bg-black/50 overflow-hidden text-yellow-100">
    <div className="relative z-10 w-full h-full p-6 pt-20 overflow-y-auto custom-scrollbar flex flex-col items-center">
        <div className="mb-6 flex items-center gap-2 text-yellow-500/60 text-xs font-bold tracking-[0.4em] uppercase border border-yellow-500/20 px-4 py-1 rounded-full"><IconTrophy size={14} /> Champions</div>
        {children}
    </div>
  </div>
);

// CONFIG - إزالة Blur
export const ConfigLayout = ({ children }) => (
  <div className="relative h-full w-full bg-black/80 overflow-hidden text-gray-200 font-mono">
    <div className="relative z-10 w-full h-full pl-8 p-8 overflow-y-auto">{children}</div>
  </div>
);