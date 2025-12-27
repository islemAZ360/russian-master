"use client";
import React from 'react';
import { IconShieldLock, IconTerminal2, IconLogout } from '@tabler/icons-react';

export default function TerminalLayout({ children, onExit }) {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#00ff00] font-mono flex overflow-hidden">
      {/* طبقة CRT Line Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-20"></div>
      
      {/* 1. Sidebar ثابتة وقاسية (Hard Edges) */}
      <aside className="w-64 border-r-2 border-[#00ff00]/30 bg-black flex flex-col shrink-0 z-40">
        <div className="h-20 border-b-2 border-[#00ff00]/30 flex items-center px-6 gap-3">
            <IconTerminal2 size={32} />
            <div>
                <h1 className="font-bold text-lg tracking-widest">NEXUS_OS</h1>
                <p className="text-[10px] opacity-70">ADMIN_KERNEL_V4</p>
            </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
            <div className="text-[10px] mb-2 opacity-50 uppercase">// Navigation Modules</div>
            {/* القائمة ستمرر كـ Children لكن الهيكل هنا ثابت */}
            <div id="admin-sidebar-slot"></div>
        </div>

        <button onClick={onExit} className="h-16 border-t-2 border-[#00ff00]/30 hover:bg-[#00ff00] hover:text-black transition-colors flex items-center justify-center gap-2 font-bold uppercase tracking-widest">
            <IconLogout size={20} /> Terminate
        </button>
      </aside>

      {/* 2. منطقة المحتوى (Raw Data Container) */}
      <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">
        {/* Header */}
        <header className="h-12 border-b border-[#00ff00]/20 flex items-center justify-between px-6 bg-black/80">
            <div className="flex items-center gap-4 text-xs">
                <span>MEM: 64TB</span>
                <span>|</span>
                <span>CPU: 4%</span>
                <span>|</span>
                <span>NET: SECURE</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-[#00ff00] animate-pulse"></div>
                LIVE CONNECTION
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-[#00ff00]"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-[#00ff00]"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-[#00ff00]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-[#00ff00]"></div>
            
            {children}
        </div>
      </main>
    </div>
  );
}