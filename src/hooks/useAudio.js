import { useState, useEffect, useCallback, useRef } from 'react';

export const useAudio = () => {
  const [settings, setSettings] = useState({ sound: true, sfx: true, haptics: true });
  const audioContextRef = useRef(null);
  const ambientNodeRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('russian_settings_v12');
    if (saved) setSettings(JSON.parse(saved));

    const initAudio = () => {
        if (!audioContextRef.current) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) audioContextRef.current = new AudioCtx();
        }
    };

    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    
    return () => {
        window.removeEventListener('click', initAudio);
        window.removeEventListener('keydown', initAudio);
        if (ambientNodeRef.current) ambientNodeRef.current.stop();
    };
  }, []);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('russian_settings_v12', JSON.stringify(newSettings));
  };

  // --- Haptics Logic ---
  const triggerHaptic = useCallback((pattern = [10]) => {
      if (settings.haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
      }
  }, [settings.haptics]);

  // --- Sound FX Logic ---
  const playSFX = useCallback((type) => {
    if (!settings.sfx || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
        gain.gain.setValueAtTime(0.05, t); // Lower volume
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
    } else if (type === 'success') {
        // Futuristic Success Chord
        const playNote = (f, d, type='triangle') => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.type = type;
            o.frequency.value = f;
            g.gain.setValueAtTime(0.05, t + d);
            g.gain.exponentialRampToValueAtTime(0.001, t + d + 0.4);
            o.start(t + d);
            o.stop(t + d + 0.4);
        };
        playNote(523.25, 0, 'sine'); 
        playNote(1046.50, 0.1, 'square'); 
        triggerHaptic([10, 30, 10]);
    } else if (type === 'error') {
        // Glitchy Error
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.3);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        triggerHaptic([50, 50, 50]);
    } else if (type === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.linearRampToValueAtTime(0, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
    }
  }, [settings.sfx, triggerHaptic]);

  const speak = useCallback((text, lang = 'ru-RU') => {
    if (!settings.sound) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; 
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, [settings.sound]);

  return { settings, saveSettings, playSFX, speak, triggerHaptic };
};