"use client";
import React, { useState, useEffect, useRef } from "react";
import { IconX, IconBomb, IconCloudRain } from "@tabler/icons-react";

export default function DataRain({ cards, onClose }) {
  const [drops, setDrops] = useState([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // نستخدم المراجع لحفظ معرف الأنيميشن لإيقافه عند الخروج أو الخسارة
  const requestRef = useRef();
  
  // --- 1. مولد الكلمات (Spawner) ---
  useEffect(() => {
    if(gameOver) return;

    const spawnInterval = setInterval(() => {
        // نختار فقط البطاقات التي تحتوي على كلمة روسية
        const valid = cards.filter(c => c.russian);
        if(valid.length === 0) return;
        
        const randomCard = valid[Math.floor(Math.random() * valid.length)];
        
        // إضافة قطرة جديدة
        setDrops(prev => [...prev, {
            id: Date.now() + Math.random(), // معرف فريد
            word: randomCard.russian,
            x: Math.random() * 80 + 5, // موقع عشوائي بين 5% و 85% من العرض
            y: -15, // تبدأ من فوق الشاشة
            speed: Math.random() * 0.1 + 0.05 // سرعة عشوائية متفاوتة
        }]);

    }, 2000); // كلمة جديدة كل ثانيتين (يمكنك تقليل الرقم لزيادة الصعوبة)

    return () => clearInterval(spawnInterval);
  }, [gameOver, cards]);

  // --- 2. محرك اللعبة (Game Loop) ---
  useEffect(() => {
    const animate = () => {
        if (!gameOver) {
            setDrops(prevDrops => {
                // تحريك كل قطرة للأسفل بناءً على سرعتها
                const newDrops = prevDrops.map(d => ({ ...d, y: d.y + d.speed }));
                
                // التحقق من الخسارة (هل وصلت أي قطرة للأسفل؟)
                // 90% هو موقع الخط الأحمر
                const hitBottom = newDrops.some(d => d.y > 90);
                
                if (hitBottom) {
                    setGameOver(true);
                    return prevDrops; // تجميد الحركة
                }
                
                return newDrops;
            });
            
            // طلب الإطار التالي
            requestRef.current = requestAnimationFrame(animate);
        }
    };

    // بدء الحلقة
    requestRef.current = requestAnimationFrame(animate);

    // تنظيف عند الخروج
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameOver]);

  // --- 3. معالج الإدخال ---
  const checkInput = (e) => {
      const val = e.target.value;
      setInput(val);
      
      // البحث عن الكلمة المطابقة (تجاهل حالة الأحرف والمسافات)
      const matchIndex = drops.findIndex(d => 
          d.word.toLowerCase().trim() === val.toLowerCase().trim()
      );
      
      if (matchIndex !== -1) {
          // إذا وجدنا تطابق:
          // 1. نحذف الكلمة من الشاشة
          setDrops(prev => prev.filter((_, i) => i !== matchIndex));
          // 2. نزيد النقاط
          setScore(s => s + 50);
          // 3. نفرغ حقل الإدخال
          setInput("");
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-hidden font-mono select-none">
        
        {/* خلفية جمالية خفيفة */}
        <div className="absolute inset-0 bg-pink-900/5 pointer-events-none"></div>
        
        {/* واجهة المستخدم العلوية (HUD) */}
        <div className="absolute top-4 left-4 text-pink-500 font-bold z-20 text-2xl flex items-center gap-2">
            <IconCloudRain className="animate-pulse" /> SCORE: {score}
        </div>
        
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-white z-20 bg-white/10 p-2 rounded hover:bg-red-600 transition-colors"
        >
            <IconX/>
        </button>

        {!gameOver ? (
            <>
                {/* رسم الكلمات المتساقطة */}
                {drops.map(drop => (
                    <div 
                        key={drop.id}
                        style={{ left: `${drop.x}%`, top: `${drop.y}%` }}
                        className="absolute text-pink-300 font-bold text-lg bg-black/70 px-3 py-1 rounded border border-pink-500/30 whitespace-nowrap shadow-[0_0_10px_rgba(236,72,153,0.3)] backdrop-blur-sm transition-transform will-change-transform"
                    >
                        {drop.word}
                    </div>
                ))}
                
                {/* خط الخطر (Danger Line) */}
                <div className="absolute bottom-[10%] w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent shadow-[0_0_20px_red] opacity-80"></div>
                <div className="absolute bottom-[10%] right-2 text-red-500 text-[10px] uppercase tracking-widest">System Failure Threshold</div>

                {/* حقل الإدخال */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-20 px-4">
                    <input 
                        autoFocus
                        value={input}
                        onChange={checkInput}
                        placeholder="TYPE WORD TO DESTROY..."
                        className="w-full bg-black/80 border-2 border-pink-500 p-4 text-center text-white outline-none rounded-full shadow-[0_0_30px_#ec4899] uppercase font-bold text-xl placeholder:text-pink-500/30 focus:scale-105 transition-transform"
                    />
                </div>
            </>
        ) : (
            // شاشة الخسارة (Game Over Screen)
            <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-30 animate-in zoom-in duration-300">
                <IconBomb size={100} className="text-red-500 mb-6 animate-bounce"/>
                
                <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter">
                    SYSTEM <span className="text-red-600">BREACHED</span>
                </h1>
                
                <p className="text-pink-500 mb-8 font-mono tracking-widest text-lg">
                    FINAL SCORE DATA: <span className="text-white font-bold">{score}</span>
                </p>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => { setGameOver(false); setDrops([]); setScore(0); setInput(""); }} 
                        className="bg-pink-600 text-white px-10 py-4 rounded-xl font-black hover:bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all transform hover:scale-105"
                    >
                        REBOOT SYSTEM
                    </button>
                    
                    <button 
                        onClick={onClose} 
                        className="border-2 border-pink-600 text-pink-600 px-10 py-4 rounded-xl font-black hover:bg-pink-600/10 transition-all"
                    >
                        ABORT
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}