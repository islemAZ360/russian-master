"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { fullDatabase } from '../data/fullDatabase'; 
import { db } from '../lib/firebase';
import { 
  doc, setDoc, collection, getDocs, updateDoc, 
  deleteDoc, writeBatch, onSnapshot, serverTimestamp 
} from "firebase/firestore";
import { useUI } from './useUI';

// إصدار النظام: تحديث هذا الرقم سيؤدي لتصفير الكاش لدى كافة المستخدمين لضمان الاستقرار
const SYSTEM_PATCH_VERSION = "4.2.0";

/**
 * هوك نظام الدراسة المركزي (useStudySystem)
 * المسؤول عن خوارزمية التعلم، مزامنة البيانات، وإدارة مستودع الكلمات
 */
export const useStudySystem = (user) => {
  const { activeCategory } = useUI();
  
  // --- الحالات الأساسية ---
  const [cards, setCards] = useState(fullDatabase); 
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'user' });
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  /**
   * 1. بروتوكول صيانة النظام (Maintenance Protocol)
   * يقوم بتنظيف localStorage عند رصد تحديث جديد للنظام
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedVersion = localStorage.getItem('RM_SYSTEM_VERSION');
    
    if (savedVersion !== SYSTEM_PATCH_VERSION) {
      console.warn("System Update Detected. Synchronizing Neural Cache...");
      // تنظيف الكاش مع الحفاظ على بيانات الجلسة (Auth)
      const authKey = Object.keys(localStorage).find(k => k.includes('firebase:authUser'));
      const authVal = authKey ? localStorage.getItem(authKey) : null;
      
      localStorage.clear();
      
      if (authKey && authVal) localStorage.setItem(authKey, authVal);
      localStorage.setItem('RM_SYSTEM_VERSION', SYSTEM_PATCH_VERSION);
    }
  }, []);

  /**
   * 2. خوارزمية اختيار الكارت التالي (Smart Picker)
   * تختار الكارت بناءً على: الفئة النشطة، مستوى الإتقان، وعدم التكرار الفوري
   */
  const pickNextCard = useCallback((currentList, excludeId = null) => {
    if (!currentList || currentList.length === 0) {
      setCurrentCard(null);
      return;
    }

    const now = Date.now();
    
    // أ. التصفية حسب الفئة المختارة (إذا لم تكن 'All')
    let pool = activeCategory === 'All' 
      ? currentList 
      : currentList.filter(c => c.category === activeCategory);

    // ب. استبعاد الكارت الحالي لمنع التكرار الممل
    if (excludeId) {
        pool = pool.filter(c => c.id !== excludeId);
    }

    // ج. البحث عن الكروت التي حان موعد مراجعتها (Due Cards)
    // الكروت الجديدة (Level 0) لها أولوية قصوى
    const due = pool.filter(c => 
        (c.level || 0) < 5 && 
        (!c.nextReview || c.nextReview <= now)
    );

    if (due.length > 0) {
      // اختيار عشوائي من قائمة "المستحق للمراجعة"
      const randomIndex = Math.floor(Math.random() * due.length);
      setCurrentCard(due[randomIndex]);
    } else if (pool.length > 0) {
      // إذا انتهت المراجعات، ندخل في وضع "المراجعة المستمرة" (Overdrive)
      const randomIndex = Math.floor(Math.random() * pool.length);
      setCurrentCard(pool[randomIndex]);
    } else {
      setCurrentCard(null);
    }
  }, [activeCategory]);

  /**
   * 3. مزامنة البيانات مع Firestore
   */
  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    // مراقبة إحصائيات المستخدم (XP) في الوقت الفعلي
    const userRef = doc(db, "users", user.uid);
    const unsubStats = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats(data);
        if (data.isBanned) setIsBanned(true);
      }
    });

    // جلب تقدم المستخدم في الكروت
    const fetchUserProgress = async () => {
      try {
        const cardsCollection = collection(db, "users", user.uid, "personal_cards");
        const snapshot = await getDocs(cardsCollection);
        
        if (!snapshot.empty) {
          const userProgressMap = new Map(snapshot.docs.map(d => [d.id, d.data()]));
          
          // دمج قاعدة البيانات الشاملة مع تقدم المستخدم الحالي
          const merged = fullDatabase.map(card => {
            const progress = userProgressMap.get(String(card.id));
            return progress ? { ...card, ...progress } : { ...card, level: 0 };
          });
          
          setCards(merged);
          pickNextCard(merged);
        } else {
          // مستخدم جديد: تهيئة الواجهة بالقاعدة الافتراضية
          setCards(fullDatabase.map(c => ({...c, level: 0})));
          pickNextCard(fullDatabase);
        }
      } catch (err) {
        console.error("Neural Data Fetch Failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
    return () => unsubStats();
  }, [user, pickNextCard]);

  /**
   * 4. معالجة التفاعل (Swipe Logic)
   * تحديث مستوى الكارت وحفظ التقدم في السحابة
   */
  const handleSwipe = useCallback(async (direction) => {
    if (!currentCard || !user || isBanned) return;
    
    const known = direction === 'right';
    const oldLevel = currentCard.level || 0;
    
    // خوارزمية التكرار المتباعد (SRS Logic)
    // المستوى 5 هو الإتقان الكامل
    const nextLevel = known ? Math.min(oldLevel + 1, 5) : 0;
    
    // تحديد موعد المراجعة القادم (مضاعفات زمنية)
    const reviewIntervals = [
        60000,           // Level 0 -> 1 min
        3600000,         // Level 1 -> 1 hour
        86400000,        // Level 2 -> 1 day
        259200000,       // Level 3 -> 3 days
        604800000,       // Level 4 -> 1 week
        2592000000       // Level 5 -> 1 month (Mastered)
    ];
    
    const nextReview = Date.now() + (known ? reviewIntervals[nextLevel] : 30000);

    const updatedCard = { 
        ...currentCard, 
        level: nextLevel, 
        nextReview,
        lastStudied: Date.now() 
    };

    // أ. تحديث الحالة المحلية فوراً (Optimistic UI)
    const newCardsList = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(newCardsList);
    
    // اختيار الكارت التالي فوراً
    pickNextCard(newCardsList, currentCard.id);

    // ب. المزامنة مع Firestore في الخلفية
    try {
      const cardRef = doc(db, "users", user.uid, "personal_cards", String(currentCard.id));
      await setDoc(cardRef, { 
          level: nextLevel, 
          nextReview, 
          category: currentCard.category,
          russian: currentCard.russian,
          arabic: currentCard.arabic
      }, { merge: true });
      
      if (known) {
        await updateDoc(doc(db, "users", user.uid), { 
            xp: (stats.xp || 0) + 10,
            lastActivity: serverTimestamp()
        });
      }
    } catch (e) { console.error("Database Update Desync:", e); }
  }, [currentCard, user, cards, stats.xp, isBanned, pickNextCard]);

  // --- وظائف الإدارة (Admin Functions) ---

  const addCard = useCallback(async (cardData) => {
    const newId = Date.now();
    const newCard = { ...cardData, id: newId, level: 0, nextReview: Date.now() };
    setCards(prev => [newCard, ...prev]);
    
    if (user) {
      await setDoc(doc(db, "users", user.uid, "personal_cards", String(newId)), newCard);
    }
  }, [user]);

  const deleteCard = useCallback(async (cardId) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    if (user) {
      await deleteDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)));
    }
  }, [user]);

  const updateCard = useCallback(async (cardId, newData) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...newData } : c));
    if (user) {
      await updateDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)), newData);
    }
  }, [user]);

  return { 
    cards, 
    currentCard, 
    stats, 
    handleSwipe, 
    loading, 
    addCard, 
    deleteCard, 
    updateCard,
    isBanned 
  };
};