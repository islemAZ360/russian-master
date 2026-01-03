"use client";
import React from 'react';
import { GridBackground } from '../ui/GridBackground';
import { CyberHUD } from '../ui/CyberHUD';
import DigitalRain from '../ui/DigitalRain';

export default function CyberLayout({ children }) {
  return (
    <div className="relative h-screen w-full overflow-hidden font-sans text-neutral-200 bg-black selection:bg-cyan-500/30">
      {/* Background Layer */}
      <div className="fixed inset-0 z-0">
          <GridBackground />
          <CyberHUD />
          <DigitalRain />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none"></div>
      </div>

      {/* Content Layer - Centered Focus */}
      <main className="relative z-10 w-full h-full flex flex-col">
          {children}
      </main>
    </div>
  );
}