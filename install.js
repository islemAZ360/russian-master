const fs = require('fs');
const path = require('path');

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trim());
  console.log(`✨ تم إنشاء: ${filePath}`);
}

// 1. الأدوات المساعدة
createFile('lib/utils.js', `
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) { return twMerge(clsx(inputs)); }
`);

// 2. البيانات الأولية
createFile('data/initialCards.js', `
export const initialCards = [
  { id: 1, russian: "Привет", arabic: "مرحباً", level: 0, reviews: 0 },
  { id: 2, russian: "Как дела?", arabic: "كيف حالك؟", level: 0, reviews: 0 },
  { id: 3, russian: "Спасибо", arabic: "شكراً", level: 0, reviews: 0 },
  { id: 4, russian: "Я изучаю русский язык", arabic: "أنا أتعلم اللغة الروسية", level: 0, reviews: 0 },
  { id: 5, russian: "Где находится метро?", arabic: "أين تقع محطة المترو؟", level: 0, reviews: 0 },
  { id: 6, russian: "Кот", arabic: "قطة", level: 0, reviews: 0 },
  { id: 7, russian: "Собака", arabic: "كلب", level: 0, reviews: 0 },
  { id: 8, russian: "Я люблю тебя", arabic: "أنا أحبك", level: 0, reviews: 0 },
];
`);

// 3. المنطق (Backend Logic)
createFile('hooks/useStudySystem.js', `
import { useState, useEffect } from 'react';
import { initialCards } from '../data/initialCards';

export const useStudySystem = () => {
  const [cards, setCards] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('russian_learning_db_v2');
    if (savedData) {
      setCards(JSON.parse(savedData));
    } else {
      setCards(initialCards);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('russian_learning_db_v2', JSON.stringify(cards));
    }
  }, [cards, isLoaded]);

  const addCard = (russian, arabic) => {
    const newCard = { id: Date.now(), russian, arabic, level: 0, reviews: 0 };
    setCards([newCard, ...cards]);
  };

  const deleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const updateCard = (id, newRussian, newArabic) => {
    setCards(cards.map(c => c.id === id ? { ...c, russian: newRussian, arabic: newArabic } : c));
  };

  const reviewCard = (id, known) => {
    setCards(cards.map(card => {
      if (card.id === id) {
        return {
          ...card,
          reviews: card.reviews + 1,
          level: known ? Math.min(card.level + 1, 5) : 0 
        };
      }
      return card;
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(cards);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'russian_progress.json');
    linkElement.click();
  };

  const importData = (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = e => {
      try {
        const parsedData = JSON.parse(e.target.result);
        setCards(parsedData);
        alert("تم استرجاع البيانات بنجاح!");
      } catch (err) {
        alert("الملف غير صالح");
      }
    };
  };

  return { cards, addCard, deleteCard, updateCard, reviewCard, exportData, importData };
};
`);

// 4. مكونات التصميم (UI Components)
createFile('components/ui/fluid-background.jsx', `
"use client";
import React from "react";
export const FluidBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-[#050505] overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-emerald-900/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    </div>
  );
};
`);

createFile('components/ui/floating-dock.jsx', `
"use client";
import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

export const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({ items, className }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div layoutId="nav" className="absolute bottom-full mb-2 inset-x-0 flex flex-col gap-2">
            {items.map((item, idx) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: (items.length - 1 - idx) * 0.05 }}>
                <div onClick={item.onClick} className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center cursor-pointer">
                  <div className="h-4 w-4">{item.icon}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => setOpen(!open)} className="h-10 w-10 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center">
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({ items, className }) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div onMouseMove={(e) => mouseX.set(e.pageX)} onMouseLeave={() => mouseX.set(Infinity)} className={cn("mx-auto hidden md:flex h-16 gap-4 items-end rounded-2xl bg-gray-50/10 backdrop-blur-md border border-white/10 px-4 pb-3", className)}>
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, onClick }) {
  let ref = useRef(null);
  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  let height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });
  const [hovered, setHovered] = useState(false);

  return (
    <div onClick={onClick}>
      <motion.div ref={ref} style={{ width, height }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="aspect-square rounded-full bg-gray-200/20 dark:bg-neutral-800/50 flex items-center justify-center relative cursor-pointer border border-white/5">
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0, y: 10, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 2, x: "-50%" }} className="px-2 py-0.5 whitespace-pre rounded-md bg-black border border-white/10 text-white absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs">
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div className="flex items-center justify-center">{icon}</motion.div>
      </motion.div>
    </div>
  );
}
`);

