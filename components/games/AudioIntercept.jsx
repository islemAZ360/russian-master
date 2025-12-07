"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconEar, IconX, IconVolume } from "@tabler/icons-react";
import confetti from "canvas-confetti";

export default function AudioIntercept({ cards, onClose }) {
  const [currentCard, setCurrentCard] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => nextRound(), []);

  const playAudio = () => {
    if(!currentCard) return;
    setIsPlaying(true);
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(currentCard.russian);
    u.lang = 'ru-RU';
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  const nextRound = () => {
    const valid = cards.filter(c => c.russian && c.arabic);
    if(valid.length < 4) return alert("Not enough data");
    
    const target = valid[Math.floor(Math.random() * valid.length)];
    setCurrentCard(target);

    // خيارات عشوائية (1 صحيح + 3 خطأ)
    const others = valid.filter(c => c.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    const all = [target, ...others].sort(() => 0.5 - Math.random());
    setOptions(all);
    
    // تشغيل الصوت تلقائياً بعد قليل
    setTimeout(() => {
        const u = new SpeechSynthesisUtterance(target.russian);
        u.lang = 'ru-RU';
        window.speechSynthesis.speak(u);
    }, 500);
  };

  const checkAnswer = (selected) => {
    if(selected.id === currentCard.id) {
        setScore(s => s + 100);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        nextRound();
    } else {
        setScore(s => Math.max(0, s - 50));
        // اهتزاز
        document.getElementById('audio-game').classList.add('animate-shake');
        setTimeout(() => document.getElementById('audio-game').classList.remove('animate-shake'), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
        <div id="audio-game" className="w-full max-w-lg bg-[#111] border-2 border-yellow-500 rounded-2xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white"><IconX/></button>
            
            <div className="text-center mb-8">
                <h2 className="text-yellow-500 font-black tracking-widest text-2xl mb-2">AUDIO INTERCEPT</h2>
                <div className="text-4xl font-mono text-white">{score} XP</div>
            </div>

            <button 
                onClick={playAudio}
                className={`w-32 h-32 mx-auto rounded-full border-4 border-yellow-500 flex items-center justify-center mb-8 hover:scale-105 transition-all ${isPlaying ? 'animate-pulse bg-yellow-500/20' : 'bg-transparent'}`}
            >
                <IconEar size={64} className="text-yellow-500"/>
            </button>

            <div className="grid grid-cols-1 gap-3">
                {options.map(opt => (
                    <button 
                        key={opt.id} 
                        onClick={() => checkAnswer(opt)}
                        className="p-4 border border-white/10 bg-white/5 rounded-xl hover:bg-yellow-500 hover:text-black hover:font-bold transition-all text-center"
                    >
                        {opt.arabic}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
}