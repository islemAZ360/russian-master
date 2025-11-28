"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCpu, IconSkull, IconTerminal, IconKeyboard, IconPlayerPlay, IconX } from "@tabler/icons-react";
import confetti from "canvas-confetti";
import { useAudio } from "../hooks/useAudio"; 

export default function HackingGame({ cards, onClose }) {
  const [gameState, setGameState] = useState("start"); // start, playing, gameover
  const [currentWord, setCurrentWord] = useState(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [health, setHealth] = useState(100);
  const inputRef = useRef(null);
  
  // استدعاء الصوتيات
  const { playSFX } = useAudio();

  // تصفية الكلمات الصالحة للعب (يجب أن تحتوي على روسي وعربي)
  const playableCards = cards.filter(c => c.russian && c.arabic);

  // منطق المؤقت ونهاية اللعبة
  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0 && health > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (gameState === "playing" && (timeLeft === 0 || health <= 0)) {
      setGameState("gameover");
      playSFX("error");
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, health, playSFX]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setHealth(100);
    nextWord();
    playSFX("click");
  };

  const nextWord = () => {
    if (playableCards.length === 0) return;
    const random = playableCards[Math.floor(Math.random() * playableCards.length)];
    setCurrentWord(random);
    setInput("");
    // التركيز التلقائي على حقل الإدخال
    setTimeout(() => {
        if(inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const checkAnswer = (e) => {
    e.preventDefault();
    if (!currentWord) return;

    // تنظيف النصوص للمقارنة (حذف المسافات وتحويل لحروف صغيرة)
    const normalize = (text) => text ? text.trim().toLowerCase() : "";
    
    if (normalize(input) === normalize(currentWord.arabic)) {
      // إجابة صحيحة
      playSFX("success");
      setScore(s => s + 100 + (timeLeft * 2)); // بونص للسرعة
      setTimeLeft(t => Math.min(t + 5, 60)); // زيادة الوقت
      
      // تأثير القصاصات
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 }, colors: ['#00ff00', '#000000'] });
      nextWord();
    } else {
      // إجابة خاطئة
      playSFX("error");
      setHealth(h => Math.max(0, h - 25)); // خصم الصحة
      setInput("");
      
      // اهتزاز الشاشة
      const gameContainer = document.getElementById("hacking-container");
      if(gameContainer) {
          gameContainer.classList.add("animate-shake");
          setTimeout(() => gameContainer.classList.remove("animate-shake"), 500);
      }
    }
  };

  // إذا لم تكن هناك كلمات
  if (playableCards.length === 0) {
      return (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center text-red-500 font-mono">
              <div className="text-center">
                  <IconSkull size={64} className="mx-auto mb-4"/>
                  <h2>NO DATA FOUND</h2>
                  <p>Please add words to the Archive first.</p>
                  <button onClick={onClose} className="mt-4 border border-red-500 px-4 py-2 hover:bg-red-500 hover:text-white">CLOSE</button>
              </div>
          </div>
      )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center font-mono overflow-hidden">
      
      {/* الخلفيات والمؤثرات */}
      <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif')] opacity-5 bg-cover pointer-events-none"></div>
      <div className="absolute inset-0 bg-green-900/5 pointer-events-none scanlines"></div>
      
      {/* زر الخروج في الأعلى */}
      <button onClick={onClose} className="absolute top-6 right-6 text-green-500/50 hover:text-red-500 z-50 transition-colors">
          <IconX size={32} />
      </button>

      <AnimatePresence mode="wait">
        
        {/* --- 1. شاشة البداية --- */}
        {gameState === "start" && (
          <motion.div 
            key="start"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)" }}
            className="z-10 text-center space-y-6 p-8 border-2 border-green-500 bg-black/90 shadow-[0_0_50px_#00ff00] max-w-md w-full mx-4"
          >
            <IconTerminal size={80} className="mx-auto text-green-500 animate-pulse" />
            <div>
                <h1 className="text-4xl md:text-5xl font-black text-green-500 tracking-widest glitch-text mb-2" data-text="NEURAL BREACH">NEURAL BREACH</h1>
                <p className="text-green-400/60 uppercase text-xs tracking-[0.5em]">System Vulnerable. Inject Code.</p>
            </div>
            
            <button 
                onClick={startGame}
                className="group relative w-full py-4 bg-green-900/20 border border-green-500 text-green-500 font-bold uppercase tracking-widest hover:bg-green-500 hover:text-black transition-all overflow-hidden"
            >
                <span className="relative z-10 flex items-center justify-center gap-2"><IconPlayerPlay/> INITIATE HACK</span>
                <div className="absolute inset-0 bg-green-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </motion.div>
        )}

        {/* --- 2. شاشة اللعب --- */}
        {gameState === "playing" && (
          <motion.div 
            key="playing"
            id="hacking-container"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="z-10 w-full max-w-2xl p-6 relative"
          >
            {/* HUD العلوي */}
            <div className="flex justify-between items-end mb-8 border-b-2 border-green-500/50 pb-4">
                <div>
                    <div className="text-xs text-green-500/50 uppercase tracking-widest">Score Data</div>
                    <div className="text-4xl font-black text-green-500 font-sans">{score.toString().padStart(6, '0')}</div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-red-500/50 uppercase tracking-widest animate-pulse">Time Remaining</div>
                    <div className={`text-4xl font-black font-sans ${timeLeft < 10 ? 'text-red-500 animate-ping' : 'text-green-500'}`}>
                        00:{timeLeft.toString().padStart(2, '0')}
                    </div>
                </div>
            </div>

            {/* منطقة الكلمة (المشفرة) */}
            <div className="relative mb-12 text-center py-10 bg-green-900/10 border border-green-500/30 rounded-lg overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-[loading_2s_linear_infinite]"></div>
                
                <h2 className="text-5xl md:text-7xl font-black text-white glitch-text relative z-10 font-sans" data-text={currentWord?.russian}>
                    {currentWord?.russian}
                </h2>
                
                <div className="absolute top-2 right-2 text-[10px] text-green-500 border border-green-500 px-2 rounded uppercase">
                    {currentWord?.category || "UNKNOWN"}
                </div>
            </div>

            {/* شريط الصحة */}
            <div className="w-full h-2 bg-gray-900 mb-6 rounded-full overflow-hidden border border-gray-700">
                <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: `${health}%` }}
                    className={`h-full ${health > 50 ? 'bg-green-500' : 'bg-red-600'} shadow-[0_0_10px_currentColor]`}
                />
            </div>

            {/* الإدخال */}
            <form onSubmit={checkAnswer} className="relative group">
                <input 
                    ref={inputRef}
                    autoFocus
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="DECRYPT_TRANSLATION..."
                    className="w-full bg-black border-2 border-green-500/50 p-6 text-2xl text-center text-green-400 outline-none focus:border-green-400 focus:shadow-[0_0_30px_rgba(0,255,0,0.3)] placeholder:text-green-900 font-bold dir-rtl font-cairo transition-all"
                />
                <IconKeyboard className="absolute right-4 top-1/2 -translate-y-1/2 text-green-700 animate-pulse pointer-events-none" size={30}/>
            </form>

          </motion.div>
        )}

        {/* --- 3. شاشة الخسارة --- */}
        {gameState === "gameover" && (
          <motion.div 
            key="gameover"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="z-10 text-center space-y-6 bg-red-950/90 p-10 border-4 border-red-600 shadow-[0_0_100px_#ff0000] relative overflow-hidden max-w-md w-full mx-4"
          >
            <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/L20mbc7qR5f9u/giphy.gif')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            <IconSkull size={80} className="mx-auto text-red-500 animate-bounce" />
            
            <div>
                <h1 className="text-5xl font-black text-red-500 tracking-tighter mb-2">SYSTEM FAILURE</h1>
                <p className="text-red-300 font-mono text-sm">NEURAL LINK TERMINATED</p>
            </div>

            <div className="py-4 border-y border-red-500/30 my-4">
                <div className="text-xs text-red-400 uppercase tracking-widest">Final Score</div>
                <div className="text-6xl font-black text-white font-sans">{score}</div>
            </div>

            <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-6 py-3 bg-white text-red-900 font-black hover:scale-105 transition-transform uppercase text-sm">Reboot System</button>
                <button onClick={onClose} className="px-6 py-3 border border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-colors uppercase text-sm">Exit</button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}