createFile('components/ui/3d-card.jsx', `
"use client";
import { cn } from "@/lib/utils";
import React, { createContext, useState, useContext, useRef, useEffect } from "react";
const MouseEnterContext = createContext(undefined);
export const CardContainer = ({ children, className, containerClassName }) => {
  const containerRef = useRef(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = \`rotateY(\${x}deg) rotateX(\${y * -1}deg)\`;
  };
  const handleMouseEnter = () => { setIsMouseEntered(true); };
  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = \`rotateY(0deg) rotateX(0deg)\`;
  };
  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div className={cn("flex items-center justify-center", containerClassName)} style={{ perspective: "1000px" }}>
        <div ref={containerRef} onMouseEnter={handleMouseEnter} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={cn("flex items-center justify-center relative transition-all duration-200 ease-linear", className)} style={{ transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};
export const CardBody = ({ children, className }) => {
  return <div className={cn("h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]", className)}>{children}</div>;
};
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  return context;
};
`);

createFile('components/ui/text-generate-effect.jsx', `
"use client";
import { useEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";
export const TextGenerateEffect = ({ words, className }) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => { animate("span", { opacity: 1 }, { duration: 2, delay: 0.2 }); }, [scope.current]);
  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => (
          <motion.span key={word + idx} className="dark:text-white text-white opacity-0">{word}{" "}</motion.span>
        ))}
      </motion.div>
    );
  };
  return <div className={cn("font-bold", className)}><div className="mt-4"><div className=" dark:text-white text-white text-2xl leading-snug tracking-wide">{renderWords()}</div></div></div>;
};
`);

createFile('components/ui/hover-border-gradient.jsx', `
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
export function HoverBorderGradient({ children, containerClassName, className, as: Tag = "button", duration = 1, clockwise = true, ...props }) {
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState("TOP");
  const rotateDirection = (currentDirection) => {
    const directions = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise ? (currentIndex - 1 + directions.length) % directions.length : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };
  const movingMap = { TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)", LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)", BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)", RIGHT: "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)" };
  const highlight = "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)";
  useEffect(() => {
    if (!hovered) {
      const interval = setInterval(() => { setDirection((prevState) => rotateDirection(prevState)); }, duration * 1000);
      return () => clearInterval(interval);
    }
  }, [hovered]);
  return (
    <Tag onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={cn("relative flex rounded-full border content-center bg-black/20 hover:bg-black/10 transition duration-500 dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit", containerClassName)} {...props}>
      <div className={cn("w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit]", className)}>{children}</div>
      <motion.div className={cn("flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]")} style={{ filter: "blur(2px)", position: "absolute", width: "100%", height: "100%" }} initial={{ background: movingMap[direction] }} animate={{ background: hovered ? [movingMap[direction], highlight] : movingMap[direction] }} transition={{ ease: "linear", duration: duration ?? 1 }} />
      <div className="bg-black absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}
`);

// 5. شاشة البداية (Splash Screen)
createFile('components/IntroScreen.jsx', `
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
export const IntroScreen = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 1000); 
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial={{ opacity: 1 }} exit={{ y: "-100%", opacity: 1, transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }} className="fixed inset-0 z-[100] bg-black flex items-center justify-center flex-col">
          <motion.h1 initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="text-5xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-500">RUSSIAN MASTER</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="text-white/50 mt-4 tracking-widest text-lg">رحلتك لتعلم اللغة تبدأ هنا</motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
`);

// 6. واجهة البداية (Hero)
createFile('components/HeroSection.jsx', `
import React from "react";
import { TextGenerateEffect } from "./ui/text-generate-effect";
const russianQuote = \`Новый язык — это новая жизнь. Если ты готов изменить свой мир, начни прямо сейчас.\`;
export function HeroSection({ onStart }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-white p-10 relative z-10">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Russian Master</h1>
      <div className="max-w-2xl"><TextGenerateEffect words={russianQuote} className="text-center text-xl md:text-2xl" /></div>
      <button onClick={onStart} className="mt-12 px-8 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-all text-white backdrop-blur-sm">ابدأ التعلم</button>
    </div>
  );
}
`);

