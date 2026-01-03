"use client";
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '@/context/UIContext';
import { useLanguage } from '@/hooks/useLanguage'; // إضافة الهوك
import { IconClock, IconTarget, IconMagnet, IconScale, IconPlayerPlay } from "@tabler/icons-react";

export default function GamesView() {
  const { setActiveOverlayGame } = useUI();
  const { t, dir } = useLanguage(); // استخدام الترجمة

  // استخدام useMemo لإعادة حساب المصفوفة عند تغيير اللغة
  const GAMES = useMemo(() => [
    { 
      id: 'time_traveler', title: t('game_chrono_title'), desc: t('game_chrono_desc'), color: 'text-amber-400', icon: <IconClock size={40} />, bg: 'bg-amber-500/10'
    },
    { 
      id: 'gravity', title: t('game_gravity_title'), desc: t('game_gravity_desc'), color: 'text-cyan-400', icon: <IconTarget size={40} />, bg: 'bg-cyan-500/10'
    },
    { 
      id: 'magnet', title: t('game_magnet_title'), desc: t('game_magnet_desc'), color: 'text-purple-400', icon: <IconMagnet size={40} />, bg: 'bg-purple-500/10'
    },
    { 
      id: 'scale', title: t('game_scale_title'), desc: t('game_scale_desc'), color: 'text-emerald-400', icon: <IconScale size={40} />, bg: 'bg-emerald-500/10'
    }
  ], [t]);

  return (
    <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar pb-32" dir={dir}>
        <header className="mb-10 text-center">
            <h1 className="text-4xl font-black text-white mb-2">{t('games_title')}</h1>
            <p className="text-white/40 font-mono text-xs tracking-widest uppercase">{t('games_subtitle')}</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {GAMES.map((game) => (
                <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveOverlayGame(game.id)}
                    className={`p-8 rounded-3xl border border-white/10 bg-neutral-900/50 backdrop-blur-xl cursor-pointer flex flex-col justify-between group transition-all hover:border-white/20`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${game.bg} ${game.color}`}>
                            {game.icon}
                        </div>
                        <IconPlayerPlay className="text-white/10 group-hover:text-white/50 transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white mb-2">{game.title}</h3>
                        <p className="text-white/50 text-sm leading-relaxed">{game.desc}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
  );
}