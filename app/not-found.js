// FILE: app/not-found.js
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { IconAlertTriangle } from "@tabler/icons-react";

export default function NotFound() {
  
  // هذا الاستدعاء يضمن عدم ظهور خطأ "useEffect is not defined"
  useEffect(() => {
    console.log("System Error: 404 Route Not Found");
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white font-mono p-4 overflow-hidden relative">
      {/* خلفية رقمية بسيطة */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <div className="z-10 text-center border border-red-500/50 p-10 rounded-3xl bg-red-950/10 backdrop-blur-md shadow-[0_0_50px_rgba(220,38,38,0.2)]">
        <IconAlertTriangle size={80} className="mx-auto text-red-500 mb-6 animate-pulse" />
        
        <h1 className="text-6xl font-black mb-2 text-red-500 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest">Signal Lost</h2>
        
        <p className="text-red-400/60 mb-8 max-w-md text-sm leading-relaxed">
          The requested data vector could not be located in the neural network. 
          It may have been deleted or corrupted.
        </p>

        <Link 
          href="/"
          className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] uppercase tracking-wider"
        >
          Return to Base
        </Link>
      </div>

      {/* تأثيرات خلفية */}
      <div className="absolute bottom-10 left-10 text-xs text-white/20 font-mono">
        ERROR_CODE: PAGE_NOT_FOUND
        <br />
        SYSTEM_HALTED
      </div>
    </div>
  );
}