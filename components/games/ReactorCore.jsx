"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconRadioactive, IconX } from "@tabler/icons-react";
import confetti from "canvas-confetti";

const BACKUP_DATA = [
    { russian: "Кот", arabic: "قطة" },
    { russian: "Собака", arabic: "كلب" },
    { russian: "Дом", arabic: "منزل" },
    { russian: "Мир", arabic: "سلام" }
];

export default function ReactorCore({ cards, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);

  const gameCards = (cards && cards.length > 3) ? cards : BACKUP_DATA;

  useEffect(() => { nextQuestion(); }, []);

  const nextQuestion = () => {
    const target = gameCards[Math.floor(Math.random() * gameCards.length)];
    
    // الحصول على 3 خيارات خاطئة
    const wrongOptions = gameCards
        .filter(c => c.id !== target.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    
    const allOptions = [target, ...wrongOptions].sort(() => 0.5 - Math.random());
    
    setCurrentQuestion(target);
    setOptions(allOptions);
  };

  const handleAnswer = (option) => {
      if (option.russian === currentQuestion.russian) {
          setScore(s => s + 50);
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
          nextQuestion();
      } else {
          setScore(s => Math.max(0, s - 25));
          // وميض أحمر
          document.body.style.backgroundColor = "#300";
          setTimeout(() => document.body.style.backgroundColor = "#050505", 200);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2 text-cyan-400 font-black tracking-widest">
                    <IconRadioactive className="animate-spin-slow"/> REACTOR CORE
                </div>
                <div className="text-white font-mono text-xl">{score} PTS</div>
                <button onClick={onClose}><IconX className="text-white/50 hover:text-white"/></button>
            </div>

            <div className="bg-cyan-900/10 border border-cyan-500/30 p-10 rounded-3xl text-center mb-6 backdrop-blur-md">
                <h1 className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    {currentQuestion?.russian}
                </h1>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {options.map((opt, i) => (
                    <button 
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className="p-4 bg-white/5 border border-white/10 rounded-xl text-lg font-bold text-white hover:bg-cyan-600 hover:border-cyan-400 transition-all font-cairo"
                    >
                        {opt.arabic}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}