// 7. البطاقة الثلاثية الأبعاد (3D Card)
createFile('components/StudyCard.jsx', `
import React, { useState } from "react";
import { CardContainer, CardBody } from "@/components/ui/3d-card";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

export function StudyCard({ card, onResult }) {
  const [isFlipped, setIsFlipped] = useState(false);
  React.useEffect(() => { setIsFlipped(false); }, [card]);

  if (!card) return <div className="text-white text-2xl font-bold backdrop-blur-md bg-white/10 p-10 rounded-xl border border-white/10">أتممت مراجعة جميع البطاقات!</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div onClick={() => setIsFlipped(!isFlipped)} className="cursor-pointer group perspective-1000 w-[20rem] h-[26rem]">
        <CardContainer className="inter-var w-full h-full transition-all duration-200">
          <div className="relative w-full h-full duration-700 preserve-3d" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
            
            {/* Front */}
            <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                <CardBody className="w-full h-full rounded-xl p-8 border border-white/20 bg-black/40 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center text-center">
                    <div className="text-sm font-bold tracking-wider text-purple-400 mb-6 uppercase">RUSSIAN WORD</div>
                    <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 drop-shadow-sm">{card.russian}</div>
                    <div className="mt-12 text-white/30 text-xs">اضغط لقلب البطاقة</div>
                </CardBody>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <CardBody className="w-full h-full rounded-xl p-8 border border-emerald-500/30 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] flex flex-col items-center justify-center text-center">
                     <div className="text-sm font-bold tracking-wider text-emerald-400 mb-6 uppercase">ARABIC MEANING</div>
                    <div className="text-3xl font-bold text-white leading-relaxed">{card.arabic}</div>
                </CardBody>
            </div>

          </div>
        </CardContainer>
      </div>

      <div className={\`flex gap-6 mt-12 transition-all duration-500 \${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}\`}>
        <HoverBorderGradient containerClassName="rounded-full" as="button" onClick={() => onResult(card.id, false)} className="bg-black/50 text-red-400 flex items-center justify-center w-32 backdrop-blur-md"><span>أخطأت</span></HoverBorderGradient>
        <HoverBorderGradient containerClassName="rounded-full" as="button" onClick={() => onResult(card.id, true)} className="bg-black/50 text-emerald-400 flex items-center justify-center w-32 backdrop-blur-md"><span>أصبت</span></HoverBorderGradient>
      </div>
    </div>
  );
}
`);

