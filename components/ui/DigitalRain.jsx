"use client";
import React, { useEffect, useRef } from 'react';

const DigitalRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // ضبط حجم الشاشة
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // إعدادات المطر
    const columns = Math.floor(canvas.width / 20);
    const drops = new Array(columns).fill(0);
    const chars = "Ð10Ð¯Ð¤Ð“ÐžÐ›ÐŸÐ Ð’Ð«Ð¤Ð¦Ð£ÐšÐ•Ð Ð“Ð¨Ð©Ð—Ð¥Ðª01"; // حروف روسية وأرقام

    const draw = () => {
      // تعتيم الخلفية تدريجياً لعمل تأثير الذيل
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0'; // لون النص (سيتم تغييره بالأسفل)
      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        // تدرج لوني أزرق/سماوي ليناسب الثيم
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.95 ? '#fff' : '#06b6d4'; // أبيض أو سماوي
        
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none opacity-20 z-0" />;
};

export default DigitalRain;