"use client";
import React, { useEffect, useRef, useCallback } from 'react';

const DigitalRain = React.memo(() => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    let drops = [];
    let columns = 0;
    
    // حروف روسية وأرقام (مُصححة)
    const chars = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЭЮЯ01";

    // ضبط حجم الشاشة بكفاءة
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // تقليل عدد الأعمدة للأداء (كل 30 بكسل بدلاً من 20)
      columns = Math.floor(canvas.width / 30);
      drops = new Array(columns).fill(0).map(() => Math.random() * -50);
    };
    
    // استخدام debounce للـ resize
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    };
    
    window.addEventListener('resize', handleResize);
    resize();

    // Frame rate محدود (30 FPS للأداء)
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const draw = (timestamp) => {
      // حساب الوقت للتحكم في FPS
      if (timestamp - lastTimeRef.current < frameInterval) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      lastTimeRef.current = timestamp;

      // تعتيم الخلفية تدريجياً
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '16px monospace';

      for (let i = 0; i < drops.length; i++) {
        // اختيار حرف عشوائي
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // لون متدرج بناءً على موقع القطرة
        const alpha = Math.min(1, drops[i] / 20);
        ctx.fillStyle = Math.random() > 0.97 
          ? `rgba(255, 255, 255, ${alpha})` 
          : `rgba(6, 182, 212, ${alpha * 0.8})`;
        
        ctx.fillText(text, i * 30, drops[i] * 22);

        // إعادة تعيين القطرة عند وصولها للأسفل
        if (drops[i] * 22 > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.5; // سرعة أبطأ للنعومة
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // بدء الأنيميشن
    animationRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none opacity-15 z-0 digital-rain"
      style={{ willChange: 'transform' }}
    />
  );
});

DigitalRain.displayName = 'DigitalRain';

export default DigitalRain;
