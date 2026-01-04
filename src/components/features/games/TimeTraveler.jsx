"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { IconX, IconClock, IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";
import confetti from "canvas-confetti";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, AnimatePresence } from "framer-motion";

/**
 * لعبة مسافر الزمن (Time Traveler)
 * تم تطويرها لدعم الترجمة الشاملة وتحسين تجربة اللعب السينمائية
 */
export default function TimeTraveler({ onClose }) {
  const { t, dir, isRTL } = useLanguage();
  
  // المراجع (Refs) للرسومات والعقارب
  const canvasRef = useRef(null);
  const hHandRef = useRef(null);
  const mHandRef = useRef(null);
  const sHandRef = useRef(null);
  const dialRef = useRef(null);

  // حالة اللعبة (State)
  const [isQuiz, setIsQuiz] = useState(false);
  const [displayTime, setDisplayTime] = useState("12:00");
  const [russianText, setRussianText] = useState("");
  const [quizOptions, setQuizOptions] = useState([]);
  const [correctOption, setCorrectOption] = useState("");

  // منطق السحب والوقت
  const tMins = useRef(720);
  const isDragging = useRef(false);

  // --- 1. خوارزمية توليد النص الروسي الصحيح (Russian Time Logic) ---
  const hNom = ['двенадцать', 'час', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать'];
  const hGen = ['двенадцатого', 'первого', 'второго', 'третьего', 'четвёртого', 'пятого', 'шестого', 'седьмого', 'восьмого', 'девятого', 'десятого', 'одиннадцатого'];

  const getMText = (m, kase) => {
    const u = ['','одна','две','три','четыре','пять','шесть','семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцати'];
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

  // --- 2. تحديث مرئي للساعة ---
  const updateClock = (mins, animate = true) => {
    let m = mins % 720; if(m < 0) m += 720;
    let hV = Math.floor(m/60);
    let mV = Math.floor(m%60);

    if (hHandRef.current && mHandRef.current) {
        if(!animate) {
            hHandRef.current.style.transition = 'none'; 
            mHandRef.current.style.transition = 'none';
        } else {
            hHandRef.current.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            mHandRef.current.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        }
        hHandRef.current.style.transform = `rotate(${hV * 30 + mV * 0.5}deg)`;
        mHandRef.current.style.transform = `rotate(${mV * 6}deg)`;
    }

    if (!isQuiz) {
        setDisplayTime(`${hV === 0 ? 12 : hV}:${mV < 10 ? '0'+mV : mV}`);
        setRussianText(getTimeStr(hV, mV));
    }
  };

  // --- 3. نظام الاختبار (Quiz Engine) ---
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
        e.target.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
        e.target.style.borderColor = '#10b981';
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#cfb53b', '#ffffff'] });
        setTimeout(generateQuestion, 1200);
    } else {
        e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
        e.target.style.borderColor = '#ef4444';
        e.target.classList.add('animate-shake');
        setTimeout(() => e.target.classList.remove('animate-shake'), 500);
    }
  };

  // --- 4. تأثيرات الخلفية واللمس ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    // جزيئات سديمية خفيفة
    let particles = Array.from({length: 80}, () => ({
        x: Math.random() * w, y: Math.random() * h,
        v: Math.random() * 0.5 + 0.2, s: Math.random() * 2
    }));

    const animate = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(207, 181, 59, 0.1)";
        particles.forEach(p => {
            p.y -= p.v; if(p.y < 0) p.y = h;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(animate);
    };
    animate();

    const getAngle = (e) => {
        const rect = dialRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const ex = e.touches ? e.touches[0].clientX : e.clientX;
        const ey = e.touches ? e.touches[0].clientY : e.clientY;
        let angle = Math.atan2(ey - cy, ex - cx) * 180 / Math.PI + 90;
        return angle < 0 ? angle + 360 : angle;
    };

    const onStart = (e) => { if(!isQuiz) isDragging.current = true; };
    const onMove = (e) => {
        if(!isDragging.current) return;
        let a = getAngle(e);
        let total = Math.round((a * 2) / 5) * 5;
        tMins.current = total;
        updateClock(total, false);
    };
    const onEnd = () => { isDragging.current = false; };

    window.addEventListener('mousedown', onStart); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchstart', onStart); window.addEventListener('touchmove', onMove); window.addEventListener('touchend', onEnd);

    return () => {
        window.removeEventListener('mousedown', onStart); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onEnd);
        window.removeEventListener('touchstart', onStart); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd);
    };
  }, [isQuiz]);

  useEffect(() => { updateClock(720); }, []);

  return (
    <div className="fixed inset-0 z-[20000] bg-[#050505] flex flex-col items-center justify-center font-sans overflow-hidden text-[#cfb53b]" dir={dir}>
      
      {/* طبقة الرسومات الخلفية */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#000_150%)] pointer-events-none" />

      {/* زر الإغلاق المترجم */}
      <button 
        onClick={onClose} 
        className={`absolute top-8 ${isRTL ? 'left-8' : 'right-8'} z-[20001] p-3 rounded-full bg-white/5 border border-white/10 hover:bg-red-600 hover:text-white transition-all`}
      >
          <IconX size={28}/>
      </button>

      {/* جسم الساعة (Watch Case) */}
      <div className="relative z-10 flex flex-col items-center max-w-full px-4">
        
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            ref={dialRef} 
            className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full bg-[conic-gradient(from_45deg,#1a1a1a,#333,#1a1a1a)] shadow-[0_40px_100px_rgba(0,0,0,0.9),inset_0_0_40px_#000] flex items-center justify-center border-8 border-zinc-800"
        >
            {/* أرقام الساعة الرومانية */}
            {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((r, i) => {
                const ang = (i * 30 - 90) * Math.PI / 180;
                const dist = 125;
                return (
                    <div key={i} className="absolute font-serif text-[#cfb53b]/80 text-xl font-bold" 
                         style={{ left: `calc(50% + ${Math.cos(ang) * dist}px - 10px)`, top: `calc(50% + ${Math.sin(ang) * dist}px - 10px)` }}>
                        {r}
                    </div>
                );
            })}

            {/* العقارب */}
            <div className="absolute inset-0 pointer-events-none">
                <div ref={hHandRef} className="absolute w-2 h-24 bg-[#cfb53b] left-1/2 top-1/2 origin-bottom -translate-x-1/2 -translate-y-full rounded-full shadow-lg z-20" />
                <div ref={mHandRef} className="absolute w-1 h-32 bg-white/40 left-1/2 top-1/2 origin-bottom -translate-x-1/2 -translate-y-full rounded-full z-10" />
                <div className="absolute w-4 h-4 bg-black border-2 border-[#cfb53b] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 shadow-xl" />
            </div>

            {/* العلامات الدقيقة */}
            {[...Array(60)].map((_, i) => (
                <div key={i} className={`absolute w-[1px] ${i%5===0 ? 'h-4 bg-[#cfb53b]' : 'h-2 bg-white/20'} left-1/2 top-2 origin-[50%_142px] md:origin-[50%_182px]`} 
                     style={{ transform: `rotate(${i*6}deg)` }} />
            ))}
        </motion.div>

        {/* لوحة التحكم والأسئلة */}
        <div className="mt-12 w-full max-w-[450px] bg-zinc-900/80 border border-[#cfb53b]/30 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#cfb53b] to-transparent opacity-50" />
            
            <AnimatePresence mode="wait">
                {!isQuiz ? (
                    <motion.div 
                        key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center"
                    >
                        <div className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase mb-2">
                           {t('live_secure_channel')} // MOSCOW_TIME
                        </div>
                        <div className="text-6xl font-black text-white tracking-tighter mb-4">{displayTime}</div>
                        <div className="min-h-[60px] flex items-center justify-center px-4">
                            <p className="text-xl font-bold italic leading-tight text-[#cfb53b] drop-shadow-[0_0_10px_rgba(207,181,59,0.3)]">
                                {russianText}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="quiz" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                        className="space-y-3"
                    >
                        <div className="text-[10px] font-black tracking-[0.3em] text-cyan-500 uppercase text-center mb-4">
                            IDENTIFY_TEMPORAL_DATA
                        </div>
                        {quizOptions.map((opt, i) => (
                            <button 
                                key={i} onClick={(e) => handleOptionClick(opt, e)}
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 font-bold hover:bg-[#cfb53b]/10 hover:border-[#cfb53b] transition-all text-sm text-center active:scale-[0.98]"
                            >
                                {opt}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={() => {
                    if (isQuiz) { setIsQuiz(false); }
                    else { setIsQuiz(true); generateQuestion(); }
                }}
                className={`mt-8 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl
                    ${isQuiz 
                        ? 'bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white' 
                        : 'bg-[#cfb53b] text-black hover:bg-white hover:scale-[1.02]'
                    }`}
            >
                {isQuiz ? "ABORT_MISSION" : t('btn_start')}
            </button>
        </div>
      </div>

      {/* تذييل الصفحة البرمجي */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-20 pointer-events-none">
          <div className="h-px w-20 bg-[#cfb53b]" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Temporal_Shift_v4.0</span>
          <div className="h-px w-20 bg-[#cfb53b]" />
      </div>
    </div>
  );
}