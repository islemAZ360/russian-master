"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  IconCpu, IconBrain, IconAbc, IconPlayerPlay, IconDeviceGamepad, 
  IconEar, IconBolt, IconPuzzle, IconCloudRain 
} from "@tabler/icons-react";

// استيراد الألعاب القديمة
import HackingGame from "./HackingGame";
import MemoryGame from "./MemoryGame";
import ScrambleGame from "./ScrambleGame";

// استيراد الألعاب الجديدة (سننشئها الآن)
import AudioIntercept from "./games/AudioIntercept";
import RapidProtocol from "./games/RapidProtocol";
import LogicGate from "./games/LogicGate";
import DataRain from "./games/DataRain";

export default function GamesHub({ cards }) {
  const [activeGame, setActiveGame] = useState(null);

  const GAMES = [
    // --- الألعاب القديمة ---
    { 
        id: 'hacking', title: 'NEURAL BREACH', desc: 'Speed typing defense.', 
        color: 'text-green-500', border: 'border-green-500', bg: 'bg-green-500/10', icon: <IconCpu size={32}/> 
    },
    { 
        id: 'memory', title: 'MEMORY CORE', desc: 'Sync data pairs.', 
        color: 'text-purple-500', border: 'border-purple-500', bg: 'bg-purple-500/10', icon: <IconBrain size={32}/> 
    },
    { 
        id: 'scramble', title: 'CRYPTIC CIPHER', desc: 'Reconstruct data.', 
        color: 'text-blue-500', border: 'border-blue-500', bg: 'bg-blue-500/10', icon: <IconAbc size={32}/> 
    },
    // --- الألعاب الجديدة ---
    { 
        id: 'audio', title: 'AUDIO INTERCEPT', desc: 'Listen & decode.', 
        color: 'text-yellow-500', border: 'border-yellow-500', bg: 'bg-yellow-500/10', icon: <IconEar size={32}/> 
    },
    { 
        id: 'rapid', title: 'RAPID PROTOCOL', desc: 'True/False speed run.', 
        color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500/10', icon: <IconBolt size={32}/> 
    },
    { 
        id: 'logic', title: 'LOGIC GATE', desc: 'Multiple choice exam.', 
        color: 'text-cyan-500', border: 'border-cyan-500', bg: 'bg-cyan-500/10', icon: <IconPuzzle size={32}/> 
    },
    { 
        id: 'rain', title: 'DATA RAIN', desc: 'Type falling words.', 
        color: 'text-pink-500', border: 'border-pink-500', bg: 'bg-pink-500/10', icon: <IconCloudRain size={32}/> 
    },
  ];

  // Router للألعاب
  if (activeGame === 'hacking') return <HackingGame cards={cards} onClose={() => setActiveGame(null)} />;
  if (activeGame === 'memory') return <MemoryGame cards={cards} onClose={() => setActiveGame(null)} />;
  if (activeGame === 'scramble') return <ScrambleGame cards={cards} onClose={() => setActiveGame(null)} />;
  
  // الألعاب الجديدة
  if (activeGame === 'audio') return <AudioIntercept cards={cards} onClose={() => setActiveGame(null)} />;
  if (activeGame === 'rapid') return <RapidProtocol cards={cards} onClose={() => setActiveGame(null)} />;
  if (activeGame === 'logic') return <LogicGate cards={cards} onClose={() => setActiveGame(null)} />;
  if (activeGame === 'rain') return <DataRain cards={cards} onClose={() => setActiveGame(null)} />;

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto custom-scrollbar pb-32">
      
      <div className="mb-10 text-center relative z-10">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-900 to-black rounded-full border-2 border-white/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <IconDeviceGamepad size={40} className="text-white"/>
          </div>
          <h1 className="text-4xl font-black text-white tracking-[0.2em] mb-2">CYBER ARCADE</h1>
          <p className="text-white/40 font-mono text-sm">SELECT TRAINING MODULE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto w-full z-10">
          {GAMES.map((game, i) => (
              <motion.div 
                key={game.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveGame(game.id)}
                className={`group relative h-64 cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] hover:border-opacity-100 transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
              >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${game.bg}`}></div>
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                      <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-2xl w-fit ${game.bg} ${game.color} border border-white/10`}>
                              {game.icon}
                          </div>
                          <IconPlayerPlay className={`opacity-0 group-hover:opacity-100 transition-opacity ${game.color}`}/>
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