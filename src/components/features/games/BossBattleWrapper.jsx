"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconHeart, IconSkull, IconShieldBolt } from '@tabler/icons-react';

export function BossBattleWrapper({ children, isCorrect, resetTrigger }) {
  const [playerHP, setPlayerHP] = useState(100);
  const [bossHP, setBossHP] = useState(100);
  const [damageEffect, setDamageEffect] = useState(null); // 'player' or 'boss'

  useEffect(() => {
    if (isCorrect === true) {
        setBossHP(prev => Math.max(0, prev - 20));
        setDamageEffect('boss');
        setTimeout(() => setDamageEffect(null), 500);
    } else if (isCorrect === false) {
        setPlayerHP(prev => Math.max(0, prev - 15));
        setDamageEffect('player');
        setTimeout(() => setDamageEffect(null), 500);
    }
  }, [isCorrect, resetTrigger]);

  if (playerHP === 0) return <GameOverScreen win={false} />;
  if (bossHP === 0) return <GameOverScreen win={true} />;

  return (
    <div className="relative w-full h-full flex flex-col justify-between py-4">
       {/* تأثير الضرر الأحمر */}
       {damageEffect === 'player' && <div className="absolute inset-0 bg-red-500/30 animate-pulse z-50 pointer-events-none"></div>}
       {damageEffect === 'boss' && <div className="absolute inset-0 bg-cyan-500/30 animate-pulse z-50 pointer-events-none"></div>}

       {/* BOSS BAR (Top) */}
       <div className="w-full max-w-2xl mx-auto flex items-center gap-4 px-4">
            <div className="relative">
                <IconSkull size={40} className={`text-red-500 ${damageEffect === 'boss' ? 'animate-shake' : ''}`} />
                <div className="absolute -bottom-1 -right-1 bg-red-900 text-[10px] px-1 rounded text-white border border-red-500">VIRUS</div>
            </div>
            <div className="flex-1">
                <div className="flex justify-between text-xs text-red-400 font-bold mb-1">
                    <span>CYBER_THREAT_LVL_99</span>
                    <span>{bossHP}%</span>
                </div>
                <div className="h-4 bg-red-900/30 rounded-full border border-red-500/30 overflow-hidden relative">
                    <motion.div 
                        animate={{ width: `${bossHP}%` }}
                        className="h-full bg-gradient-to-r from-red-600 to-orange-600 shadow-[0_0_10px_#dc2626]"
                    />
                </div>
            </div>
       </div>

       {/* CARD AREA (Center) */}
       <div className="flex-1 flex items-center justify-center relative z-10">
            {children}
       </div>

       {/* PLAYER BAR (Bottom) */}
       <div className="w-full max-w-2xl mx-auto flex items-center gap-4 px-4 mb-20">
            <div className="flex-1">
                <div className="flex justify-between text-xs text-cyan-400 font-bold mb-1">
                    <span>{playerHP}%</span>
                    <span>OPERATIVE_STATUS</span>
                </div>
                <div className="h-4 bg-cyan-900/30 rounded-full border border-cyan-500/30 overflow-hidden relative">
                    <motion.div 
                        animate={{ width: `${playerHP}%` }}
                        className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_10px_#06b6d4]"
                    />
                </div>
            </div>
            <div className="relative">
                <IconShieldBolt size={40} className={`text-cyan-500 ${damageEffect === 'player' ? 'animate-shake' : ''}`} />
            </div>
       </div>
    </div>
  );
}

const GameOverScreen = ({ win }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in zoom-in duration-500">
        <h1 className={`text-6xl font-black mb-4 ${win ? 'text-emerald-500' : 'text-red-500'}`}>
            {win ? "THREAT ELIMINATED" : "SYSTEM FAILURE"}
        </h1>
        <p className="text-white/50 text-xl tracking-widest uppercase">
            {win ? "Neural Link Secured. XP Gained." : "Rebooting Systems..."}
        </p>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-white/10 border border-white/20 text-white rounded-full hover:bg-white/20">
            RESTART MISSION
        </button>
    </div>
);