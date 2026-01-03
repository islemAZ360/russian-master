"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_TEXTS = [
    "INITIALIZING KERNEL...",
    "LOADING NEURAL MODULES...",
    "BYPASSING SECURITY FIREWALL...",
    "CONNECTING TO MAIN MAINFRAME...",
    "DECRYPTING USER DATA...",
    "SYSTEM CHECK: OK",
    "ACCESS GRANTED."
];

export default function IntroSequence({ onComplete }) {
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    let delay = 0;
    BOOT_TEXTS.forEach((text, i) => {
        delay += Math.random() * 300 + 100;
        setTimeout(() => {
            setLines(prev => [...prev, text]);
            // تشغيل صوت نقر بسيط (اختياري)
        }, delay);
    });

    setTimeout(onComplete, delay + 800);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col justify-end p-10 font-mono text-xs md:text-sm overflow-hidden">
        {/* CRT Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[2] bg-[length:100%_2px,3px_100%] pointer-events-none"></div>
        
        <div className="text-cyan-500 mb-4 animate-pulse">
             Running /root/boot_sequence.sh
        </div>
        
        <div className="flex flex-col gap-1">
            {lines.map((line, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`${i === lines.length - 1 ? 'text-emerald-500 font-bold' : 'text-cyan-700'}`}
                >
                    <span className="mr-2">[{new Date().toLocaleTimeString()}]</span>
                    {`> ${line}`}
                </motion.div>
            ))}
        </div>
        
        <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: "100%" }} 
            transition={{ duration: 2, ease: "easeInOut" }}
            className="h-1 bg-cyan-500 mt-4 shadow-[0_0_10px_#06b6d4]" 
        />
    </div>
  );
}