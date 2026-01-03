// FILE: app/not-found.js
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { IconAlertTriangle, IconHome } from "@tabler/icons-react";

export default function NotFound() {
  
  useEffect(() => {
    console.log("404 Page Loaded");
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white font-mono relative overflow-hidden selection:bg-red-500/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="relative z-10 text-center p-8 border border-red-500/30 bg-black/80 backdrop-blur-xl rounded-3xl shadow-[0_0_60px_rgba(220,38,38,0.15)] max-w-lg w-full">
        <IconAlertTriangle size={80} stroke={1.5} className="mx-auto text-red-500 mb-6 animate-pulse" />
        <h1 className="text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">404</h1>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent my-6 opacity-50"></div>
        <h2 className="text-xl font-bold text-red-400 mb-4 uppercase tracking-[0.2em]">Connection Severed</h2>
        <p className="text-white/50 mb-8 text-sm leading-relaxed">
          The neural link you are trying to access does not exist.
        </p>
        <Link 
          href="/"
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-red-900/20 border border-red-500/50 hover:bg-red-600 hover:border-red-500 text-white font-bold rounded-xl transition-all duration-300"
        >
          <IconHome size={20} />
          <span>RETURN TO BASE</span>
        </Link>
      </div>
    </div>
  );
}