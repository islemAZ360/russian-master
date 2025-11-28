"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCpu, IconSkull, IconTerminal, IconPlayerPlay, IconX } from "@tabler/icons-react";
import confetti from "canvas-confetti";
import { useAudio } from "../hooks/useAudio"; 

// بيانات احتياطية لتعمل اللعبة فوراً
const DEFAULT_DATA = [
    { russian: "Привет", arabic: "مرحبا" },
    { russian: "Как дела", arabic: "كيف الحال" },
    { russian: "Спасибо", arabic: "شكرا" },
    { russian: "Друг", arabic: "صديق" },
    { russian: "Вода", arabic: "ماء" },
    { russian: "Хлеб", arabic: "خبز" },
    { russian: "Машина", arabic: "سيارة" },
    { russian: "Дом", arabic: "منزل" }
];

export default function HackingGame({ cards, onClose }) {
  const [gameState, setGameState] = useState("start");
  const [currentWord, setCurrentWord] = useState(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [health, setHealth] = useState(100);
  const inputRef = useRef(null);
  const { playSFX } = useAudio();

  // دمج بيانات المستخدم مع البيانات الاحتياطية
  const playableCards = (cards && cards.length > 0) ? cards : DEFAULT_DATA;

  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0 && health > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (gameState === "playing" && (timeLeft === 0 || health <= 0)) {
      setGameState("gameover");
      playSFX("error");
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, health, playSFX]);

  useEffect(() => {
    if (gameState === "playing" && inputRef.current) inputRef.current.focus();
  }, [gameState, currentWord]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setHealth(100);
    nextWord();
    playSFX("click");
  };

  const nextWord = () => {
    const random = playableCards[Math.floor(Math.random() * playableCards.length)];
    setCurrentWord(random);
    setInput("");
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    if (!currentWord) return;
    const cleanInput = input.trim().toLowerCase();
    const cleanTarget = currentWord.arabic.trim().toLowerCase();
    
    if (cleanInput === cleanTarget || cleanInput === currentWord.russian.toLowerCase()) {
      playSFX("success");
      setScore(s => s + 100 + (timeLeft * 2));
      setTimeLeft(t => Math.min(t + 5, 60));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      nextWord();
    } else {
      playSFX("error");
      setHealth(h => Math.max(0, h - 25));
      setInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center font-mono overflow-hidden">
      <div className="absolute inset-0 bg-green-900/10 pointer-events-none scanlines"></div>
      <button onClick={onClose} className="absolute top-6 right-6 text-green-500 hover:text-red-500 z-50"><IconX size={32} /></button>

      <AnimatePresence mode="wait">
        {gameState === "start" && (
          <motion.div key="start" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="z-10 text-center space-y-6 p-8 border-2 border-green-500 bg-black/90 shadow-[0_0_50px_#00ff00] max-w-md w-full">
            <IconTerminal size={80} className="mx-auto text-green-500 animate-pulse" />
            <h1 className="text-4xl font-black text-green-500 glitch-text">NEURAL BREACH</h1>
            <p className="text-green-500/50 text-xs uppercase">Target Database: {playableCards.length} Words</p>
            <button onClick={startGame} className="w-full py-4 bg-green-900/20 border border-green-500 text-green-500 font-bold uppercase hover:bg-green-500 hover:text-black transition-all flex justify-center gap-2"><IconPlayerPlay/> INITIALIZE</button>
          </motion.div>
        )}

        {gameState === "playing" && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="z-10 w-full max-w-2xl p-6 relative">
            <div className="flex justify-between items-end mb-8 border-b-2 border-green-500/50 pb-4">
                <div><div className="text-xs text-green-500 uppercase">Score</div><div className="text-4xl font-black text-green-500">{score}</div></div>
                <div className="text-right"><div className="text-xs text-red-500 uppercase">Time</div><div className={`text-4xl font-black ${timeLeft < 10 ? 'text-red-500 animate-ping' : 'text-green-500'}`}>00:{timeLeft}</div></div>
            </div>
            <div className="mb-12 text-center py-10 bg-green-900/10 border border-green-500/30 rounded-lg">
                <h2 className="text-5xl md:text-6xl font-black text-white">{currentWord?.russian}</h2>
            </div>
            <div className="w-full h-2 bg-gray-900 mb-6 rounded-full overflow-hidden border border-gray-700">
                <motion.div animate={{ width: `${health}%` }} className={`h-full ${health > 50 ? 'bg-green-500' : 'bg-red-600'}`} />
            </div>
            <form onSubmit={checkAnswer}>
                <input ref={inputRef} autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type meaning..." className="w-full bg-black border-2 border-green-500/50 p-6 text-2xl text-center text-green-400 outline-none focus:border-green-400 font-bold dir-rtl font-cairo" />
            </form>
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div key="gameover" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="z-10 text-center space-y-6 bg-red-950/90 p-10 border-4 border-red-600 shadow-[0_0_50px_#ff0000] max-w-md w-full">
            <IconSkull size={80} className="mx-auto text-red-500 animate-bounce" />
            <h1 className="text-5xl font-black text-red-500">FAILED</h1>
            <div className="text-6xl font-black text-white">{score}</div>
            <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-6 py-3 bg-white text-red-900 font-black">RETRY</button>
                <button onClick={onClose} className="px-6 py-3 border border-red-500 text-red-500 font-bold">EXIT</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}