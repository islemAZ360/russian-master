"use client";
import React, { useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import confetti from "canvas-confetti";

export default function TimeTraveler({ onClose }) {
  const canvasRef = useRef(null);
  const hHandRef = useRef(null);
  const mHandRef = useRef(null);
  const sHandRef = useRef(null);
  const dialRef = useRef(null);

  // State
  const [isQuiz, setIsQuiz] = useState(false);
  const [displayTime, setDisplayTime] = useState("12:00");
  const [russianText, setRussianText] = useState("Ровно двенадцать часов");
  const [quizOptions, setQuizOptions] = useState([]);
  const [correctOption, setCorrectOption] = useState("");
  const [btnText, setBtnText] = useState("BEGIN EXAMINATION");

  // Logic Refs
  const tMins = useRef(720);
  const isDragging = useRef(false);

  // --- Russian Logic ---
  const hNom = ['двенадцать', 'час', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 'десять', 'одиннадцать'];
  const hGen = ['двенадцатого', 'первого', 'второго', 'третьего', 'четвёртого', 'пятого', 'шестого', 'седьмого', 'восьмого', 'девятого', 'десятого', 'одиннадцатого'];

  const getMText = (m, kase) => {
    const u = ['','одна','две','три','четыре','пять','шесть','семь','восемь','девять','десять','одиннадцать','двенадцать','тринадцать','четырнадцать','пятнадцать','шестнадцать','семнадцать','восемнадцать','девятнадцати'];
    const uGen = ['','одной','двух','трёх','четырёх','пяти','шести','семи','восьми','девяти','десяти','одиннадцати','двенадцати','тринадцати','четырнадцати','пятнадцати','шестнадцати','семнадцати','восемнадцати','девятнадцати'];
    const t = ['','','двадцать','тридцать','сорок','пятидесяти'];
    const tGen = ['','','двадцати','тридцати','сорока','пятидесяти'];

    if(m===15) return kase==='gen'?'четверти':'четверть';
    if(m===30) return 'половина';

    let txt = '';
    if(m<20) txt = kase==='gen'? uGen[m] : u[m];
    else {
        let ten=Math.floor(m/10), unit=m%10;
        let tTx = kase==='gen'? tGen[ten] : t[ten];
        let uTx = unit>0 ? (kase==='gen'? uGen[unit] : u[unit]) : '';
        txt = `${tTx} ${uTx}`.trim();
    }
    if(kase==='nom') {
        if(m===1||(m>20&&m%10===1)) txt+=' минута';
        else if((m>=2&&m<=4)||(m>20&&m%10>=2&&m%10<=4)) txt+=' минуты';
        else txt+=' минут';
    }
    return txt;
  };

  const getTimeStr = (h, m) => {
    let h12 = h%12, nH = (h+1)%12;
    if(m===0) return `Ровно ${hNom[h12]} часов`;
    if(m<=30) return `${getMText(m,'nom')} ${hGen[nH]}`;
    else return `Без ${getMText(60-m,'gen')} ${hNom[nH]}`;
  };

  // --- Clock Update ---
  const updateClock = (mins, animate = true) => {
    let m = mins % 720; if(m<0) m+=720;
    let hV = Math.floor(m/60);
    let mV = Math.floor(m%60);

    if (hHandRef.current && mHandRef.current) {
        if(!animate) {
            hHandRef.current.style.transition = 'none'; 
            mHandRef.current.style.transition = 'none';
        } else {
            hHandRef.current.style.transition = 'transform 0.4s cubic-bezier(0.2, 1, 0.3, 1)';
            mHandRef.current.style.transition = 'transform 0.4s cubic-bezier(0.2, 1, 0.3, 1)';
        }
        let hDeg = hV * 30 + mV * 0.5;
        let mDeg = mV * 6;
        hHandRef.current.style.transform = `rotate(${hDeg}deg)`;
        mHandRef.current.style.transform = `rotate(${mDeg}deg)`;
    }

    if (!isQuiz) {
        let dH = hV === 0 ? 12 : hV;
        let dM = mV < 10 ? '0'+mV : mV;
        setDisplayTime(`${dH}:${dM}`);
        setRussianText(getTimeStr(hV, mV));
    }
  };

  // --- Quiz Logic ---
  const toggleMode = () => {
      if(isQuiz) {
          setIsQuiz(false);
          setBtnText("BEGIN EXAMINATION");
          updateClock(tMins.current, true);
      } else {
          setIsQuiz(true);
          setBtnText("ABORT EXAMINATION");
          generateQuestion();
      }
  };

  const generateQuestion = () => {
    let h = Math.floor(Math.random()*12);
    let m = Math.floor(Math.random()*12)*5;
    tMins.current = h*60+m;
    updateClock(tMins.current, true);
    
    const correct = getTimeStr(h, m);
    setCorrectOption(correct);
    
    let set = new Set([correct]);
    while(set.size < 4) {
        let fh = Math.floor(Math.random()*12);
        let fm = Math.floor(Math.random()*12)*5;
        if(fh!==h || fm!==m) set.add(getTimeStr(fh,fm));
    }
    setQuizOptions(Array.from(set).sort(()=>Math.random()-0.5));
  };

  const handleOptionClick = (txt, e) => {
    if(txt === correctOption) {
        e.target.style.borderColor = '#059669';
        e.target.style.backgroundColor = 'rgba(5, 150, 105, 0.3)';
        e.target.style.color = 'white';
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#cfb53b', '#ffffff'] });
        setTimeout(() => {
            if (e.target) e.target.style = "";
            generateQuestion();
        }, 1000);
    } else {
        e.target.style.borderColor = '#7f1d1d';
        e.target.style.backgroundColor = 'rgba(127, 29, 29, 0.3)';
        e.target.style.opacity = '0.5';
    }
  };

  // --- Effects ---
  useEffect(() => {
    // 1. Particle Background
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let particles = [];

    class Particle {
        constructor() { this.init(); }
        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.2;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.size = Math.random() * 2;
            this.col = Math.random() > 0.8 ? '#cfb53b' : '#059669';
            this.alpha = Math.random() * 0.5;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if(this.x<0||this.x>width||this.y<0||this.y>height) this.init();
        }
        draw() {
            ctx.fillStyle = this.col;
            ctx.globalAlpha = this.alpha;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
    for(let i=0; i<100; i++) particles.push(new Particle());
    
    let animationId;
    const animateBg = () => {
        ctx.clearRect(0,0,width,height);
        particles.forEach(p => { p.update(); p.draw(); });
        animationId = requestAnimationFrame(animateBg);
    };
    animateBg();

    // 2. Seconds Hand
    let secAnimationId;
    const loopSeconds = () => {
        if(!sHandRef.current) return;
        let now = new Date();
        let ms = now.getMilliseconds();
        let s = now.getSeconds();
        let deg = (s * 6) + (ms * 0.006);
        sHandRef.current.style.transform = `rotate(${deg}deg)`;
        secAnimationId = requestAnimationFrame(loopSeconds);
    };
    loopSeconds();

    // 3. Drag Logic
    const getAng = (e) => {
        if(!dialRef.current) return 0;
        let r = dialRef.current.getBoundingClientRect();
        let cx = r.left + r.width/2;
        let cy = r.top + r.height/2;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        let a = Math.atan2(clientY-cy, clientX-cx)*180/Math.PI + 90;
        return a<0? a+360 : a;
    };

    const handleStart = (e) => {
        if(!isQuiz && e.target.classList.contains('h-hand')) isDragging.current = true;
    };
    const handleMove = (e) => {
        if(!isDragging.current) return;
        let ang = getAng(e);
        let total = Math.round((ang*2)/5)*5;
        tMins.current = total;
        updateClock(total, false);
    };
    const handleEnd = () => isDragging.current = false;

    window.addEventListener('mousedown', handleStart); window.addEventListener('touchstart', handleStart);
    window.addEventListener('mousemove', handleMove); window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleEnd); window.addEventListener('touchend', handleEnd);
    
    const handleResize = () => { 
        if(canvas) { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('mousedown', handleStart); window.removeEventListener('touchstart', handleStart);
        window.removeEventListener('mousemove', handleMove); window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleEnd); window.removeEventListener('touchend', handleEnd);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        cancelAnimationFrame(secAnimationId);
    };
  }, [isQuiz]); 

  // Initialize
  useEffect(() => { updateClock(720); }, []);

  // التعديل: z-[200] لضمان ظهور اللعبة فوق كل شيء
  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col items-center justify-center font-sans overflow-hidden text-[#cfb53b]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Playfair+Display:ital@0;1&family=Montserrat:wght@200;400;600&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        
        .mech-corner {
            position: fixed; width: 300px; height: 300px; z-index: 2; opacity: 0.15;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='none' stroke='%23cfb53b' stroke-width='0.5' d='M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0'/%3E%3Cpath fill='none' stroke='%23cfb53b' stroke-width='0.2' d='M50,50 m-35,0 a35,35 0 1,0 70,0 a35,35 0 1,0 -70,0' stroke-dasharray='1 3'/%3E%3C/svg%3E");
            animation: spinBg 60s linear infinite;
        }
        .mc-top-left { top: -100px; left: -100px; }
        .mc-bottom-right { bottom: -100px; right: -100px; animation-direction: reverse; }
        @keyframes spinBg { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
      `}</style>

      <div className="mech-corner mc-top-left"></div>
      <div className="mech-corner mc-bottom-right"></div>

      {/* Close Button */}
      <button onClick={onClose} className="absolute top-6 right-6 z-[201] text-white/50 hover:text-red-500 transition-colors">
          <IconX size={32}/>
      </button>

      {/* Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#000_120%)] pointer-events-none z-1"></div>

      {/* Brand */}
      <div className="absolute bottom-10 left-10 z-50 pl-4 border-l-2 border-[#cfb53b] hidden md:block">
        <div className="font-cinzel font-bold text-lg tracking-[2px] text-transparent bg-clip-text bg-gradient-to-r from-[#cfb53b] via-white to-[#cfb53b]">
            ИСЛАМ АЗАЙЗИЯ
        </div>
        <div className="font-playfair text-[10px] text-gray-400 italic tracking-wider mt-1">
            المبرمج الأفضل
        </div>
      </div>

      {/* Main Layout */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4">
        
        {/* Watch Case */}
        <div ref={dialRef} className="relative w-[320px] h-[320px] shrink-0 rounded-full mb-10 bg-[conic-gradient(from_45deg,#1a1a1a,#444,#1a1a1a,#444,#1a1a1a)] shadow-[0_30px_70px_rgba(0,0,0,0.9),inset_0_0_0_2px_#555,inset_0_0_0_8px_#111] flex justify-center items-center scale-90 md:scale-100 transition-transform">
            <div className="absolute w-[94%] h-[94%] rounded-full border-2 border-dashed border-[#cfb53b]/40 shadow-[0_0_15px_rgba(207,181,59,0.1)]"></div>
            <div className="relative w-[270px] h-[270px] rounded-full bg-[radial-gradient(circle,#1a1f25_0%,#080a0c_90%)] shadow-[inset_0_0_20px_#000] overflow-hidden">
                <div className="absolute top-[60px] w-full text-center opacity-70">
                    <div className="text-[#cfb53b] text-sm mb-0.5">♛</div>
                    <div className="font-montserrat text-[8px] tracking-[2px] uppercase text-white">CHRONOMETER</div>
                </div>

                {['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].map((r, i) => {
                    const ang = (i*30-90)*Math.PI/180;
                    const radius = 110;
                    const x = Math.cos(ang)*radius + 135 - 15;
                    const y = Math.sin(ang)*radius + 135 - 15;
                    return (
                        <div key={i} className="absolute font-cinzel text-[#fff4bd] text-[18px] w-[30px] h-[30px] text-center leading-[30px] drop-shadow-[0_0_5px_rgba(255,244,189,0.3)]" style={{left: x, top: y}}>
                            {r}
                        </div>
                    );
                })}
                
                {[...Array(60)].map((_, i) => i%5!==0 && (
                    <div key={i} className="absolute w-[1px] h-[6px] bg-white/20 left-1/2 top-[4px] origin-[50%_131px]" style={{transform: `rotate(${i*6}deg)`}}></div>
                ))}

                <div className="absolute bottom-[40px] left-1/2 -translate-x-1/2 w-[60px] h-[60px] rounded-full bg-black border border-[#333] shadow-[inset_0_0_10px_#000] flex justify-center items-center overflow-hidden">
                    <div className="w-[45px] h-[45px] rounded-full border-2 border-[#cfb53b] border-t-transparent border-b-transparent animate-[spin_0.4s_ease-in-out_infinite_alternate]"></div>
                    <div className="absolute w-[6px] h-[6px] bg-[#9b111e] rounded-full shadow-[0_0_5px_#9b111e]"></div>
                </div>

                <div className="absolute inset-0 pointer-events-none z-10">
                    <div ref={hHandRef} className="h-hand absolute w-[6px] h-[60px] -ml-[3px] -mt-[60px] bg-gradient-to-r from-[#8a6e2f] via-[#fdf5c7] to-[#8a6e2f] left-1/2 top-1/2 origin-[50%_100%] z-[5] rounded cursor-grab pointer-events-auto shadow-md"></div>
                    <div ref={mHandRef} className="m-hand absolute w-[4px] h-[95px] -ml-[2px] -mt-[95px] bg-[#aaa] left-1/2 top-1/2 origin-[50%_100%] z-[4] rounded shadow-md"></div>
                    <div ref={sHandRef} className="s-hand absolute w-[1px] h-[110px] -ml-[0.5px] -mt-[85px] bg-[#9b111e] left-1/2 top-1/2 origin-[50%_77.2%] z-[6] shadow-md after:content-[''] after:absolute after:top-[83px] after:-left-[2.5px] after:w-[6px] after:h-[6px] after:bg-[#9b111e] after:rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 w-[10px] h-[10px] bg-[#111] border-2 border-[#cfb53b] rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
                </div>
            </div>
        </div>

        {/* Panel */}
        <div id="game-panel" className="w-full max-w-[400px] bg-[#121214]/85 border border-[#cfb53b]/30 rounded-xl p-6 text-center backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] relative overflow-hidden flex flex-col gap-4 before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#cfb53b] before:to-transparent">
            
            {!isQuiz ? (
                <div className="animate-in fade-in duration-500">
                    <div className="text-[9px] tracking-[3px] text-[#777] uppercase mb-1">MOSCOW STANDARD TIME</div>
                    <div className="font-playfair text-5xl text-white leading-none mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{displayTime}</div>
                    <div className="font-cinzel text-lg md:text-xl text-[#cfb53b] font-bold leading-tight min-h-[50px] flex items-center justify-center drop-shadow-[0_0_10px_rgba(207,181,59,0.3)]">{russianText}</div>
                </div>
            ) : (
                <div className="flex flex-col gap-2 w-full animate-in slide-in-from-bottom duration-500">
                     <div className="text-[9px] tracking-[3px] text-[#cfb53b] uppercase mb-1">SELECT CORRECT TIME</div>
                     {quizOptions.map((opt, i) => (
                         <button 
                            key={i} 
                            onClick={(e) => handleOptionClick(opt, e)}
                            className="bg-white/5 border border-white/10 text-gray-300 py-3 px-4 rounded-lg hover:bg-[#cfb53b]/10 hover:border-[#cfb53b] hover:text-white transition-all font-montserrat text-sm"
                         >
                             {opt}
                         </button>
                     ))}
                </div>
            )}

            <button 
                onClick={toggleMode}
                className={`mt-2 bg-transparent border border-[#8a6e2f] text-[#cfb53b] py-3 w-full font-cinzel text-xs font-bold tracking-[2px] uppercase rounded hover:bg-[#cfb53b] hover:text-black transition-all hover:shadow-[0_0_20px_rgba(207,181,59,0.4)] ${isQuiz ? 'border-red-900 text-red-500 hover:bg-red-900 hover:text-white hover:shadow-red-900/50' : ''}`}
            >
                {btnText}
            </button>
        </div>

      </div>
    </div>
  );
}