"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconAbc, IconCheck, IconX, IconRefresh } from "@tabler/icons-react";
import confetti from "canvas-confetti";

export default function ScrambleGame({ cards, onClose }) {
  const [currentCard, setCurrentCard] = useState(null);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [message, setMessage] = useState(null); // 'correct' | 'wrong'

  useEffect(() => nextWord(), []);

  const nextWord = () => {
    const valid = cards.filter(c => c.russian && c.russian.length > 3);
    if(valid.length === 0) return;
    const random = valid[Math.floor(Math.random() * valid.length)];
    
    setCurrentCard(random);
    const letters = random.russian.split('').map((l, i) => ({ id: i, char: l }));
    setShuffledLetters(letters.sort(() => Math.random() - 0.5));
    setUserAnswer([]);
    setMessage(null);
  };

  const handleSelect = (letter) => {
    setShuffledLetters(prev => prev.filter(l => l.id !== letter.id));
    setUserAnswer(prev => [...prev, letter]);
  };

  const handleDeselect = (letter) => {
    setUserAnswer(prev => prev.filter(l => l.id !== letter.id));
    setShuffledLetters(prev => [...prev, letter]);
  };

  const checkAnswer = () => {
    const formed = userAnswer.map(l => l.char).join('');
    if (formed.toLowerCase() === currentCard.russian.toLowerCase()) {
      setMessage('correct');
      confetti({ particleCount: 100, origin: { y: 0.6 } });
      setTimeout(nextWord, 1500);
    } else {
      setMessage('wrong');
      setTimeout(() => setMessage(null), 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-6 font-mono">
      <div className="absolute inset-0 bg-blue-900/10 pointer-events-none scanlines"></div>
      
      {/* Header */}
      <div className="flex justify-between w-full max-w-2xl mb-12 items-center z-10">
        <h2 className="text-2xl font-black text-blue-500 tracking-widest flex items-center gap-2">
            <IconAbc size={28}/> CRYPTIC CIPHER
        </h2>
        <button onClick={onClose} className="text-white/50 hover:text-red-500"><IconX/></button>
      </div>

      <div className="text-center w-full max-w-2xl z-10">
        <p className="text-white/50 mb-2 uppercase tracking-widest text-sm">Decipher this meaning:</p>
        <h3 className="text-3xl text-white mb-10 font-cairo dir-rtl">{currentCard?.arabic}</h3>

        {/* منطقة الإجابة */}
        <div className={`min-h-[80px] border-b-2 ${message === 'correct' ? 'border-green-500' : message === 'wrong' ? 'border-red-500' : 'border-blue-500/50'} flex items-center justify-center gap-2 mb-10 flex-wrap p-4 transition-colors`}>
            {userAnswer.map(l => (
                <motion.button 
                    layoutId={l.id} 
                    key={l.id} 
                    onClick={() => handleDeselect(l)}
                    className="w-10 h-10 bg-blue-600 rounded text-white font-bold text-xl flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                    {l.char}
                </motion.button>
            ))}
        </div>

        {/* الحروف المبعثرة */}
        <div className="flex gap-2 justify-center flex-wrap mb-12">
            {shuffledLetters.map(l => (
                <motion.button 
                    layoutId={l.id} 
                    key={l.id} 
                    onClick={() => handleSelect(l)}
                    className="w-12 h-12 bg-white/10 border border-white/20 rounded text-blue-400 font-bold text-xl flex items-center justify-center hover:bg-blue-500/20 hover:scale-110 transition-all"
                >
                    {l.char}
                </motion.button>
            ))}
        </div>

        <div className="flex gap-4 justify-center">
            <button onClick={checkAnswer} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-[0_0_20px_#2563eb] hover:scale-105 transition-transform">DECRYPT</button>
            <button onClick={nextWord} className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20"><IconRefresh/></button>
        </div>
      </div>
    </div>
  );
}