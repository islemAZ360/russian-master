"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { IconX, IconAward, IconPlayerPlay } from "@tabler/icons-react";
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

  // --- 1. منطق اللغة الروسية (Nom/Gen Cases) ---
  const hNom = ['двенадцать', 'час', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать'];
  const hGen = ['двенадцатого', 'первого', 'второго', 'третьего', 'четвёртого', 'пятого', 'шестого', 'седьмого', 'восьмого', 'девятого', 'десятого', 'одиннадцатого'];

  const getMText = (m, kase) => {
    const u = ['','одна','две','три','четыре','пять','шесть','семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцати'];
    const uGen = ['','одной','двух','трёх','четырёх','пяти','шести','семи','восьми','девяти','десяти','одиннадцати','двенадцати','тринадцати','четырнадцать','пятнадцати','шестнадцать','семнадцать','восемнадцать','девятнадцати'];
    const tens = ['','','двадцать','тридцать','сорок','пятьдесят'];
    const tensGen = ['','','двадцати','триدцати','сорока','пятидесяти'];

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

  // --- 2. تحديث العقارب (إصلاح فيزيائي كامل) ---
  const updateClock = (mins, animate = true) => {
    let m = mins % 720; if(m < 0) m += 720;
    let hV = Math.floor(m/60);
    let mV = Math.floor(m%60);

    if (hHandRef.current && mHandRef.current) {
        const hDeg = (hV * 30) + (mV * 0.5);
        const mDeg = mV * 6;
        
        const transition = animate ? 'transform 0.6s cubic-bezier(0.17, 0.67, 0.83, 0.67)' : 'none';
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
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 }, colors: ['#cfb53b', '#ffffff'] });
        setTimeout(generateQuestion, 1500);
    } else {
        e.target.classList.add('animate-shake');
        setTimeout(() => e.target.classList.remove('animate-shake'), 500);
    }
  };

  // --- 4. حركة الثواني الميكانيكية (Continuous Sweep) ---
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

  // --- 5. التعامل مع السحب (Drag) ---
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
      
      {/* إضاءة سينمائية */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,181,59,0.1),transparent_80%)]" />
      
      <button onClick={onClose} className="absolute top-10 right-10 text-white/20 hover:text-red-500 transition-colors z-[30002]">
          <IconX size={40} stroke={1.5} />
      </button>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-[30001] flex flex-col items-center w-full max-w-lg">
        
        {/* جسم الساعة (Watch Body) */}
        <div 
          ref={dialRef}
          className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] rounded-full bg-[#0c0c0c] border-[10px] border-[#1a1a1a] shadow-[0_50px_100px_rgba(0,0,0,0.9),inset_0_0_40px_#000]"
        >
            {/* العلامات الذهبية */}
            {[...Array(60)].map((_, i) => (
                <div key={i} className="absolute left-1/2 top-0 w-[2px] origin-bottom" 
                     style={{ 
                         height: i % 5 === 0 ? '15px' : '7px', 
                         backgroundColor: i % 5 === 0 ? '#cfb53b' : '#333',
                         transform: `translateX(-50%) rotate(${i * 6}deg)`,
                         transformOrigin: `50% ${window.innerWidth < 768 ? '140px' : '200px'}` 
                     }} />
            ))}

            {/* الأرقام الرومانية */}
            {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((r, i) => {
                const ang = (i * 30 - 90) * Math.PI / 180;
                const radius = window.innerWidth < 768 ? 110 : 160;
                return (
                    <div key={i} className="absolute font-serif text-[#cfb53b] text-xl md:text-3xl font-black drop-shadow-lg" 
                         style={{ 
                             left: `calc(50% + ${Math.cos(ang) * radius}px - 15px)`, 
                             top: `calc(50% + ${Math.sin(ang) * radius}px - 15px)`,
                             width: '30px', textAlign: 'center'
                         }}>{r}</div>
                );
            })}

            {/* المينا الداخلية */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 text-center opacity-30">
                <div className="text-[#cfb53b] text-[8px] font-black tracking-[0.5em] uppercase">Chronometer</div>
                <div className="w-12 h-px bg-[#cfb53b] mx-auto mt-1" />
            </div>

            {/* العقارب (Fixed Core Logic) */}
            <div className="absolute inset-0 pointer-events-none">
                {/* عقرب الساعات */}
                <div ref={hHandRef} className="absolute left-1/2 top-1/2 w-2.5 h-24 md:h-32 bg-[#cfb53b] rounded-full shadow-xl" 
                     style={{ transformOrigin: '50% 100%', transform: 'translate(-50%, -100%) rotate(0deg)' }}>
                    <div className="w-full h-1/3 bg-white/20 rounded-full" />
                </div>
                {/* عقرب الدقائق */}
                <div ref={mHandRef} className="absolute left-1/2 top-1/2 w-1.5 h-36 md:h-48 bg-zinc-300 rounded-full shadow-xl"
                     style={{ transformOrigin: '50% 100%', transform: 'translate(-50%, -100%) rotate(0deg)' }} />
                {/* عقرب الثواني */}
                <div ref={sHandRef} className="absolute left-1/2 top-1/2 w-0.5 h-40 md:h-52 bg-red-600 rounded-full"
                     style={{ transformOrigin: '50% 85%', transform: 'translate(-50%, -85%) rotate(0deg)' }} />
                {/* المسمار المركزي */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-[#111] border-4 border-[#cfb53b] rounded-full z-40" />
            </div>

            {/* طبقة التفاعل */}
            {!isQuiz && (
                <div 
                    onMouseDown={() => isDragging.current = true}
                    onTouchStart={() => isDragging.current = true}
                    className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing rounded-full" 
                />
            )}
        </div>

        {/* لوحة العرض (Display Panel) */}
        <div className="mt-10 w-full max-w-sm bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#cfb53b]/20" />
            <AnimatePresence mode="wait">
                {!isQuiz ? (
                    <motion.div key="time" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Neural_Time_Protocol</div>
                        <div className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-4">{displayTime}</div>
                        <p className="text-xl text-[#cfb53b] font-bold italic drop-shadow-md min-h-[60px]">{russianText}</p>
                    </motion.div>
                ) : (
                    <motion.div key="quiz" initial={{ y: 20, opacity: 0 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        {quizOptions.map((opt, i) => (
                            <button key={i} onClick={(e) => handleOptionClick(opt, e)} className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 font-bold hover:bg-[#cfb53b] hover:text-black transition-all">
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => { if(isQuiz) setIsQuiz(false); else { setIsQuiz(true); generateQuestion(); } }}
                className={`mt-8 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${isQuiz ? 'bg-red-900/20 text-red-500' : 'bg-[#cfb53b] text-black'}`}
            >
                {isQuiz ? "Abort" : t('btn_start')}
            </button>
        </div>

        <div className="mt-8 flex flex-col items-center opacity-20">
            <span className="text-[14px] font-serif font-black tracking-[0.5em] text-[#cfb53b]">ИСЛАМ АЗАЙЗИЯ</span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Supreme Developer</span>
        </div>
      </motion.div>
    </div>
  );
}