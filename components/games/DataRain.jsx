"use client";
import React, { useState, useEffect, useRef } from "react";
import { IconCloudRain, IconX, IconBomb } from "@tabler/icons-react";

export default function DataRain({ cards, onClose }) {
  const [drops, setDrops] = useState([]); // الكلمات الساقطة
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameRef = useRef(null);

  // حلقة اللعبة (Game Loop)
  useEffect(() => {
    if (gameOver) return;

    const spawner = setInterval(() => {
        const valid = cards.filter(c => c.russian && c.arabic);
        const random = valid[Math.floor(Math.random() * valid.length)];
        const newDrop = {
            id: Date.now(),
            word: random,
            x: Math.random() * 80 + 10, // موقع أفقي عشوائي
            y: -10 // يبدأ من الأعلى
        };
        setDrops(prev => [...prev, newDrop]);
    }, 2000); // كلمة كل ثانيتين

    const mover = setInterval(() => {
        setDrops(prev => prev.map(d => ({ ...d, y: d.y + 0.5 })).filter(d => {
            if (d.y > 90) { // وصل للأرض
                setGameOver(true);
                return false;
            }
            return true;
        }));
    }, 50);

    return () => { clearInterval(spawner); clearInterval(mover); };
  }, [gameOver, cards]);

  const checkInput = (e) => {
      const val = e.target.value;
      setInput(val);
      
      const matchIndex = drops.findIndex(d => d.word.russian.toLowerCase() === val.toLowerCase().trim());
      if (matchIndex !== -1) {
          // تدمير الكلمة
          const newDrops = [...drops];
          newDrops.splice(matchIndex, 1);
          setDrops(newDrops);
          setScore(s => s + 50);
          setInput("");
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-hidden font-mono">
        <div className="absolute inset-0 bg-pink-900/5 pointer-events-none"></div>
        
        {/* واجهة اللعبة */}
        <div className="absolute top-4 left-4 text-pink-500 font-bold z-20 text-2xl">SCORE: {score}</div>
        <button onClick={onClose} className="absolute top-4 right-4 text-white z-20"><IconX/></button>

        {/* الكلمات الساقطة */}
        {drops.map(drop => (
            <div 
                key={drop.id}
                style={{ left: `${drop.x}%`, top: `${drop.y}%` }}
                className="absolute text-pink-400 font-bold text-lg bg-black/50 px-2 rounded border border-pink-500/30 transition-all duration-75"
            >
                {drop.word.russian}
            </div>
        ))}

        {/* منطقة الخطر */}
        <div className="absolute bottom-0 w-full h-1 bg-red-600 shadow-[0_0_20px_red]"></div>

        {/* الإدخال */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md z-20">
            <input 
                autoFocus
                value={input}
                onChange={checkInput}
                placeholder="TYPE TO DESTROY..."
                className="w-full bg-black/80 border-2 border-pink-500 p-4 text-center text-white outline-none rounded-full shadow-[0_0_30px_#ec4899] uppercase"
            />
        </div>

        {/* شاشة الخسارة */}
        {gameOver && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30">
                <IconBomb size={80} className="text-red-500 mb-4 animate-bounce"/>
                <h1 className="text-5xl font-black text-white mb-2">SYSTEM BREACHED</h1>
                <p className="text-pink-500 mb-6">The data rain was too strong.</p>
                <button onClick={() => { setGameOver(false); setDrops([]); setScore(0); }} className="bg-pink-600 text-white px-8 py-3 rounded font-bold">REBOOT</button>
            </div>
        )}
    </div>
  );
}