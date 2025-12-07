import { useState, useEffect, useCallback } from 'react';

export const useAudio = () => {
  const [settings, setSettings] = useState({ sound: true, sfx: true });
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('russian_settings_v12');
    if (saved) setSettings(JSON.parse(saved));
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) setAudioContext(new AudioCtx());
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('russian_settings_v12', JSON.stringify(newSettings));
  };

  const playSFX = useCallback((type) => {
    if (!settings.sfx || !audioContext) return;
    if (audioContext.state === 'suspended') audioContext.resume();

    const t = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
    } else if (type === 'success') {
        const playNote = (f, d) => {
            const o = audioContext.createOscillator();
            const g = audioContext.createGain();
            o.connect(g);
            g.connect(audioContext.destination);
            o.type = 'triangle';
            o.frequency.value = f;
            g.gain.setValueAtTime(0.05, t + d);
            g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.3);
            o.start(t + d);
            o.stop(t + d + 0.3);
        };
        playNote(523.25, 0); playNote(659.25, 0.1); playNote(1046.50, 0.2);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.2);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
    }
  }, [settings.sfx, audioContext]);

  // دالة نطق ذكية تدعم اللغتين
  const speak = useCallback((text, lang = 'ru-RU') => {
    if (!settings.sound) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; 
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, [settings.sound]);

  return { settings, saveSettings, playSFX, speak };
};