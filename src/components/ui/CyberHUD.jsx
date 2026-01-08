"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";

export const CyberHUD = () => {
  const { user, role } = useAuth();

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-full w-full">
      {/* Top Left Corner */}
      <div className="absolute top-8 left-8 w-64 h-64 border-l-2 border-t-2 border-cyan-500/30 rounded-tl-3xl opacity-50">
        <div className="absolute top-0 left-0 w-20 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
        <div className="absolute top-0 left-0 h-20 w-[2px] bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
        <div className="absolute top-4 left-4 text-[10px] font-mono text-cyan-500/60 uppercase">
            SYS.OP.READY <br/> 
            VER. 5.4.0-STABLE <br/>
            ID: {user ? user.uid.substring(0, 8) : "GUEST"}
        </div>
      </div>

      {/* Top Right Corner */}
      <div className="absolute top-8 right-8 w-64 h-64 border-r-2 border-t-2 border-purple-500/30 rounded-tr-3xl opacity-50">
         <div className="absolute top-0 right-0 w-20 h-[2px] bg-purple-400 shadow-[0_0_10px_#7000ff]"></div>
         <div className="absolute top-0 right-0 h-20 w-[2px] bg-purple-400 shadow-[0_0_10px_#7000ff]"></div>
         <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-mono text-purple-500/60 font-bold">NET: SECURE</span>
             </div>
             <span className="text-[9px] font-mono text-purple-500/40 uppercase">{role} ACCESS</span>
         </div>
      </div>

      {/* Bottom Left Corner */}
      <div className="absolute bottom-8 left-8 w-64 h-64 border-l-2 border-b-2 border-cyan-500/30 rounded-bl-3xl opacity-50">
         <div className="absolute bottom-0 left-0 w-20 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
         <div className="absolute bottom-0 left-0 h-20 w-[2px] bg-cyan-400 shadow-[0_0_10px_#00f2ff]"></div>
         {/* Decorative Lines */}
         <div className="absolute bottom-4 left-4 w-32 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
         <div className="absolute bottom-6 left-4 w-16 h-[1px] bg-gradient-to-r from-cyan-500/30 to-transparent"></div>
      </div>

      {/* Bottom Right Corner */}
      <div className="absolute bottom-8 right-8 w-64 h-64 border-r-2 border-b-2 border-purple-500/30 rounded-br-3xl opacity-50">
         <div className="absolute bottom-0 right-0 w-20 h-[2px] bg-purple-400 shadow-[0_0_10px_#7000ff]"></div>
         <div className="absolute bottom-0 right-0 h-20 w-[2px] bg-purple-400 shadow-[0_0_10px_#7000ff]"></div>
         <div className="absolute bottom-4 right-4 text-right text-[10px] font-mono text-purple-500/60">
             MEM: 64TB <br/> UPLINK: ACTIVE
         </div>
      </div>

      {/* Center Crosshair (Optional - Very subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white/5 rounded-full flex items-center justify-center opacity-30 pointer-events-none">
          <div className="w-[1px] h-3 bg-white/20"></div>
          <div className="h-[1px] w-3 bg-white/20 absolute"></div>
      </div>
    </div>
  );
};