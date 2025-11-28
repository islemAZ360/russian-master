"use client";
import React from "react";
import { motion } from "framer-motion";
import { IconRocket, IconActivity, IconBrain } from "@tabler/icons-react";

// 1. تعريف المكون الفرعي في الأعلى لتجنب أخطاء التعريف (Hoisting Issues)
const StatBox = ({ icon, label, value, color }) => (
    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-black/50 ${color}`}>
            {icon}
        </div>
        <div>
            <div className="text-white font-bold text-lg">{value}</div>
            <div className="text-white/30 text-[10px] uppercase tracking-wider">{label}</div>
        </div>
    </div>
);

export function HeroSection({ onStart, user }) {
  // التأكد من وجود اسم للمستخدم لتجنب الأخطاء
  const userName = user?.displayName || user?.email?.split('@')[0] || "Operative";

  return (
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center relative font-sans p-6 overflow-hidden">
      
      {/* الخلفية الشبكية المتحركة */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none"></div>

      {/* المحتوى الرئيسي - لوحة القيادة */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* العمود الأيسر: البيانات */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
        >
            <div className="border-l-4 border-cyan-500 pl-6">
                <h2 className="text-cyan-400 text-sm tracking-[0.3em] uppercase mb-2">System Status: Online</h2>
                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                    WELCOME BACK, <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                        {userName.toUpperCase()}
                    </span>
                </h1>
            </div>

            <div className="text-white/50 text-lg max-w-md border border-white/10 bg-black/40 p-4 rounded-xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400 font-bold"> &gt; </span> Neural Interface Ready.
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-cyan-400 font-bold"> &gt; </span> Objectives Loaded.
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold"> &gt; </span> Awaiting Command.
                </div>
            </div>

            <div className="flex gap-4">
                <StatBox 
                    icon={<IconActivity size={24} />} 
                    label="Sync Rate" 
                    value="100%" 
                    color="text-emerald-400" 
                />
                <StatBox 
                    icon={<IconBrain size={24} />} 
                    label="Knowledge" 
                    value="Loading..." 
                    color="text-purple-400" 
                />
            </div>
        </motion.div>

        {/* العمود الأيمن: زر الإطلاق العملاق */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex justify-center md:justify-end py-10 md:py-0"
        >
            <button 
                onClick={onStart}
                className="group relative w-64 h-64 rounded-full border border-white/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95 outline-none"
            >
                {/* الحلقات الدوارة */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute inset-4 rounded-full border border-purple-500/30 animate-[spin_15s_linear_infinite_reverse]"></div>
                
                {/* قلب الزر */}
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-cyan-900/50 to-purple-900/50 backdrop-blur-xl border border-white/20 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_80px_rgba(168,85,247,0.5)] transition-all z-20">
                    <IconRocket size={48} className="text-white mb-2 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-2xl font-black text-white tracking-widest">START</span>
                    <span className="text-[10px] text-cyan-400 uppercase mt-1">Initialize Session</span>
                </div>
            </button>
        </motion.div>

      </div>
    </div>
  );
}