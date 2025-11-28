"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCode, IconX } from "@tabler/icons-react";
import confetti from "canvas-confetti";

const BACKUP_DATA = [{ russian: "Москва", arabic: "موسكو" }, { russian: "Вода", arabic: "ماء" }];

export default function SyntaxHack({ cards, onClose }) {
  const [currentCard, setCurrentCard] = useState(null);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  
  const gameCards = (cards && cards.length > 0) ? cards : BACKUP_DATA;

  useEffect(() => nextLevel(), []);

  const nextLevel = () => {
    const target = gameCards[Math.floor(Math.random() * gameCards.length)];
    setCurrentCard(target);
    const letters = target.russian.split('').map((char, i) => ({ id: i, char }));
    setShuffledLetters(letters.sort(() => Math.random() - 0.5));
    setUserAnswer([]);
  };

  const handleLetterClick = (letter) => {
      setShuffledLetters(prev => prev.filter(l => l.id !== letter.id));
      setUserAnswer(prev => [...prev, letter]);
  };

  const handleAnswerClick = (letter) => {
      setUserAnswer(prev => prev.filter(l => l.id !== letter.id));
      setShuffledLetters(prev => [...prev, letter]);
  };

  const checkResult = () => {
      const currentWord = userAnswer.map(l => l.char).join('');
      if (currentWord.toLowerCase() === currentCard.russian.toLowerCase()) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setTimeout(nextLevel, 1000);
      } else {
          setUserAnswer([]);
          const letters = currentCard.russian.split('').map((char, i) => ({ id: i, char }));
          setShuffledLetters(letters.sort(() => Math.random() - 0.5));
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
            <div className="flex justify-between mb-12">
                <h2 className="text-purple-500 font-black tracking-widest flex gap-2"><IconCode/> SYNTAX HACK</h2>
                <button onClick={onClose}><IconX className="text-white/50 hover:text-white"/></button>
            </div>
            <div className="text-center mb-8">
                <p className="text-white/40 uppercase text-xs tracking-[0.3em] mb-2">Decipher Translation</p>
                <h1 className="text-4xl font-bold text-white font-cairo dir-rtl">{currentCard?.arabic}</h1>
            </div>
            <div className="min-h-[80px] bg-white/5 border border-purple-500/30 rounded-2xl flex flex-wrap items-center justify-center gap-2 p-4 mb-8">
                <AnimatePresence>
                    {userAnswer.map(l => (
                        <motion.button layoutId={l.id} key={l.id} onClick={() => handleAnswerClick(l)} className="w-12 h-12 bg-purple-600 rounded-lg font-bold text-xl text-white flex items-center justify-center shadow-lg">
                            {l.char}
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {shuffledLetters.map(l => (
                    <motion.button layoutId={l.id} key={l.id} onClick={() => handleLetterClick(l)} className="w-12 h-12 bg-gray-800 border border-white/10 rounded-lg font-bold text-xl text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                        {l.char}
                    </motion.button>
                ))}
            </div>
            <button onClick={checkResult} className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">EXECUTE CODE</button>
        </div>
    </div>
  );
}