// 8. صفحة الإدارة والجدول (Manager)
createFile('components/DataManager.jsx', `
import React, { useState } from "react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { IconTrash, IconPencil, IconSearch } from "@tabler/icons-react";

export function DataManager({ onAdd, onDelete, onUpdate, onExport, onImport, cards }) {
  const [newRussian, setNewRussian] = useState("");
  const [newArabic, setNewArabic] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editRus, setEditRus] = useState("");
  const [editAra, setEditAra] = useState("");

  const handleAdd = () => {
    if (newRussian && newArabic) { onAdd(newRussian, newArabic); setNewRussian(""); setNewArabic(""); }
  };
  const startEdit = (card) => { setEditingId(card.id); setEditRus(card.russian); setEditAra(card.arabic); };
  const saveEdit = () => { onUpdate(editingId, editRus, editAra); setEditingId(null); };

  const filteredCards = cards.filter(c => c.russian.toLowerCase().includes(search.toLowerCase()) || c.arabic.includes(search));

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 text-white h-[80vh] overflow-y-auto custom-scrollbar pb-32">
      <div className="bg-neutral-900/50 backdrop-blur-md p-6 rounded-2xl border border-white/10 mb-8 sticky top-0 z-10 shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">إضافة كلمة جديدة</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="الروسية" className="bg-black/50 border border-neutral-700 rounded-lg p-3 flex-1 text-white outline-none focus:border-cyan-500" value={newRussian} onChange={(e) => setNewRussian(e.target.value)} />
          <input type="text" placeholder="العربية" className="bg-black/50 border border-neutral-700 rounded-lg p-3 flex-1 text-white outline-none focus:border-cyan-500 text-right" value={newArabic} onChange={(e) => setNewArabic(e.target.value)} />
          <button onClick={handleAdd} className="bg-cyan-600/80 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg">إضافة</button>
        </div>
      </div>

      <div className="bg-neutral-900/30 backdrop-blur-md p-6 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white/80">قاموس الكلمات ({cards.length})</h3>
            <div className="relative">
                <IconSearch className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input type="text" placeholder="بحث..." className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-full text-sm w-40 md:w-64 focus:w-72 transition-all outline-none" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
        </div>
        <div className="flex flex-col gap-2">
            {filteredCards.length === 0 && <div className="text-center py-10 text-gray-500">لا توجد نتائج مطابقة</div>}
            {filteredCards.map(card => (
                <div key={card.id} className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all group">
                    {editingId === card.id ? (
                        <>
                             <input value={editRus} onChange={(e) => setEditRus(e.target.value)} className="bg-black/50 border border-blue-500 p-2 rounded flex-1 text-white" />
                             <input value={editAra} onChange={(e) => setEditAra(e.target.value)} className="bg-black/50 border border-blue-500 p-2 rounded flex-1 text-white text-right" />
                             <div className="flex gap-2"><button onClick={saveEdit} className="text-emerald-400 p-2 hover:bg-white/10 rounded">حفظ</button><button onClick={() => setEditingId(null)} className="text-gray-400 p-2 hover:bg-white/10 rounded">إلغاء</button></div>
                        </>
                    ) : (
                        <>
                            <div className="flex-1 font-bold text-lg">{card.russian}</div>
                            <div className="flex-1 text-right text-gray-300 dir-rtl">{card.arabic}</div>
                            <div className="flex gap-1"><span className={\`text-xs px-2 py-1 rounded \${card.level === 0 ? 'bg-gray-800' : card.level === 5 ? 'bg-emerald-900 text-emerald-300' : 'bg-blue-900 text-blue-300'}\`}>M.{card.level}</span></div>
                            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEdit(card)} className="p-2 text-blue-400 hover:bg-white/10 rounded-lg"><IconPencil size={18} /></button>
                                <button onClick={() => onDelete(card.id)} className="p-2 text-red-400 hover:bg-white/10 rounded-lg"><IconTrash size={18} /></button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
      </div>
      <div className="mt-8 flex justify-center border-t border-white/10 pt-8">
        <div className="flex gap-4">
            <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg border border-neutral-600 transition-colors text-sm">استيراد<input type="file" accept=".json" onChange={onImport} className="hidden" /></label>
            <button onClick={onExport} className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg border border-neutral-600 transition-colors text-sm">تصدير</button>
        </div>
      </div>
    </div>
  );
}
`);

// 9. صفحة الإحصائيات (Stats)
createFile('components/StatsView.jsx', `
import React from "react";
export function StatsView({ cards }) {
  const total = cards.length;
  const mastered = cards.filter(c => c.level >= 3).length;
  const learning = cards.filter(c => c.level > 0 && c.level < 3).length;
  return (
    <div className="w-full max-w-4xl mx-auto p-6 text-white">
      <h2 className="text-3xl font-bold mb-8 text-center">تقدمك التعليمي</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 backdrop-blur-md border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all"></div>
          <span className="text-6xl font-bold text-emerald-500 z-10">{mastered}</span><span className="text-sm text-neutral-400 mt-2 z-10">كلمات متقنة</span>
        </div>
        <div className="bg-neutral-900/50 backdrop-blur-md border border-yellow-500/20 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all"></div>
          <span className="text-6xl font-bold text-yellow-500 z-10">{learning}</span><span className="text-sm text-neutral-400 mt-2 z-10">قيد التعلم</span>
        </div>
        <div className="bg-neutral-900/50 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition-all"></div>
          <span className="text-6xl font-bold text-purple-500 z-10">{total}</span><span className="text-sm text-neutral-400 mt-2 z-10">إجمالي الكلمات</span>
        </div>
      </div>
      <div className="mt-12 bg-white/5 p-4 rounded-xl">
        <div className="flex justify-between mb-2 text-sm text-neutral-400"><span>نسبة الإتقان</span><span>{Math.round((mastered / total) * 100) || 0}%</span></div>
        <div className="h-4 w-full bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000" style={{ width: \`\${(mastered / total) * 100}%\` }}></div>
        </div>
      </div>
    </div>
  );
}
`);

