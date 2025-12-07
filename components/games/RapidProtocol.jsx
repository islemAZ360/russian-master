"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconBolt, IconCheck, IconX } from "@tabler/icons-react";

export default function RapidProtocol({ cards, onClose }) {
  const [currentPair, setCurrentPair] = useState(null); // { russian, arabic, isCorrect }
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(50); // شريط الوقت
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => nextRound(), []);

  // مؤقت سريع جداً
  useEffect(() => {
    let interval;
    if (!gameOver) {
      interval = setInterval(() => {
        setTimer(t => {
            if(t <= 0) { setGameOver(true); return 0; }
            return t - 1;
        });
      }, 50); // سريع جداً
    }
    return () => clearInterval(interval);
  }, [gameOver]);

  const nextRound = () => {
    const valid = cards.filter(c => c.russian && c.arabic);
    const target = valid[Math.floor(Math.random() * valid.length)];
    
    // 50% احتمال أن تكون الترجمة صحيحة
    const isCorrect = Math.random() > 0.5;
    let displayedArabic = target.arabic;

    if (!isCorrect) {
        const randomOther = valid[Math.floor(Math.random() * valid.length)];
        displayedArabic = randomOther.arabic;
    }

    setCurrentPair({ russian: target.russian, arabic: displayedArabic, isRealMatch: isCorrect });
    setTimer(100); // إعادة تعيين الوقت (100 وحدة)
  };

  const handleChoice = (choice) => {
      if(gameOver) return;
      
      if (choice === currentPair.isRealMatch) {
          setScore(s => s + 1);
          nextRound();
      } else {
          setGameOver(true);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-red-950/20 backdrop-blur-xl flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-black border-4 border-red-600 p-8 text-center shadow-[0_0_100px_#dc2626] relative overflow-hidden">
            
            {gameOver ? (
                <div>
                    <h2 className="text-6xl font-black text-red-600 mb-4">FAILED</h2>
                    <p className="text-white mb-6">PROTOCOL TERMINATED</p>
                    <div className="text-4xl text-white font-bold mb-8">SCORE: {score}</div>
                    <button onClick={() => { setGameOver(false); setScore(0); nextRound(); }} className="bg-red-600 text-white px-8 py-3 font-bold">RETRY</button>
                    <button onClick={onClose} className="block mt-4 text-red-500 hover:underline mx-auto">EXIT</button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-8 text-red-500 font-bold">
                        <span className="flex items-center gap-2"><IconBolt/> RAPID FIRE</span>
                        <span>SCORE: {score}</span>
                    </div>

                    {/* شريط الوقت */}
                    <div className="h-4 bg-red-900/50 w-full mb-8 rounded-full overflow-hidden">
                        <motion.div 
                            animate={{ width: `${timer}%` }} 
                            className="h-full bg-red-500"
                        />
                    </div>

                    <div className="mb-12">
                        <h1 className="text-5xl font-black text-white mb-4">{currentPair?.russian}</h1>
                        <div className="text-xl text-red-400">=</div>
                        <h2 className="text-3xl font-bold text-red-200 mt-4 dir-rtl">{currentPair?.arabic}</h2>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => handleChoice(true)} className="flex-1 bg-green-600 hover:bg-green-500 py-6 rounded text-3xl flex justify-center"><IconCheck/></button>
                        <button onClick={() => handleChoice(false)} className="flex-1 bg-red-600 hover:bg-red-500 py-6 rounded text-3xl flex justify-center"><IconX/></button>
                    </div>
                </>
            )}
        </div>
    </div>
  );
}