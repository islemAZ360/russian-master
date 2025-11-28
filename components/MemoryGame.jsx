"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconBrain, IconRefresh, IconX } from "@tabler/icons-react";
import confetti from "canvas-confetti";

const DEFAULT_DATA = [
    { id: 'd1', russian: "Кот", arabic: "قطة" },
    { id: 'd2', russian: "Собака", arabic: "كلب" },
    { id: 'd3', russian: "Дом", arabic: "منزل" },
    { id: 'd4', russian: "Мир", arabic: "سلام" },
    { id: 'd5', russian: "Друг", arabic: "صديق" },
    { id: 'd6', russian: "Небо", arabic: "سماء" }
];

export default function MemoryGame({ cards, onClose }) {
  const [gameCards, setGameCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => { initializeGame(); }, []);

  const initializeGame = () => {
    // استخدام بيانات المستخدم أو البيانات الافتراضية
    let validCards = (cards && cards.length >= 2) ? cards : DEFAULT_DATA;
    
    // نأخذ عينة
    const sample = validCards.sort(() => 0.5 - Math.random()).slice(0, 6);

    const deck = sample.flatMap(item => [
        { id: `${item.id || item.russian}-ru`, content: item.russian, pairId: item.id || item.russian, type: 'ru' },
        { id: `${item.id || item.russian}-ar`, content: item.arabic, pairId: item.id || item.russian, type: 'ar' }
    ]).sort(() => Math.random() - 0.5);

    setGameCards(deck);
    setFlipped([]);
    setSolved([]);
    setWon(false);
    setDisabled(false);
  };

  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;
    if (flipped.length === 0) {
      setFlipped([id]);
      return;
    }
    if (flipped.length === 1) {
      setDisabled(true);
      setFlipped([flipped[0], id]);
      checkForMatch(flipped[0], id);
    }
  };

  const checkForMatch = (id1, id2) => {
    const card1 = gameCards.find(c => c.id === id1);
    const card2 = gameCards.find(c => c.id === id2);
    if (card1.pairId === card2.pairId) {
      setSolved(prev => [...prev, id1, id2]);
      setFlipped([]);
      setDisabled(false);
      if (solved.length + 2 === gameCards.length) {
          setTimeout(() => { setWon(true); confetti(); }, 500);
      }
    } else {
      setTimeout(() => { setFlipped([]); setDisabled(false); }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center p-4">
      <div className="flex justify-between w-full max-w-4xl mb-8 items-center z-10">
        <h2 className="text-3xl font-black text-purple-500 tracking-widest flex items-center gap-2"><IconBrain size={32}/> MEMORY CORE</h2>
        <button onClick={onClose} className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white"><IconX/></button>
      </div>
      {!won ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl w-full z-10">
            {gameCards.map((card) => {
                const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
                const isSolved = solved.includes(card.id);
                return (
                    <motion.div key={card.id} initial={{ rotateY: 0 }} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.3 }} onClick={() => handleClick(card.id)} className="relative h-24 md:h-32 cursor-pointer perspective-1000">
                        <div className="absolute inset-0 bg-gray-900 border-2 border-purple-500/30 rounded-xl flex items-center justify-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}><IconBrain className="text-purple-500/20" size={30}/></div>
                        <div className={`absolute inset-0 rounded-xl flex items-center justify-center p-2 text-center text-sm font-bold border-2 backface-hidden transition-colors ${isSolved ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-purple-900/40 border-purple-500 text-white'}`} style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden' }}>{card.content}</div>
                    </motion.div>
                );
            })}
        </div>
      ) : (
        <div className="text-center z-10 animate-in zoom-in duration-500 bg-purple-900/20 p-10 rounded-3xl border border-purple-500">
            <h1 className="text-6xl font-black text-green-500 mb-4">DATA SYNCED</h1>
            <button onClick={initializeGame} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 mx-auto"><IconRefresh/> REPLAY</button>
        </div>
      )}
    </div>
  );
}