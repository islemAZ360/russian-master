"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { IconX, IconAward } from "@tabler/icons-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";

export default function TimeTraveler({ onClose }) {
  const { t, dir, isRTL } = useLanguage();
  
  const hHandRef = useRef(null);
  const mHandRef = useRef(null);
  const sHandRef = useRef(null);
  const dialRef = useRef(null);

  const [isQuiz, setIsQuiz] = useState(false);
  const [displayTime, setDisplayTime] = useState("12:00");
  const [russianText, setRussianText] = useState("");
  const [quizOptions, setQuizOptions] = useState([]);
  const [correctOption, setCorrectOption] = useState("");

  const tMins = useRef(720);
  const isDragging = useRef(false);

  // --- 1. منطق اللغة الروسية ---
  const hNom = ['двенадцать', 'час', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать'];
  const hGen = ['двенадцатого', 'первого', 'второго', 'третьего', 'четвёртого', 'пятого', 'шестого', 'седьмого', 'восьмого', 'девятого', 'десятого', 'одиннадцатого'];

  const getMText = (m, kase) => {
    const u = ['','одна','две','три','четыре','пять','шесть','семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцати'];
    const uGen = ['','одной','двух','трёх','четырёх','пяти','шести','семи','восьми','девяти','десяти','одиннадцати','двенадцати','тринадцати','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцати'];
    const tens = ['','','двадцать','тридцать','сорок','пятьдесят'];
    const tensGen = ['','','двадцати','тридцати','сорока','пятидесяти'];

    if(m === 15) return kase === 'gen' ? 'четверти' : 'четверть';
    if(m === 30) return 'половина';

    let txt = '';
    if(m < 20) txt = kase === 'gen' ? uGen[m] : u[m];
    else {
        let ten = Math.floor(m/10), unit = m%10;
        let tTx = kase === 'gen' ? tensGen[ten] : tens[ten];
        let uTx = unit > 0 ? (kase === 'gen' ? uGen[unit] : u[unit]) : '';
        txt = `${tTx} ${uTx}`.trim();
    }
    if(kase === 'nom') {
        if(m === 1 || (m > 20 && m % 10 === 1)) txt += ' минута';
        else if((m >= 2 && m <= 4) || (m > 20 && m % 10 >= 2 && m % 10 <= 4)) txt += ' минуты';
        else txt += ' минут';
    }
    return txt;
  };

  const getTimeStr = useCallback((h, m) => {
    let h12 = h % 12, nH = (h + 1) % 12;
    if(m === 0) return `Ровно ${hNom[h12]} часов`;
    if(m <= 30) return `${getMText(m, 'nom')} ${hGen[nH]}`;
    else return `Без ${getMText(60 - m, 'gen')} ${hNom[nH]}`;
  }, []);

  // --- 2. تحديث العقارب بدقة مركزية ---
  const updateClock = (mins, animate = true) => {
    let m = mins % 720; if(m < 0) m += 720;
    let hV = Math.floor(m/60);
    let mV = Math.floor(m%60);

    if (hHandRef.current && mHandRef.current) {
        const hDeg = (hV * 30) + (mV * 0.5);
        const mDeg = mV * 6;
        
        const transition = animate ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'none';
        hHandRef.current.style.transition = transition;
        mHandRef.current.style.transition = transition;

        hHandRef.current.style.transform = `translate(-50%, -100%) rotate(${hDeg}deg)`;
        mHandRef.current.style.transform = `translate(-50%, -100%) rotate(${mDeg}deg)`;
    }

    if (!isQuiz) {
        setDisplayTime(`${hV === 0 ? 12 : hV}:${mV < 10 ? '0'+mV : mV}`);
        setRussianText(getTimeStr(hV, mV));
    }
  };

  // --- 3. محرك الأسئلة ---
  const generateQuestion = useCallback(() => {
    let h = Math.floor(Math.random() * 12);
    let m = Math.floor(Math.random() * 12) * 5;
    tMins.current = h * 60 + m;
    updateClock(tMins.current, true);
    
    const correct = getTimeStr(h, m);
    setCorrectOption(correct);
    
    let options = new Set([correct]);
    while(options.size < 4) {
        let fh = Math.floor(Math.random() * 12);
        let fm = Math.floor(Math.random() * 12) * 5;
        if(fh !== h || fm !== m) options.add(getTimeStr(fh, fm));
    }
    setQuizOptions(Array.from(options).sort(() => Math.random() - 0.5));
  }, [getTimeStr]);

  const handleOptionClick = (selected, e) => {
    if(selected === correctOption) {
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
        setTimeout(generateQuestion, 1500);
    } else {
        e.target.classList.add('animate-shake');
        setTimeout(() => e.target.classList.remove('animate-shake'), 500);
    }
  };

  // --- 4. حركة الثواني ---
  useEffect(() => {
    let raf;
    const loop = () => {
        if(sHandRef.current) {
            const now = new Date();
            const ms = now.getMilliseconds();
            const s = now.getSeconds();
            const sDeg = (s * 6) + (ms * 0.006);
            sHandRef.current.style.transform = `translate(-50%, -85%) rotate(${sDeg}deg)`;
        }
        raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  // --- 5. السحب ---
  useEffect(() => {
    const handleMove = (e) => {
        if(!isDragging.current || isQuiz) return;
        const rect = dialRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const ex = e.touches ? e.touches[0].clientX : e.clientX;
        const ey = e.touches ? e.touches[0].clientY : e.clientY;
        let angle = Math.atan2(ey - cy, ex - cx) * 180 / Math.PI + 90;
        if(angle < 0) angle += 360;
        const totalMins = Math.round((angle * 2) / 5) * 5;
        tMins.current = totalMins;
        updateClock(totalMins, false);
    };
    const endDrag = () => isDragging.current = false;
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', endDrag);
    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', endDrag);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', endDrag);
    };
  }, [isQuiz]);

  useEffect(() => { updateClock(720); }, []);

  return (
    <div className="fixed inset-0 z-[30000] bg-black flex flex-col items-center justify-center p-4 overflow-hidden" dir="ltr">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,181,59,0.05),transparent_80%)]" />
      
      <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-red-500 transition-colors z-[30002]">
          <IconX size={32} stroke={1.5} />
      </button>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-[30001] flex flex-col items-center w-full max-w-sm">
        
        {/* جسم الساعة - الحجم المصغر الملموم */}
        <div 
          ref={dialRef}
          className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full bg-[#0c0c0c] border-[8px] border-[#1a1a1a] shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_0_30px_#000]"
        >
            {/* العلامات */}
            {[...Array(60)].map((_, i) => (
                <div key={i} className="absolute left-1/2 top-0 w-[1.5px] origin-bottom" 
                     style={{ 
                         height: i % 5 === 0 ? '12px' : '5px', 
                         backgroundColor: i % 5 === 0 ? '#cfb53b' : '#222',
                         transform: `translateX(-50%) rotate(${i * 6}deg)`,
                         transformOrigin: `50% ${window.innerWidth < 768 ? '132px' : '172px'}` 
                     }} />
            ))}

            {/* الأرقام */}
            {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((r, i) => {
                const ang = (i * 30 - 90) * Math.PI / 180;
                const radius = window.innerWidth < 768 ? 100 : 135;
                return (
                    <div key={i} className="absolute font-serif text-[#cfb53b] text-lg md:text-2xl font-black opacity-80" 
                         style={{ 
                             left: `calc(50% + ${Math.cos(ang) * radius}px - 15px)`, 
                             top: `calc(50% + ${Math.sin(ang) * radius}px - 15px)`,
                             width: '30px', textAlign: 'center'
                         }}>{r}</div>
                );
            })}

            {/* العقارب المحسنة */}
            <div className="absolute inset-0 pointer-events-none">
                <div ref={hHandRef} className="absolute left-1/2 top-1/2 w-2 h-20 md:h-28 bg-[#cfb53b] rounded-full shadow-lg" 
                     style={{ transformOrigin: '50% 100%', transform: 'translate(-50%, -100%) rotate(0deg)' }} />
                <div ref={mHandRef} className="absolute left-1/2 top-1/2 w-1.5 h-30 md:h-40 bg-zinc-400 rounded-full shadow-lg"
                     style={{ transformOrigin: '50% 100%', transform: 'translate(-50%, -100%) rotate(0deg)' }} />
                <div ref={sHandRef} className="absolute left-1/2 top-1/2 w-0.5 h-32 md:h-44 bg-red-600 rounded-full"
                     style={{ transformOrigin: '50% 85%', transform: 'translate(-50%, -85%) rotate(0deg)' }} />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111] border-2 border-[#cfb53b] rounded-full z-40" />
            </div>

            {!isQuiz && (
                <div 
                    onMouseDown={() => isDragging.current = true}
                    onTouchStart={() => isDragging.current = true}
                    className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing rounded-full" 
                />
            )}
        </div>

        {/* لوحة العرض المصغرة */}
        <div className="mt-6 w-full bg-[#0c0c0c] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-[#cfb53b]/10" />
            <AnimatePresence mode="wait">
                {!isQuiz ? (
                    <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Neural_Time</div>
                        <div className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-2">{displayTime}</div>
                        <p className="text-lg text-[#cfb53b] font-bold italic min-h-[50px] leading-tight">{russianText}</p>
                    </motion.div>
                ) : (
                    <motion.div key="q" initial={{ y: 10, opacity: 0 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        {quizOptions.map((opt, i) => (
                            <button key={i} onClick={(e) => handleOptionClick(opt, e)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-bold hover:bg-[#cfb53b] hover:text-black transition-all text-xs">
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => { if(isQuiz) setIsQuiz(false); else { setIsQuiz(true); generateQuestion(); } }}
                className={`mt-6 w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${isQuiz ? 'bg-red-900/20 text-red-500' : 'bg-[#cfb53b] text-black'}`}
            >
                {isQuiz ? "Abort" : t('btn_start')}
            </button>
        </div>
      </motion.div>
    </div>
  );
}