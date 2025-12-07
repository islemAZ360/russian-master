"use client";
import React, { useState, useEffect } from "react";
import { IconPuzzle, IconX } from "@tabler/icons-react";

export default function LogicGate({ cards, onClose }) {
  const [current, setCurrent] = useState(null);
  const [options, setOptions] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => nextQuestion(), []);

  const nextQuestion = () => {
    const valid = cards.filter(c => c.russian && c.arabic);
    const target = valid[Math.floor(Math.random() * valid.length)];
    // خيارات عشوائية
    const wr1 = valid[Math.floor(Math.random() * valid.length)];
    const wr2 = valid[Math.floor(Math.random() * valid.length)];
    const wr3 = valid[Math.floor(Math.random() * valid.length)];
    
    const opts = [target, wr1, wr2, wr3].sort(() => 0.5 - Math.random());
    setCurrent(target);
    setOptions(opts);
  };

  const handleAnswer = (ans) => {
      if(ans.id === current.id) {
          setStreak(s => s + 1);
          nextQuestion();
      } else {
          setStreak(0);
          document.body.classList.add('bg-red-900');
          setTimeout(() => document.body.classList.remove('bg-red-900'), 200);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-[#0f172a] border border-cyan-500/50 p-8 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.1)] relative">
            <button onClick={onClose} className="absolute top-6 right-6 text-cyan-500"><IconX/></button>
            
            <div className="flex justify-between items-center mb-10 border-b border-cyan-900 pb-4">
                <h2 className="text-cyan-400 font-black tracking-[0.2em] flex items-center gap-2"><IconPuzzle/> LOGIC GATE</h2>
                <div className="bg-cyan-900/50 px-4 py-1 rounded text-cyan-200 font-mono">STREAK: {streak}</div>
            </div>

            <div className="text-center mb-10">
                <p className="text-cyan-500/50 text-xs uppercase mb-2">Identify Translation For:</p>
                <h1 className="text-5xl font-black text-white">{current?.russian}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {options.map((opt, i) => (
                    <button 
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className="p-6 border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all rounded-xl text-lg font-bold"
                    >
                        {opt.arabic}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}