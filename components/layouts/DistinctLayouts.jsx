"use client";
import React from "react";
import { IconDeviceGamepad, IconDatabase, IconCpu, IconWifi, IconTrophy, IconSettings } from "@tabler/icons-react";

// --- Helper Components ---
const NoiseOverlay = () => (
  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none z-0 mix-blend-overlay"></div>
);

const GridOverlay = ({ color = "rgba(255,255,255,0.03)" }) => (
  <div className="absolute inset-0 z-0 pointer-events-none" 
       style={{backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '40px 40px'}}>
  </div>
);

// 1. HUB LAYOUT (الرئيسية - مركز القيادة)
export const HubLayout = ({ children }) => (
  <div className="relative h-full w-full bg-[#030005] overflow-hidden flex flex-col">
    <NoiseOverlay />
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none"></div>
    {/* Abstract UI Elements */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
    <div className="relative z-10 w-full h-full flex flex-col">
        {children}
    </div>
  </div>
);

// 2. ARCADE LAYOUT (الألعاب - محاكاة الواقع الافتراضي)
export const ArcadeLayout = ({ children }) => (
  <div className="relative h-full w-full bg-[#05010a] overflow-hidden font-mono text-fuchsia-400">
    <GridOverlay color="rgba(217, 70, 239, 0.05)" />
    <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-fuchsia-900/20 to-transparent pointer-events-none"></div>
    
    {/* Header */}
    <div className="absolute top-0 w-full p-4 flex justify-between items-center border-b border-fuchsia-500/20 backdrop-blur-md z-40">
        <div className="flex items-center gap-2 text-fuchsia-500">
            <IconDeviceGamepad size={18} />
            <span className="text-sm font-bold tracking-[0.3em]">SIMULATION_MODE</span>
        </div>
        <div className="text-[10px] text-fuchsia-500/50">V.9.0.1</div>
    </div>

    <div className="relative z-10 w-full h-full pt-20 p-6 overflow-y-auto custom-scrollbar">
        {children}
    </div>
  </div>
);

// 3. ARCHIVE LAYOUT (البيانات - أرشيف رقمي)
export const ArchiveLayout = ({ children }) => (
  <div className="relative h-full w-full bg-[#0a0a0a] text-orange-50 font-sans flex flex-col md:flex-row overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-900/10 via-[#0a0a0a] to-[#0a0a0a]"></div>
    <GridOverlay color="rgba(249, 115, 22, 0.03)" />
    
    {/* Side Indicator */}
    <div className="w-12 border-r border-orange-500/10 flex flex-col items-center py-6 gap-4 z-20 bg-[#0a0a0a]/80 backdrop-blur-sm">
        <IconDatabase size={16} className="text-orange-500/50" />
        <div className="flex-1 w-px bg-orange-500/10"></div>
    </div>

    <div className="flex-1 relative flex flex-col">
        <div className="relative z-10 h-full overflow-y-auto custom-scrollbar p-6">
            {children}
        </div>
    </div>
  </div>
);

// 4. FOCUS LAYOUT (الدراسة - التركيز العميق)
export const FocusLayout = ({ children }) => (
    <div className="relative h-full w-full bg-[#020408] text-cyan-50 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-[#020408] to-[#020408]"></div>
        
        {/* Focusing Brackets */}
        <div className="absolute inset-20 border border-cyan-500/5 rounded-[3rem] pointer-events-none"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80vw] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            {children}
        </div>
    </div>
);

// 5. COMMS LAYOUT (الشات - اتصالات مشفرة)
export const CommsLayout = ({ children }) => (
  <div className="relative h-full w-full bg-[#05080a] overflow-hidden text-emerald-100 flex">
    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_50%,rgba(16,185,129,0.02)_50%)] bg-[size:100%_4px] pointer-events-none z-0"></div>
    
    {/* Header Strip */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 z-50"></div>
    
    <div className="relative z-10 w-full h-full flex flex-col">
        <div className="h-10 border-b border-emerald-500/10 flex items-center justify-between px-4 bg-emerald-950/10 backdrop-blur-md shrink-0">
             <div className="flex items-center gap-2 text-emerald-500/70 text-[10px] tracking-widest font-mono">
                 <IconWifi size={12} className="animate-pulse"/> ENCRYPTED_SIGNAL
             </div>
        </div>
        {children}
    </div>
  </div>
);

// 6. HOLODECK LAYOUT (المتصدرين - قاعة الشرف)
export const HoloDeckLayout = ({ children }) => (
  <div className="relative h-full w-full bg-[#0b0a14] overflow-hidden text-yellow-100">
    {/* Spotlight Effect */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none"></div>
    <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-1 h-[400px] bg-gradient-to-b from-yellow-500/0 via-yellow-500/30 to-yellow-500/0 blur-sm"></div>
    
    <div className="absolute top-6 left-6 border-l-2 border-t-2 border-yellow-500/30 w-8 h-8"></div>
    <div className="absolute top-6 right-6 border-r-2 border-t-2 border-yellow-500/30 w-8 h-8"></div>

    <div className="relative z-10 w-full h-full p-6 pt-20 overflow-y-auto custom-scrollbar flex flex-col items-center">
        <div className="mb-6 flex items-center gap-2 text-yellow-500/60 text-xs font-bold tracking-[0.4em] uppercase border border-yellow-500/20 px-4 py-1 rounded-full">
            <IconTrophy size={14} /> Hall of Champions
        </div>
        {children}
    </div>
  </div>
);

// 7. CONFIG LAYOUT (الإعدادات - لوحة النظام)
export const ConfigLayout = ({ children }) => (
  <div className="relative h-full w-full bg-[#080808] overflow-hidden text-gray-200 font-mono">
    <GridOverlay color="rgba(255,255,255,0.02)" />
    
    <div className="absolute left-0 top-0 h-full w-24 border-r border-white/5 bg-white/1 flex flex-col items-center py-10 gap-6 z-20">
         <IconSettings className="text-white/20 animate-spin-slow" size={24} />
         <div className="h-full w-px bg-white/5"></div>
    </div>

    <div className="relative z-10 w-full h-full pl-24 p-8 overflow-y-auto">
        {children}
    </div>
  </div>
);