// FILE: components/HeroSection.jsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import { IconRocket, IconActivity, IconBrain, IconTerminal, IconSkull } from "@tabler/icons-react";
import { BorderBeam } from "./ui/BorderBeam"; // <--- جديد

export function HeroSection({ onStart, onOpenGame, user }) {
  const userName = user?.email?.split('@')[0].toUpperCase() || "OPERATIVE";

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between p-6 md:p-12 relative z-10 gap-10">
      
      {/* --- اليسار: الترحيب والبيانات --- */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }} 
        animate={{ opacity: 1, x: 0 }} 
        className="flex-1 space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-xs font-mono tracking-widest animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            SYSTEM STATUS: ONLINE
        </div>

        <div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-2 glitch-text" data-text={`WELCOME BACK, ${userName}`}>
                WELCOME BACK, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                    {userName}
                </span>
            </h1>
            <div className="text-white/40 font-mono text-sm md:text-base border-l-2 border-purple-500 pl-4 mt-4">
                <p>&gt; Neural Interface Ready.</p>
                <p>&gt; Objectives Loaded.</p>
                <p>&gt; Awaiting Command Protocol.</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="glass-card-pro p-4 rounded-xl flex items-center gap-4 group">
                <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                    <IconActivity size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">100%</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Sync Rate</div>
                </div>
            </div>
            <div className="glass-card-pro p-4 rounded-xl flex items-center gap-4 group">
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                    <IconBrain size={24} />
                </div>
                <div>
                    <div className="text-2xl font-bold text-white">Active</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">Neural Net</div>
                </div>
            </div>
        </div>
      </motion.div>

      {/* --- اليمين: مركز التحكم والأزرار --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex flex-col items-center justify-center gap-8 relative"
      >
        <button 
            onClick={onStart}
            className="group relative w-64 h-64 flex items-center justify-center focus:outline-none"
        >
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute inset-4 rounded-full border border-purple-500/30 animate-[spin_15s_linear_infinite_reverse]"></div>
            
            {/* الزر الرئيسي مع تأثير BorderBeam */}
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-white/5 shadow-[0_0_50px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_80px_rgba(168,85,247,0.4)] transition-all duration-500 flex flex-col items-center justify-center z-10 relative overflow-hidden">
                <BorderBeam size={200} duration={8} colorFrom="#00f2ff" colorTo="#7000ff" />
                <IconRocket size={48} className="text-white mb-2 group-hover:-translate-y-2 transition-transform duration-300 relative z-20" />
                <span className="text-2xl font-black text-white tracking-[0.2em] relative z-20">START</span>
                <span className="text-[10px] text-cyan-400 uppercase mt-1 group-hover:text-purple-400 relative z-20">Initialize Session</span>
            </div>
        </button>

        <button 
            onClick={onOpenGame}
            className="relative group w-full max-w-sm overflow-hidden rounded-xl border border-red-500/30 bg-red-950/10 px-6 py-4 transition-all hover:bg-red-950/30 hover:border-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]"
        >
            <BorderBeam size={150} duration={5} colorFrom="#ff0000" colorTo="#ff5555" />
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded text-red-500 group-hover:animate-pulse">
                        <IconTerminal size={24} />
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-red-500 tracking-widest group-hover:text-white transition-colors">NEURAL BREACH</div>
                        <div className="text-[10px] text-red-400/50 font-mono">HACKING PROTOCOL: READY</div>
                    </div>
                </div>
                <IconSkull className="text-red-500/20 group-hover:text-red-500 group-hover:rotate-12 transition-all" size={32} />
            </div>
        </button>
      </motion.div>
    </div>
  );
}