// 10. الصفحة الرئيسية (Main Layout)
createFile('app/page.js', `
"use client";
import React, { useState, useMemo } from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconHome, IconBook, IconChartBar, IconDatabase } from "@tabler/icons-react";
import { HeroSection } from "@/components/HeroSection";
import { StudyCard } from "@/components/StudyCard";
import { StatsView } from "@/components/StatsView";
import { DataManager } from "@/components/DataManager";
import { FluidBackground } from "@/components/ui/fluid-background";
import { IntroScreen } from "@/components/IntroScreen";
import { useStudySystem } from "@/hooks/useStudySystem";

export default function RussianApp() {
  const [currentView, setCurrentView] = useState("hero");
  const [isIntroDone, setIsIntroDone] = useState(false);
  const { cards, addCard, deleteCard, updateCard, reviewCard, exportData, importData } = useStudySystem();

  const studyQueue = useMemo(() => { return cards.filter(c => c.level < 5).sort((a, b) => a.reviews - b.reviews); }, [cards]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleCardResult = (id, known) => {
    reviewCard(id, known);
    if (currentCardIndex < studyQueue.length - 1) { setCurrentCardIndex(prev => prev + 1); } 
    else { setCurrentCardIndex(0); setCurrentView("stats"); }
  };

  const navLinks = [
    { title: "الرئيسية", icon: <IconHome className="h-full w-full text-neutral-300" />, href: "#", onClick: () => setCurrentView("hero") },
    { title: "دراسة", icon: <IconBook className="h-full w-full text-neutral-300" />, href: "#", onClick: () => setCurrentView("study") },
    { title: "التقدم", icon: <IconChartBar className="h-full w-full text-neutral-300" />, href: "#", onClick: () => setCurrentView("stats") },
    { title: "القاموس", icon: <IconDatabase className="h-full w-full text-neutral-300" />, href: "#", onClick: () => setCurrentView("data") },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "hero": return <HeroSection onStart={() => setCurrentView("study")} />;
      case "study":
        return (
          <div className="h-screen flex flex-col items-center justify-center pt-10 pb-32 animate-in fade-in duration-700">
             <StudyCard card={studyQueue[currentCardIndex]} onResult={handleCardResult} />
             <p className="mt-8 text-neutral-500/80 text-sm bg-black/30 px-4 py-1 rounded-full border border-white/5">بطاقة {Math.min(currentCardIndex + 1, studyQueue.length)} من {studyQueue.length}</p>
          </div>
        );
      case "stats": return <div className="h-screen flex items-center justify-center pt-10 pb-32 animate-in fade-in zoom-in duration-500"><StatsView cards={cards} /></div>;
      case "data": return <div className="h-screen flex items-center justify-center pt-10 pb-32 animate-in slide-in-from-bottom duration-500"><DataManager onAdd={addCard} onDelete={deleteCard} onUpdate={updateCard} onExport={exportData} onImport={importData} cards={cards} /></div>;
      default: return <HeroSection onStart={() => setCurrentView("study")} />;
    }
  };

  return (
    <div className="min-h-screen overflow-hidden font-sans text-white relative">
      <IntroScreen onFinish={() => setIsIntroDone(true)} />
      <FluidBackground />
      <style jsx global>{\`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .preserve-3d { transform-style: preserve-3d; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { bg: rgba(255,255,255,0.2); rounded: 4px; }
      \`}</style>
      {isIntroDone && (
          <>
            <main className="w-full h-full relative z-10">{renderContent()}</main>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"><FloatingDock items={navLinks.map(link => ({ ...link, href: "#" }))} /></div>
          </>
      )}
    </div>
  );
}
`);

console.log("🎉 تم إنشاء مشروع Russian Master V2 بالكامل!");
console.log("👉 الآن شغل الأمر: node install.js");