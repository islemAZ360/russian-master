"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/hooks/useLanguage'; 
import { IconClock, IconTarget, IconMagnet, IconScale, IconPlayerPlay, IconDeviceGamepad } from "@tabler/icons-react";

/**
 * عرض مركز الألعاب (Simulation Hub)
 * تم تعديله ليكون متوافقاً تماماً مع اللغات الثلاث (AR, EN, RU)
 */
export default function GamesView() {
  const { setActiveOverlayGame } = useUI();
  const { t, dir, isRTL } = useLanguage(); // استدعاء الترجمة والاتجاه

  // بناء مصفوفة الألعاب ديناميكياً بناءً على اللغة المختارة لضمان تحديثها فوراً
  const GAMES = useMemo(() => [
    { 
      id: 'time_traveler', 
      title: t('game_chrono_title'), 
      desc: t('game_chrono_desc'), 
      color: 'text-amber-400', 
      icon: <IconClock size={44} />, 
      bg: 'bg-amber-500/10',
      border: 'group-hover:border-amber-500/50'
    },
    { 
      id: 'gravity', 
      title: t('game_gravity_title'), 
      desc: t('game_gravity_desc'), 
      color: 'text-cyan-400', 
      icon: <IconTarget size={44} />, 
      bg: 'bg-cyan-500/10',
      border: 'group-hover:border-cyan-500/50'
    },
    { 
      id: 'magnet', 
      title: t('game_magnet_title'), 
      desc: t('game_magnet_desc'), 
      color: 'text-purple-400', 
      icon: <IconMagnet size={44} />, 
      bg: 'bg-purple-500/10',
      border: 'group-hover:border-purple-500/50'
    },
    { 
      id: 'scale', 
      title: t('game_scale_title'), 
      desc: t('game_scale_desc'), 
      color: 'text-emerald-400', 
      icon: <IconScale size={44} />, 
      bg: 'bg-emerald-500/10',
      border: 'group-hover:border-emerald-500/50'
    }
  ], [t]); // التحديث يحدث فقط عند تغير دالة الترجمة (تغير اللغة)

  return (
    <div className="w-full h-full p-4 md:p-10 overflow-y-auto custom-scrollbar pb-40" dir={dir}>
        
        {/* هيدر الصفحة المترجم */}
        <header className="mb-16 text-center animate-in fade-in duration-700">
            <div className="flex items-center justify-center gap-3 mb-4">
                <IconDeviceGamepad size={32} className="text-cyan-500" />
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
                    {t('games_title')}
                </h1>
            </div>
            <p className="text-white/40 font-black font-mono text-[10px] md:text-xs tracking-[0.4em] uppercase max-w-2xl mx-auto leading-relaxed">
                {t('games_subtitle')}
            </p>
        </header>
        
        {/* شبكة الألعاب */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {GAMES.map((game, index) => (
                <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveOverlayGame(game.id)}
                    className={`group p-8 rounded-[2.5rem] border border-white/10 bg-zinc-900/40 backdrop-blur-2xl cursor-pointer flex flex-col justify-between transition-all duration-300 ${game.border} hover:shadow-2xl hover:shadow-black`}
                >
                    <div className="flex justify-between items-start mb-10">
                        {/* أيقونة اللعبة */}
                        <div className={`p-5 rounded-3xl ${game.bg} ${game.color} shadow-inner`}>
                            {game.icon}
                        </div>
                        
                        {/* مؤشر التشغيل */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 opacity-40 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Initialize</span>
                            <IconPlayerPlay size={14} className="text-white" fill="currentColor" />
                        </div>
                    </div>

                    <div className={isRTL ? "text-right" : "text-left"}>
                        <h3 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">
                            {game.title}
                        </h3>
                        <p className="text-white/40 text-sm md:text-base leading-relaxed font-medium group-hover:text-white/60 transition-colors">
                            {game.desc}
                        </p>
                    </div>

                    {/* خطوط ديكورية أسفل الكارت */}
                    <div className="mt-8 flex gap-1 opacity-20">
                        <div className="h-1 w-12 bg-white rounded-full"></div>
                        <div className="h-1 w-2 bg-white rounded-full"></div>
                        <div className="h-1 w-2 bg-white rounded-full"></div>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );
}