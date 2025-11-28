"use client";
import React, { useState, useEffect, useRef } from "react";
import { IconX, IconBomb, IconCloudRain } from "@tabler/icons-react";

// بيانات احتياطية
const DEFAULT_WORDS = ["Где", "Кто", "Что", "Там", "Тут", "Как", "Да", "Нет", "Мир", "Дом"];

export default function DataRain({ cards, onClose }) {
  const [drops, setDrops] = useState([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const requestRef = useRef();
  
  // استخدام البيانات الافتراضية إذا كانت الكروت فارغة
  const playableWords = (cards && cards.length > 0) ? cards.map(c => c.russian) : DEFAULT_WORDS;

  useEffect(() => {
    if(gameOver) return;
    const spawnInterval = setInterval(() => {
        const randomWord = playableWords[Math.floor(Math.random() * playableWords.length)];
        setDrops(prev => [...prev, {
            id: Date.now() + Math.random(),
            word: randomWord,
            x: Math.random() * 80 + 5,
            y: -15,
            speed: Math.random() * 0.1 + 0.05
        }]);
    }, 2000);
    return () => clearInterval(spawnInterval);
  }, [gameOver, cards]);

  useEffect(() => {
    const animate = () => {
        if (!gameOver) {
            setDrops(prevDrops => {
                const newDrops = prevDrops.map(d => ({ ...d, y: d.y + d.speed }));
                const hitBottom = newDrops.some(d => d.y > 90);
                if (hitBottom) { setGameOver(true); return prevDrops; }
                return newDrops;
            });
            requestRef.current = requestAnimationFrame(animate);
        }
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameOver]);

  const checkInput = (e) => {
      const val = e.target.value;
      setInput(val);
      const matchIndex = drops.findIndex(d => d.word.toLowerCase().trim() === val.toLowerCase().trim());
      if (matchIndex !== -1) {
          setDrops(prev => prev.filter((_, i) => i !== matchIndex));
          setScore(s => s + 50);
          setInput("");
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-hidden font-mono select-none">
        <div className="absolute inset-0 bg-pink-900/5 pointer-events-none"></div>
        <div className="absolute top-4 left-4 text-pink-500 font-bold z-20 text-2xl flex items-center gap-2"><IconCloudRain className="animate-pulse" /> SCORE: {score}</div>
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-20 bg-white/10 p-2 rounded hover:bg-red-600 transition-colors"><IconX/></button>

        {!gameOver ? (
            <>
                {drops.map(drop => (
                    <div key={drop.id} style={{ left: `${drop.x}%`, top: `${drop.y}%` }} className="absolute text-pink-300 font-bold text-lg bg-black/70 px-3 py-1 rounded border border-pink-500/30 whitespace-nowrap shadow-[0_0_10px_rgba(236,72,153,0.3)] backdrop-blur-sm">
                        {drop.word}
                    </div>
                ))}
                <div className="absolute bottom-[10%] w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_20px_red] opacity-80"></div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-20 px-4">
                    <input autoFocus value={input} onChange={checkInput} placeholder="TYPE WORD..." className="w-full bg-black/80 border-2 border-pink-500 p-4 text-center text-white outline-none rounded-full shadow-[0_0_30px_#ec4899] uppercase font-bold text-xl" />
                </div>
            </>
        ) : (
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-30 animate-in zoom-in duration-300">
                <IconBomb size={100} className="text-red-500 mb-6 animate-bounce"/>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-2">SYSTEM <span className="text-red-600">BREACHED</span></h1>
                <p className="text-pink-500 mb-8 font-mono text-lg">FINAL SCORE: {score}</p>
                <div className="flex gap-4">
                    <button onClick={() => { setGameOver(false); setDrops([]); setScore(0); setInput(""); }} className="bg-pink-600 text-white px-10 py-4 rounded-xl font-black hover:bg-pink-500">REBOOT</button>
                    <button onClick={onClose} className="border-2 border-pink-600 text-pink-600 px-10 py-4 rounded-xl font-black hover:bg-pink-600/10">ABORT</button>
                </div>
            </div>
        )}
    </div>
  );
}