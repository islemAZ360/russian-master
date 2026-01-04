"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { IconX, IconClock, IconCircleCheck, IconAward } from "@tabler/icons-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";

/**
 * لعبة مسافر الزمن (Time Traveler) - النسخة الفاخرة (Luxury Edition)
 * تم إصلاح منطق العقارب بالكامل وإعادة التصميم لتكون قطعة فنية
 */
export default function TimeTraveler({ onClose }) {
  const { t, dir, isRTL } = useLanguage();
  
  const canvasRef = useRef(null);
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

  // --- 1. خوارزمية الوقت الروسي (قواعد نحوية دقيقة) ---
  const hNom = ['двенадцать', 'час', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать'];
  const hGen = ['двенадцатого', 'первого', 'второго', 'третьего', 'четвёртого', 'пятого', 'шестого', 'седьмого', 'восьмого', 'девятого', 'десятого', 'одиннадцатого'];

  const getMText = (m, kase) => {
    const u = ['','одна','две','три','четыره','пять','шесть','семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцати'];
    const uGen = ['','одной','двух','трёх','четырёх','пяти','шести','семи','восьми','девяти','десяти','одиннадцати','двенадцати','тринадцати','четырнадцать','пятнадцати','шестнадцать','семнадцать','восемнадцать','девятнадцати'];
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

  // --- 2. تحديث العقارب الفيزيائي (Mechanical Precision) ---
  const updateClock = (mins, animate = true) => {
    let m = mins % 720; if(m < 0) m += 720;
    let hV = Math.floor(m/60);
    let mV = Math.floor(m%60);

    if (hHandRef.current && mHandRef.current) {
        if(!animate) {
            hHandRef.current.style.transition = 'none'; 
            mHandRef.current.style.transition = 'none';
        } else {
            hHandRef.current.style.transition = 'transform 0.8s cubic-bezier(0.19, 1, 0.22, 1)';
            mHandRef.current.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
        }
        
        // حساب الزوايا بدقة متناهية
        const hDeg = (hV * 30) + (mV * 0.5);
        const mDeg = mV * 6;
        
        hHandRef.current.style.transform = `rotate(${hDeg}deg)`;
        mHandRef.current.style.transform = `rotate(${mDeg}deg)`;
    }

    if (!isQuiz) {
        setDisplayTime(`${hV === 0 ? 12 : hV}:${mV < 10 ? '0'+mV : mV}`);
        setRussianText(getTimeStr(hV, mV));
    }
  };

  // --- 3. محرك الاختبار (Quiz Mode) ---
  const generateQuestion = useCallback(() => {
    let h = Math.floor(Math.random() * 12);
    let m = (Math.floor(Math.random() * 12) * 5); // خطوات 5 دقائق للوضوح
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
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.7 }, colors: ['#cfb53b', '#ffffff'] });
        setTimeout(generateQuestion, 1500);
    } else {
        e.target.classList.add('animate-shake');
        setTimeout(() => e.target.classList.remove('animate-shake'), 500);
    }
  };

  // --- 4. حركة العقرب الصغير (Mechanical Sweeping) ---
  useEffect(() => {
    let raf;
    const loop = () => {
        if(sHandRef.current) {
            const now = new Date();
            const ms = now.getMilliseconds();
            const s = now.getSeconds();
            const sDeg = (s * 6) + (ms * 0.006);
            sHandRef.current.style.transform = `rotate(${sDeg}deg)`;
        }
        raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  // --- 5. منطق السحب (Drag Logic) ---
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

    const stopDrag = () => { isDragging.current = false; };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', stopDrag);

    return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', stopDrag);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', stopDrag);
    };
  }, [isQuiz]);

  useEffect(() => { updateClock(720); }, []);

  return (
    <div className="fixed inset-0 z-[20000] bg-black flex flex-col items-center justify-center font-sans overflow-hidden" dir={dir}>
      
      {/* الخلفية السينمائية */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,181,59,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* زر الإغلاق */}
      <button onClick={onClose} className="absolute top-10 right-10 z-[20001] p-3 text-white/20 hover:text-red-500 transition-colors">
          <IconX size={35} stroke={1.5} />
      </button>

      {/* الساعة الفاخرة (The Chronometer) */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div 
          ref={dialRef}
          className="relative w-[340px] h-[340px] md:w-[450px] md:h-[450px] rounded-full border-[12px] border-[#1a1a1a] bg-[#0c0c0c] shadow-[0_50px_100px_rgba(0,0,0,0.8),inset_0_0_60px_#000] flex items-center justify-center"
        >
            {/* إطار معدني لامع خارجي */}
            <div className="absolute inset-[-15px] rounded-full border-[2px] border-white/5 pointer-events-none"></div>
            
            {/* علامات الدقائق الذهبية */}
            {[...Array(60)].map((_, i) => (
                <div key={i} className={`absolute w-[2px] ${i%5===0 ? 'h-6 bg-[#cfb53b]' : 'h-3 bg-white/10'} left-1/2 top-4 origin-[50%_154px] md:origin-[50%_209px]`} 
                     style={{ transform: `rotate(${i*6}deg)` }} />
            ))}

            {/* الأرقام الرومانية الفخمة */}
            {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((r, i) => {
                const ang = (i * 30 - 90) * Math.PI / 180;
                const dist = 145; // للـ Mobile
                const distMd = 195; // للـ Desktop
                return (
                    <div key={i} className="absolute font-serif text-[#cfb53b] text-xl md:text-3xl font-black drop-shadow-[0_0_10px_rgba(207,181,59,0.4)] pointer-events-none" 
                         style={{ 
                             left: `calc(50% + ${Math.cos(ang) * (window.innerWidth < 768 ? dist : distMd)}px - 15px)`, 
                             top: `calc(50% + ${Math.sin(ang) * (window.innerWidth < 768 ? dist : distMd)}px - 15px)` 
                         }}>
                        {r}
                    </div>
                );
            })}

            {/* تفاصيل المينا الداخلية (Dial Details) */}
            <div className="absolute top-[28%] text-center">
                <div className="text-[#cfb53b]/40 text-[10px] font-black tracking-[0.4em] mb-1 uppercase">Automatique</div>
                <div className="w-10 h-[1px] bg-[#cfb53b]/20 mx-auto"></div>
            </div>

            {/* العلامة التجارية */}
            <div className="absolute bottom-[30%] flex flex-col items-center opacity-30">
                <IconAward size={20} className="text-[#cfb53b]" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] mt-1 text-[#cfb53b]">Chronometer</span>
            </div>

            {/* العقارب (Hands) */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {/* عقرب الساعات */}
                <div ref={hHandRef} className="absolute w-3 h-28 md:h-36 bg-[#cfb53b] left-1/2 top-1/2 origin-bottom -translate-x-1/2 -translate-y-full rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-10 bg-white/20 rounded-full"></div>
                </div>
                {/* عقرب الدقائق */}
                <div ref={mHandRef} className="absolute w-2 h-40 md:h-52 bg-zinc-300 left-1/2 top-1/2 origin-bottom -translate-x-1/2 -translate-y-full rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10" />
                {/* عقرب الثواني (الميكانيكي) */}
                <div ref={sHandRef} className="absolute w-[1.5px] h-44 md:h-56 bg-red-600 left-1/2 top-1/2 origin-[50%_80%] -translate-x-1/2 -translate-y-[80%] rounded-full z-30 after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3 after:h-3 after:bg-red-600 after:rounded-full shadow-lg" />
                {/* المسمار المركزي */}
                <div className="absolute w-6 h-6 bg-[#1a1a1a] border-4 border-[#cfb53b] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[40] shadow-2xl" />
            </div>

            {/* منطقة السحب (invisible touch area) */}
            {!isQuiz && (
                <div 
                    onMouseDown={() => isDragging.current = true}
                    onTouchStart={() => isDragging.current = true}
                    className="absolute inset-0 z-50 rounded-full cursor-grab active:cursor-grabbing"
                />
            )}
        </div>

        {/* لوحة التحكم والأسئلة (The Display Panel) */}
        <div className="mt-12 w-full max-w-[480px] bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#cfb53b]/50 to-transparent" />
            
            <AnimatePresence mode="wait">
                {!isQuiz ? (
                    <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
                        <span className="text-[10px] font-black tracking-[0.5em] text-white/20 uppercase mb-4 block">Time_Protocol_Live</span>
                        <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4">{displayTime}</h2>
                        <div className="min-h-[70px] flex items-center justify-center px-6">
                            <p className="text-xl md:text-2xl font-bold italic leading-tight text-[#cfb53b] drop-shadow-[0_0_15px_rgba(207,181,59,0.3)]">
                                {russianText}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="q" initial={{ y: 20, opacity: 0 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 gap-3">
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.4em] text-center mb-4">Validate_Temporal_Sequence</span>
                        {quizOptions.map((opt, i) => (
                            <button 
                                key={i} onClick={(e) => handleOptionClick(opt, e)}
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 font-bold hover:bg-[#cfb53b]/10 hover:border-[#cfb53b] hover:text-white transition-all text-sm active:scale-95"
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => { if(isQuiz) setIsQuiz(false); else { setIsQuiz(true); generateQuestion(); } }}
                className={`mt-10 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl
                    ${isQuiz ? 'bg-red-950/40 text-red-500 border border-red-500/30' : 'bg-[#cfb53b] text-black hover:bg-white'}
                `}
            >
                {isQuiz ? "Abort_Examination" : t('btn_start')}
            </button>
        </div>
      </motion.div>

      {/* اسم المبرمج كعلامة تجارية فاخرة في الأسفل */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-20 pointer-events-none">
          <span className="text-[12px] font-serif font-black tracking-[0.5em] text-[#cfb53b]">ИСЛАМ АЗАЙЗИЯ</span>
          <span className="text-[8px] font-black uppercase tracking-[0.3em] mt-1 text-white">Manufacture de Haute Horlogerie</span>
      </div>
    </div>
  );
}