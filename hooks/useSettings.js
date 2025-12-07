import { useState, useEffect } from 'react';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    sound: true, // تفعيل النطق
    theme: 'purple', // purple, cyan, orange, emerald
    particles: true // تفعيل الخلفية المتحركة
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('russian_settings_v1');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('russian_settings_v1', JSON.stringify(settings));
    }
  }, [settings, isLoaded]);

  const toggleSound = () => setSettings(s => ({ ...s, sound: !s.sound }));
  const toggleParticles = () => setSettings(s => ({ ...s, particles: !s.particles }));
  const setTheme = (color) => setSettings(s => ({ ...s, theme: color }));

  // دالة النطق (Text-to-Speech)
  const speak = (text) => {
    if (!settings.sound) return;
    // إيقاف أي صوت سابق
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU'; // اللغة الروسية
    utterance.rate = 0.8; // سرعة أبطأ قليلاً للوضوح
    window.speechSynthesis.speak(utterance);
  };

  return { settings, toggleSound, toggleParticles, setTheme, speak };
};