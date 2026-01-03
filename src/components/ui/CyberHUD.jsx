"use client";
import React from "react";

export const CyberHUD = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-full w-full">
      {/* Top Left Corner */}
      <div className="absolute top-8 left-8 w-64 h-64 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-3xl opacity-50">
        <div className="absolute top-0 left-0 w-20 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
        <div className="absolute top-0 left-0 h-20 w-[2px] bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
        <div className="absolute top-4 left-4 text-[10px] font-mono text-cyan-500/60">
            SYS.OP.READY <br/> V.2.0.77
        </div>
      </div>

      {/* Top Right Corner */}
      <div className="absolute top-8 right-8 w-64 h-64 border-r-2 border-t-2 border-purple-500/30 rounded-tr-3xl opacity-50">
         <div className="absolute top-0 right-0 w-20 h-[2px] bg-purple-400 shadow-[0_0_10px_#7000ff]"></div>
         <div className="absolute top-0 right-0 h-20 w-[2px] bg-purple-400 shadow-[0_0_10px_#7000ff]"></div>
         <div className="absolute top-4 right-4 flex gap-1">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
             <span className="text-[10px] font-mono text-purple-500/60">LIVE FEED</span>
         </div>
      </div>

      {/* Bottom Left Corner */}
      <div className="absolute bottom-8 left-8 w-64 h-64 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-3xl opacity-50">
         <div className="absolute bottom-0 left-0 w-20 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
         <div className="absolute bottom-0 left-0 h-20 w-[2px] bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
         {/* Decorative Lines */}
         <div className="absolute bottom-4 left-4 w-32 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
      </div>

      {/* Bottom Right Corner */}
      <div className="absolute bottom-8 right-8 w-64 h-64 border-r-2 border-b-2 border-purple-500/30 rounded-br-3xl opacity-50">
         <div className="absolute bottom-0 right-0 w-20 h-[2px] bg-purple-400 shadow-[0_0_10px_#7000ff]"></div>
         <div className="absolute bottom-0 right-0 h-20 w-[2px] bg-purple-400 shadow-[0_0_10px_#7000ff]"></div>
         <div className="absolute bottom-4 right-4 text-right text-[10px] font-mono text-purple-500/60">
             MEM: 64TB <br/> NET: SECURE
         </div>
      </div>

      {/* Center Crosshair (Optional - Very subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-white/5 rounded-full flex items-center justify-center">
          <div className="w-[1px] h-full bg-white/10"></div>
          <div className="h-[1px] w-full bg-white/10 absolute"></div>
      </div>
    </div>
  );
};