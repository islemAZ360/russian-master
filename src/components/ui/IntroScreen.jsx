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