"use client";
import React from "react";
import { motion } from "framer-motion";
import { IconClock, IconDeviceGamepad } from "@tabler/icons-react";

// تم حذف استيراد الألعاب الأخرى لأننا قمنا بحذف ملفاتها

export default function GamesHub({ onOpenGame }) {
  
  // القائمة تحتوي الآن فقط على لعبة الساعة
  const GAMES = [
    { 
        id: 'time_traveler', 
        title: 'THE TIME TRAVELER', 
        desc: 'Master Russian Time.', 
        color: 'text-[#cfb53b]', 
        bg: 'bg-[#cfb53b]/10', 
        icon: <IconClock size={32}/>,
        isOverlay: true 
    }
  ];

  const handleGameClick = (game) => {
      // بما أن اللعبة الوحيدة المتبقية هي من نوع Overlay
      // نقوم بإرسال الأمر للصفحة الرئيسية لفتحها
      if (onOpenGame) onOpenGame(game.id);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar pb-32">
      <div className="mb-10 text-center relative z-10 shrink-0 mt-10 md:mt-0">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-900 to-black rounded-full border-2 border-white/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <IconDeviceGamepad size={40} className="text-white"/>
          </div>
          <h1 className="text-4xl font-black text-white tracking-[0.2em] mb-2">CYBER ARCADE</h1>
          <p className="text-white/40 font-mono text-sm">SELECT TRAINING MODULE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full z-10 pb-10">
          {GAMES.map((game, i) => (
              <motion.div 
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleGameClick(game)}
                className={`group relative h-64 cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] hover:border-opacity-100 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] shrink-0`}
              >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${game.bg}`}></div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                      <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-2xl w-fit ${game.bg} ${game.color} border border-white/10`}>{game.icon}</div>
                      </div>
                      <div>
                          <h3 className={`text-xl font-black ${game.color} tracking-widest mb-1`}>{game.title}</h3>
                          <p className="text-white/50 text-xs font-mono">{game.desc}</p>
                      </div>
                  </div>
              </motion.div>
          ))}
      </div>
    </div>
  );
}