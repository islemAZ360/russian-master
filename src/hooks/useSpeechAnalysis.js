"use client";

import { useState, useRef, useCallback } from 'react';

export const useSpeechAnalysis = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [pronunciationScore, setPronunciationScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [waveform, setWaveform] = useState([]);
  const [comparison, setComparison] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recordingRef = useRef([]);
  const animationRef = useRef(null);

  // تهيئة تحليل الصوت
  const initAudioAnalysis = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      mediaStreamRef.current = stream;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      return true;
    } catch (error) {
      console.error('Error initializing audio:', error);
      setFeedback('لا يمكن الوصول إلى الميكروفون');
      return false;
    }
  }, []);

  // بدء التسجيل والتحليل
  const startAnalysis = useCallback(async (referenceAudio = null) => {
    if (!await initAudioAnalysis()) return;
    
    setIsRecording(true);
    recordingRef.current = [];
    
    const analyzeFrame = () => {
      if (!isRecording || !analyserRef.current) return;
      
      // تحليل الموجة
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteTimeDomainData(dataArray);
      
      // حساب مستوى الصوت
      const rms = Math.sqrt(
        dataArray.reduce((sum, val) => sum + Math.pow((val - 128) / 128, 2), 0) / dataArray.length
      );
      setAudioLevel(Math.min(100, rms * 1000));
      
      // تحديث الموجة المرئية
      setWaveform(prev => [...prev.slice(-50), rms].filter(Boolean));
      
      // تسجيل البيانات للتحليل لاحقاً
      recordingRef.current.push([...dataArray]);
      
      animationRef.current = requestAnimationFrame(analyzeFrame);
    };
    
    animationRef.current = requestAnimationFrame(analyzeFrame);
  }, [isRecording, initAudioAnalysis]);

  // إيقاف التحليل
  const stopAnalysis = useCallback(() => {
    setIsRecording(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // تحليل التسجيل
    analyzeRecording();
  }, []);

  // تحليل التسجيل المحفوظ
  const analyzeRecording = useCallback(() => {
    if (recordingRef.current.length === 0) return;
    
    // حساب متوسط الصوت
    const avgVolume = recordingRef.current.reduce((sum, frame) => {
      const frameVolume = frame.reduce((s, v) => s + Math.abs(v - 128), 0) / frame.length;
      return sum + frameVolume;
    }, 0) / recordingRef.current.length;
    
    // حساب التغير في النبرة
    const pitchVariance = calculatePitchVariance(recordingRef.current);
    
    // حساب النتيجة
    let score = 70; // درجة أساسية
    
    // تحسين بناءً على مستوى الصوت
    if (avgVolume > 20 && avgVolume < 80) {
      score += 10;
    }
    
    // تحسين بناءً على ثبات النبرة
    if (pitchVariance < 30) {
      score += 10;
    }
    
    // تحسين بناءً على طول التسجيل
    if (recordingRef.current.length > 100) {
      score += 10;
    }
    
    score = Math.min(100, score);
    setPronunciationScore(score);
    
    // تقديم تغذية راجعة
    provideFeedback(score, avgVolume, pitchVariance);
  }, []);

  // حساب تغير النبرة
  const calculatePitchVariance = (frames) => {
    const pitches = frames.map(frame => {
      // خوارزمية بسيطة للكشف عن النبرة
      let maxVal = 0;
      let maxIndex = 0;
      
      for (let i = 0; i < frame.length; i++) {
        if (frame[i] > maxVal) {
          maxVal = frame[i];
          maxIndex = i;
        }
      }
      
      return maxIndex;
    });
    
    // حساب التباين
    const mean = pitches.reduce((a, b) => a + b, 0) / pitches.length;
    const variance = pitches.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / pitches.length;
    
    return Math.sqrt(variance);
  };

  // تقديم تغذية راجعة
  const provideFeedback = (score, volume, variance) => {
    let feedbackText = '';
    
    if (score >= 90) {
      feedbackText = 'ممتاز! نطقك صحيح تماماً 👏';
    } else if (score >= 80) {
      feedbackText = 'جيد جداً! مع بعض التمارين ستصل للكمال';
    } else if (score >= 70) {
      feedbackText = 'ليس سيئاً، لكن تحتاج لممارسة أكثر';
    } else {
      feedbackText = 'تحتاج لتحسين النطق. استمع للنموذج وجرب مجدداً';
    }
    
    // نصائح محددة
    const tips = [];
    if (volume < 20) {
      tips.push('ارفع صوتك قليلاً');
    }
    if (volume > 80) {
      tips.push('خفض صوتك قليلاً');
    }
    if (variance > 40) {
      tips.push('حاول تثبيت نبرة صوتك');
    }
    
    if (tips.length > 0) {
      feedbackText += `\n\nنصائح:\n${tips.map(tip => `• ${tip}`).join('\n')}`;
    }
    
    setFeedback(feedbackText);
  };

  // مقارنة مع نطق مرجعي
  const compareWithReference = useCallback(async (referenceText) => {
    // في الإصدار الحقيقي، هنا نستخدم نموذج ML لمقارنة النطق
    // هذا مثال محاكاة
    
    const similarity = Math.random() * 30 + 70; // محاكاة
    const differences = [
      { sound: 'р', accuracy: 85, tip: 'الراء الروسية تحتاج لاهتزاز اللسان' },
      { sound: 'ы', accuracy: 60, tip: 'هذا الصوت غير موجود في العربية، يحتاج تمرين' },
      { sound: 'щ', accuracy: 75, tip: 'شديد التشديد' }
    ];
    
    setComparison({
      similarity,
      differences,
      referenceText
    });
    
    return similarity;
  }, []);

  // توليد تمارين بناءً على النتائج
  const generateExercises = useCallback(() => {
    const exercises = [];
    
    if (pronunciationScore < 80) {
      exercises.push({
        type: 'minimal_pairs',
        title: 'أزواج صوتية متشابهة',
        description: 'تمييز الأصوات المتقاربة في الروسية',
        duration: '5 دقائق'
      });
    }
    
    if (comparison?.differences?.some(d => d.accuracy < 70)) {
      exercises.push({
        type: 'problem_sounds',
        title: 'الأصوات الصعبة',
        description: 'تركيز على الأصوات التي تحتاج تحسين',
        duration: '10 دقائق'
      });
    }
    
    exercises.push({
      type: 'intonation',
      title: 'النبرة والإيقاع',
      description: 'تحسين الموسيقى الكلامية للغة',
      duration: '7 دقائق'
    });
    
    return exercises;
  }, [pronunciationScore, comparison]);

  return {
    // الحالة
    isRecording,
    audioLevel,
    pitch,
    pronunciationScore,
    feedback,
    waveform,
    comparison,
    
    // الدوال
    startAnalysis,
    stopAnalysis,
    compareWithReference,
    generateExercises,
    
    // مساعدات
    getScoreColor: () => {
      if (pronunciationScore >= 90) return '#10B981';
      if (pronunciationScore >= 80) return '#3B82F6';
      if (pronunciationScore >= 70) return '#F59E0B';
      return '#EF4444';
    },
    
    getWaveformData: () => {
      return waveform.map((value, index) => ({
        x: index,
        y: value * 100
      }));
    }
  };
};