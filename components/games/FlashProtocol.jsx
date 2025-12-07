"use client";
import React, { useState, useEffect } from "react";
import { IconBolt, IconCheck, IconX, IconTrophy } from "@tabler/icons-react";
import { useSettings } from "../../context/SettingsContext"; 
import confetti from "canvas-confetti";

const BACKUP_DATA = [
    { russian: "Да", arabic: "نعم" }, { russian: "Нет", arabic: "لا" },
    { russian: "Привет", arabic: "مرحبا" }, { russian: "Пока", arabic: "وداعا" }
];

export default function FlashProtocol({ cards, onClose }) {
  const { settings } = useSettings();
  const [currentPair, setCurrentPair] = useState(null); 
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  const gameCards = (cards && cards.length > 2) ? cards : BACKUP_DATA;

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) { setGameOver(true); return 0; }
            return prev - 1;
        });
    }, 1000);
    nextRound();
    return () => clearInterval(timer);
  }, [gameOver]);

  const nextRound = () => {
    const isMatch = Math.random() > 0.5;
    const card1 = gameCards[Math.floor(Math.random() * gameCards.length)];
    let displayArabic = isMatch ? card1.arabic : (gameCards.filter(c => c.id !== card1.id)[0] || card1).arabic;
    setCurrentPair({ russian: card1.russian, arabic: displayArabic, isMatch });
  };

  const handleChoice = (userChoice) => {
      if(gameOver) return;
      if (userChoice === currentPair.isMatch) {
          setScore(s => s + 100);
          if (settings.soundEffects) confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      } else {
          setScore(s => Math.max(0, s - 50));
      }
      nextRound();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-[#111] border-2 border-yellow-500 rounded-3xl p-6 relative overflow-hidden">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><IconX/></button>
            {!gameOver ? (
                <>
                    <div className="flex justify-between items-center mb-8 text-yellow-500 font-bold">
                        <span className="flex items-center gap-2"><IconBolt/> FLASH PROTOCOL</span>
                        <span>{timeLeft}s</span>
                    </div>
                    <div className="text-center mb-10 space-y-4">
                        <div className="text-4xl font-black text-white">{currentPair?.russian}</div>
                        <div className="text-2xl text-gray-400">=</div>
                        <div className="text-4xl font-black text-yellow-400 dir-rtl font-cairo">{currentPair?.arabic}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleChoice(false)} className="py-6 bg-red-900/30 border border-red-500 text-red-500 rounded-xl hover:bg-red-500 hover:text-white font-bold text-xl">FALSE <IconX className="inline ml-1"/></button>
                        <button onClick={() => handleChoice(true)} className="py-6 bg-green-900/30 border border-green-500 text-green-500 rounded-xl hover:bg-green-500 hover:text-white font-bold text-xl">TRUE <IconCheck className="inline ml-1"/></button>
                    </div>
                    <div className="text-center mt-6 text-white/30 text-sm">SCORE: {score}</div>
                </>
            ) : (
                <div className="text-center py-10">
                    <IconTrophy className="text-yellow-500 w-20 h-20 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">SESSION COMPLETE</h2>
                    <p className="text-yellow-500 text-xl font-mono mb-6">FINAL SCORE: {score}</p>
                    <button onClick={() => { setGameOver(false); setScore(0); setTimeLeft(60); }} className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold">RETRY</button>
                </div>
            )}
        </div>
    </div>
  );
}