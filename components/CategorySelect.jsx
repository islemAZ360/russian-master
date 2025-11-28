"use client";
import React from "react";
import { motion } from "framer-motion";
import { IconCpu, IconServer, IconArrowRight, IconDatabase } from "@tabler/icons-react";

export function CategorySelect({ categories, activeCategory, onSelect }) {
  return (
    // FIX SCROLL: h-screen (كامل الشاشة) + overflow-hidden (للأب)
    <div className="w-full h-screen flex flex-col font-sans overflow-hidden bg-black relative">
      
      {/* HEADER FIXED (ثابت لا يتحرك) */}
      <div className="shrink-0 p-6 pt-10 pb-4 z-10 bg-gradient-to-b from-black via-black to-transparent">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
                    <IconServer size={32} className="text-cyan-400 animate-pulse"/>
                </div>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">
              NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">MODULES</span>
            </h2>
            <p className="text-white/30 tracking-[0.3em] text-[10px] uppercase font-bold">Select Data Vector for Injection</p>
        </motion.div>
      </div>

      {/* SCROLLABLE AREA (يتحرك) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat;
            
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(cat)}
                className={`group relative h-24 w-full rounded-xl border flex items-center justify-between px-6 transition-all duration-300 overflow-hidden ${
                  isActive 
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
                  : 'bg-[#0a0a0a] border-white/5 hover:border-cyan-500/30 hover:bg-white/5'
                }`}
              >
                {/* Tech Background Pattern */}
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:4px_4px]"></div>

                <div className="flex items-center gap-5 z-10">
                    {/* Icon Box */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${isActive ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-black text-white/20 border-white/10 group-hover:text-cyan-400 group-hover:border-cyan-500/30'}`}>
                        {isActive ? <IconDatabase size={24} /> : <IconCpu size={24} />}
                    </div>
                    
                    {/* Text Info */}
                    <div className="text-left">
                        <h3 className={`text-lg font-bold font-mono uppercase tracking-tight ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                            {cat}
                        </h3>
                        <div className="flex items-center gap-2 text-[10px] text-white/20 font-mono mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_5px_#10b981]' : 'bg-gray-700'}`}></span>
                            <span>{isActive ? 'CONNECTED' : 'STANDBY'}</span>
                        </div>
                    </div>
                </div>

                {/* Arrow & Decoration */}
                <div className={`z-10 transition-transform duration-300 ${isActive ? 'translate-x-0 text-cyan-400' : 'translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-white/50'}`}>
                    <IconArrowRight size={24} />
                </div>

                {/* Active Loading Bar */}
                {isActive && (
                    <div className="absolute bottom-0 left-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-[width_1.5s_ease-out_forwards]" style={{width: '100%'}}></div>
                )}
              </motion.button>
            );
          })}
          
          {/* Spacer for bottom docking area */}
          <div className="h-20 w-full"></div>
        </div>
      </div>
    </div>
  );
}