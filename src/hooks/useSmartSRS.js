"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// خوارزمية SM2 معدلة مع عوامل تخصيص
export const useSmartSRS = (userId, initialCards = []) => {
  const [cards, setCards] = useState([]);
  const [userStats, setUserStats] = useState({
    totalReviews: 0,
    averageResponseTime: 0,
    weakPoints: [],
    optimalStudyTime: 'morning'
  });

  // تحميل الإحصائيات عند التهيئة
  useEffect(() => {
    if (userId) {
      loadUserStats();
    }
  }, [userId]);

  const loadUserStats = async () => {
    // جلب إحصائيات المستخدم من Firebase
    // ...
  };

  // حساب الصعوبة الديناميكية للبطاقة
  const calculateDifficulty = (card, response) => {
    const { 
      difficulty = 2.5, 
      reviewCount = 0, 
      correctStreak = 0,
      lastResponseTime = 0 
    } = card;

    let newDifficulty = difficulty;
    
    // عوامل التعديل
    if (response.correct) {
      // تخفيض الصعوبة مع زيادة السلسلة الصحيحة
      newDifficulty -= (0.1 + (correctStreak * 0.05));
      newDifficulty = Math.max(1.3, newDifficulty);
    } else {
      // زيادة الصعوبة عند الخطأ
      newDifficulty += 0.2;
      
      // إذا كان وقت الاستجابة سريعاً جداً (ربما تخمين)
      if (response.time < 2000) {
        newDifficulty += 0.1;
      }
    }

    // تعديل بناءً على وقت اليوم
    const hour = new Date().getHours();
    const isOptimalTime = (hour >= 9 && hour <= 11) || (hour >= 16 && hour <= 18);
    if (!isOptimalTime) {
      newDifficulty += 0.1;
    }

    return Math.min(5, Math.max(1, newDifficulty));
  };

  // حساب الفاصل الزمني للمراجعة التالية
  const calculateNextInterval = (card, difficulty, performance) => {
    let interval;
    const { reviewCount = 0, intervals = [] } = card;

    if (performance === 5) { // ممتاز
      if (reviewCount === 0) interval = 1;
      else if (reviewCount === 1) interval = 3;
      else if (reviewCount === 2) interval = 7;
      else {
        const lastInterval = intervals[intervals.length - 1] || 1;
        interval = Math.round(lastInterval * difficulty * 2.5);
      }
    } else if (performance >= 3) { // جيد
      if (reviewCount === 0) interval = 1;
      else {
        const lastInterval = intervals[intervals.length - 1] || 1;
        interval = Math.round(lastInterval * difficulty * 1.7);
      }
    } else { // ضعيف
      interval = 1;
    }

    // لا تتجاوز 90 يوماً
    return Math.min(90, interval);
  };

  // تحديث البطاقة بعد المراجعة
  const updateCard = useCallback(async (cardId, response) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const difficulty = calculateDifficulty(card, response);
    const nextInterval = calculateNextInterval(card, difficulty, response.performance);
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + nextInterval);

    const updatedCard = {
      ...card,
      difficulty,
      reviewCount: (card.reviewCount || 0) + 1,
      lastReviewed: new Date().toISOString(),
      nextReview: nextReview.toISOString(),
      intervals: [...(card.intervals || []), nextInterval],
      correctStreak: response.correct ? (card.correctStreak || 0) + 1 : 0,
      lastResponseTime: response.time
    };

    // تحديث حالة المستخدم
    setUserStats(prev => ({
      ...prev,
      totalReviews: prev.totalReviews + 1,
      averageResponseTime: 
        (prev.averageResponseTime * prev.totalReviews + response.time) / 
        (prev.totalReviews + 1)
    }));

    // إذا كانت الإجابة خاطئة، أضف إلى نقاط الضعف
    if (!response.correct) {
      setUserStats(prev => ({
        ...prev,
        weakPoints: [...new Set([...prev.weakPoints, card.category])]
      }));
    }

    // تحديث في Firebase
    if (userId) {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        studyStats: {
          totalReviews: userStats.totalReviews + 1,
          weakPoints: userStats.weakPoints,
          lastStudySession: new Date().toISOString()
        },
        [`cards.${cardId}`]: updatedCard
      });
    }

    // تحديث الحالة المحلية
    setCards(prev => prev.map(c => 
      c.id === cardId ? updatedCard : c
    ));

    return updatedCard;
  }, [cards, userId, userStats]);

  // الحصول على البطاقات الجاهزة للمراجعة
  const getDueCards = useCallback(() => {
    const now = new Date();
    return cards.filter(card => {
      if (!card.nextReview) return true;
      const reviewDate = new Date(card.nextReview);
      return reviewDate <= now;
    }).sort((a, b) => {
      // ترتيب حسب الأولوية
      const priorityA = (a.difficulty || 2.5) * (a.reviewCount || 0);
      const priorityB = (b.difficulty || 2.5) * (b.reviewCount || 0);
      return priorityB - priorityA;
    });
  }, [cards]);

  // توليد خطة دراسة أسبوعية
  const generateStudyPlan = useCallback(() => {
    const dueCards = getDueCards();
    const plan = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    // توزيع البطاقات على أيام الأسبوع
    dueCards.forEach((card, index) => {
      const day = Object.keys(plan)[index % 7];
      plan[day].push(card);
    });

    // إضافة بطاقات مراجعة للمواضيع الضعيفة
    userStats.weakPoints.forEach(weakPoint => {
      const weakCards = cards.filter(c => 
        c.category === weakPoint && 
        (c.reviewCount || 0) < 3
      ).slice(0, 2);

      weakCards.forEach(card => {
        plan.saturday.push(card);
        plan.sunday.push(card);
      });
    });

    return plan;
  }, [getDueCards, cards, userStats]);

  return {
    cards,
    dueCards: getDueCards(),
    userStats,
    updateCard,
    generateStudyPlan,
    getDueCards
  };
};