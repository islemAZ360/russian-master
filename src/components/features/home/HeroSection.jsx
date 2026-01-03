"use client";
import React from "react";
import { motion } from "framer-motion";
import { IconRocket, IconActivity, IconBrain, IconTerminal, IconSkull, IconSparkles } from "@tabler/icons-react";
import { BorderBeam } from "../ui/BorderBeam";
import { DecryptText } from "../ui/DecryptText";
import { MagneticButton } from "../ui/MagneticButton";
import { useSettings } from "../../context/SettingsContext";

export function HeroSection({ onStart, onOpenGame, user }) {
  const userName = user?.email?.split('@')[0].toUpperCase() || "OPERATIVE";
  const { isDark } = useSettings();

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-between p-6 md:p-12 relative z-10 gap-10">
      <motion.div 
        initial={{ opacity: 0, x: -50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 space-y-8"
      >
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-mono tracking-widest ${
          isDark 
            ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400' 
            : 'border-blue-400/50 bg-blue-50 text-blue-600 shadow-sm'
        }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-cyan-400' : 'bg-blue-500'}`}></span> 
            SYSTEM STATUS: ONLINE
        </div>
        
        {/* Main Title */}
        <div>
            <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-2 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
                WELCOME BACK, <br/>
                <span className={`text-transparent bg-clip-text ${
                  isDark 
                    ? 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600'
                }`}>
                    <DecryptText text={userName} />
                </span>
            </h1>
            
            {/* Subtitle */}
            <div className={`font-mono text-sm md:text-base border-l-2 pl-4 mt-4 ${
              isDark 
                ? 'text-white/40 border-purple-500' 
                : 'text-slate-500 border-blue-400'
            }`}>
                <p>{'>'} Neural Interface Ready.</p>
                <p>{'>'} Objectives Loaded.</p>
            </div>
        </div>

        {/* Additional Info for Light Mode */}
        {!isDark && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 mt-6"
          >
            <div className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-sm">
              <div className="text-2xl font-black text-blue-600">1000+</div>
              <div className="text-xs text-slate-500 font-medium">Words</div>
            </div>
            <div className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200 shadow-sm">
              <div className="text-2xl font-black text-purple-600">4</div>
              <div className="text-xs text-slate-500 font-medium">Games</div>
            </div>
            <div className="px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-200 shadow-sm">
              <div className="text-2xl font-black text-indigo-600">∞</div>
              <div className="text-xs text-slate-500 font-medium">Practice</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Right Side - Buttons */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 flex flex-col items-center justify-center gap-8 relative"
      >
        {/* Main Start Button */}
        <MagneticButton onClick={onStart} className="group relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center focus:outline-none">
            <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-[spin_10s_linear_infinite] ${
              isDark ? 'border-cyan-500/30' : 'border-blue-400/40'
            }`}></div>
            <div className={`w-44 h-44 md:w-48 md:h-48 rounded-full border flex flex-col items-center justify-center z-10 relative overflow-hidden ${
              isDark 
                ? 'bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-white/5 shadow-[0_0_50px_rgba(6,182,212,0.2)]' 
                : 'bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-[0_10px_40px_rgba(59,130,246,0.2)]'
            }`}>
                <BorderBeam 
                  size={200} 
                  duration={8} 
                  colorFrom={isDark ? "#00f2ff" : "#3b82f6"} 
                  colorTo={isDark ? "#7000ff" : "#8b5cf6"} 
                />
                <IconRocket size={48} className={isDark ? 'text-white mb-2' : 'text-blue-600 mb-2'} />
                <span className={`text-xl md:text-2xl font-black tracking-[0.2em] ${
                  isDark ? 'text-white' : 'text-slate-700'
                }`}>START</span>
            </div>
        </MagneticButton>

        {/* Game Button */}
        <MagneticButton 
          onClick={onOpenGame} 
          className={`relative group w-full max-w-sm overflow-hidden rounded-xl border px-6 py-4 transition-all ${
            isDark 
              ? 'border-red-500/30 bg-red-950/10 hover:bg-red-950/30 hover:border-red-500' 
              : 'border-orange-300 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 hover:border-orange-400 shadow-sm'
          }`}
        >
            <BorderBeam 
              size={150} 
              duration={5} 
              colorFrom={isDark ? "#ff0000" : "#f97316"} 
              colorTo={isDark ? "#ff5555" : "#ef4444"} 
            />
            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <IconTerminal size={24} className={isDark ? 'text-red-500' : 'text-orange-600'}/>
                    <div className="text-left">
                        <div className={`text-sm font-bold tracking-widest ${
                          isDark ? 'text-red-500' : 'text-orange-700'
                        }`}>NEURAL BREACH</div>
                        <div className={`text-[10px] font-mono ${
                          isDark ? 'text-red-400/50' : 'text-orange-500/70'
                        }`}>HACKING PROTOCOL: READY</div>
                    </div>
                </div>
                <IconSparkles className={isDark ? 'text-red-500/20' : 'text-orange-400/40'} size={32} />
            </div>
        </MagneticButton>

        {/* Light mode decorative element */}
        {!isDark && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -z-10 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
