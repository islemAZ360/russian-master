"use client";
import React, { useEffect, useRef } from 'react';

const DigitalRain = React.memo(() => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false }); // alpha: false يحسن الأداء
    
    let width, height, columns;
    let drops = [];
    
    // حروف المصفوفة
    const chars = "XY01"; 

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      // زيادة المسافة بين الأعمدة لتقليل عدد العناصر المرسومة (الأداء++)
      columns = Math.ceil(width / 40); 
      drops = new Array(columns).fill(0).map(() => Math.random() * -100);
    };

    window.addEventListener('resize', resize);
    resize();

    // التحكم في سرعة الإطارات (Throttling FPS)
    let lastTime = 0;
    const fps = 24; // تقليل السرعة لتبدو سينمائية وأخف
    const interval = 1000 / fps;

    const draw = (currentTime) => {
      animationRef.current = requestAnimationFrame(draw);

      if (currentTime - lastTime < interval) return;
      lastTime = currentTime;

      // تأثير الذيل المتلاشي
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)'; // خلفية شبه شفافة للمسح التدريجي
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0F0'; // لون مبدئي
      ctx.font = '14px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // تلوين عشوائي جميل (سماوي و بنفسجي)
        ctx.fillStyle = Math.random() > 0.5 ? '#6366f1' : '#06b6d4'; 
        
        // رسم الحرف
        ctx.fillText(text, i * 40, drops[i] * 20);

        // إعادة تدوير القطرة
        if (drops[i] * 20 > height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none opacity-20 z-0 mix-blend-screen"
    />
  );
});

DigitalRain.displayName = 'DigitalRain';
export default DigitalRain;