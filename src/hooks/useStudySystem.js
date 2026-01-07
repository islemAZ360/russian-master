"use client";
import { useState, useEffect, useCallback } from 'react';
import { fullDatabase } from '../data/fullDatabase'; 
import { db } from '../lib/firebase';
import { 
  doc, setDoc, collection, updateDoc, 
  deleteDoc, onSnapshot, serverTimestamp 
} from "firebase/firestore";
import { useUI } from './useUI';
import { useAuth } from './useAuth';

// إصدار النظام
const SYSTEM_PATCH_VERSION = "5.1.0-FIX-DEFAULTS";

export const useStudySystem = (firebaseUser) => {
  const { activeCategory } = useUI();
  const { userData, isTeacher, isStudent, isUser, isAdmin } = useAuth();
  
  // --- الحالات الأساسية ---
  const [cards, setCards] = useState([]); 
  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [rawContent, setRawContent] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  /**
   * 1. دمج المحتوى مع التقدم
   */
  useEffect(() => {
    // إذا لم يكن هناك محتوى خام، نعيد مصفوفة فارغة
    // ملاحظة: للأدمن واليوزر، rawContent سيحتوي على fullDatabase كحد أدنى
    if (!rawContent.length) {
        setCards([]);
        return;
    }

    const merged = rawContent.map(card => {
        const userProgress = progressMap[card.id];
        return userProgress ? { ...card, ...userProgress } : { ...card, level: 0 };
    });

    setCards(merged);
    
    // محاولة اختيار بطاقة فقط إذا لم تكن هناك بطاقة محددة
    setTimeout(() => {
        setCurrentCard(prev => prev || pickCardInternal(merged, activeCategory));
    }, 0);
    
  }, [rawContent, progressMap, activeCategory]);

  /**
   * 2. جلب المحتوى (Source of Truth) - التعديل الجوهري هنا
   */
  useEffect(() => {
    if (!firebaseUser || !userData) {
        setLoading(false);
        return;
    }

    setLoading(true);
    let unsubContent = () => {};

    // أ. الأستاذ: يرى فقط ما أنشأه
    if (isTeacher) {
        const q = collection(db, "users", firebaseUser.uid, "content");
        unsubContent = onSnapshot(q, (snap) => {
            const teacherContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setRawContent(teacherContent);
            setLoading(false);
        });
    }
    // ب. الطالب: يرى محتوى أستاذه فقط
    else if (isStudent) {
        if (userData.teacherId) {
            const q = collection(db, "users", userData.teacherId, "content");
            unsubContent = onSnapshot(q, (snap) => {
                const teacherContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setRawContent(teacherContent);
                setLoading(false);
            });
        } else {
            setRawContent([]); 
            setLoading(false);
        }
    }
    // ج. المستخدم العادي / الأدمن: يرى الافتراضي + الشخصي
    else {
        // خطوة 1: تعيين البيانات الافتراضية فوراً لضمان عدم ظهور الشاشة فارغة
        setRawContent(fullDatabase);

        // خطوة 2: الاستماع للبيانات الإضافية الخاصة ودمجها
        const q = collection(db, "users", firebaseUser.uid, "content");
        unsubContent = onSnapshot(q, (snap) => {
            const personalContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            // دمج الافتراضي مع الشخصي (الشخصي يكتب فوق الافتراضي إذا تشابهت المعرفات)
            // نستخدم Map لضمان عدم تكرار العناصر
            const combined = [...fullDatabase, ...personalContent];
            // في حال أردنا إزالة التكرار بناءً على ID (اختياري، لكن جيد للأداء)
            const uniqueMap = new Map(combined.map(item => [item.id, item]));
            
            setRawContent(Array.from(uniqueMap.values()));
            setLoading(false);
        });
    }

    return () => unsubContent();
  }, [firebaseUser, userData, isTeacher, isStudent]);

  /**
   * 3. جلب تقدم المستخدم
   */
  useEffect(() => {
    if (!firebaseUser) return;

    const userRef = doc(db, "users", firebaseUser.uid);
    const unsubStats = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({ xp: data.xp || 0, streak: data.streak || 0 });
      }
    });

    const progressColl = collection(db, "users", firebaseUser.uid, "progress");
    const unsubProgress = onSnapshot(progressColl, (snap) => {
        const map = {};
        snap.docs.forEach(d => { map[d.id] = d.data(); });
        setProgressMap(map);
    });

    return () => {
        unsubStats();
        unsubProgress();
    };
  }, [firebaseUser]);

  // دالة مساعدة لاختيار البطاقة (خارج الـ Hook لتستخدم داخل useEffect أيضا)
  const pickCardInternal = (list, category, excludeId = null) => {
      if (!list || list.length === 0) return null;
      const now = Date.now();
      
      let pool = category === 'All' ? list : list.filter(c => c.category === category);
      if (excludeId) pool = pool.filter(c => c.id !== excludeId);

      const due = pool.filter(c => (c.level || 0) < 5 && (!c.nextReview || c.nextReview <= now));

      if (due.length > 0) return due[Math.floor(Math.random() * due.length)];
      if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
      return null;
  };

  /**
   * 4. خوارزمية اختيار الكارت
   */
  const pickNextCard = useCallback((currentList, excludeId = null) => {
    const next = pickCardInternal(currentList, activeCategory, excludeId);
    setCurrentCard(next);
  }, [activeCategory]);

  /**
   * 5. معالجة السحب
   */
  const handleSwipe = useCallback(async (direction) => {
    if (!currentCard || !firebaseUser) return;
    
    const known = direction === 'right';
    const oldLevel = currentCard.level || 0;
    const nextLevel = known ? Math.min(oldLevel + 1, 5) : 0;
    
    const intervals = [1, 60, 1440, 4320, 10080, 43200]; 
    const minutesToAdd = known ? intervals[nextLevel] : 5;
    const nextReview = Date.now() + (minutesToAdd * 60 * 1000);

    const updatedCard = { ...currentCard, level: nextLevel, nextReview };
    const newCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(newCards);
    
    // اختيار التالي فوراً
    pickNextCard(newCards, currentCard.id);

    try {
      const progressRef = doc(db, "users", firebaseUser.uid, "progress", String(currentCard.id));
      await setDoc(progressRef, { 
          level: nextLevel, 
          nextReview,
          lastStudied: serverTimestamp()
      }, { merge: true });
      
      if (known) {
        await updateDoc(doc(db, "users", firebaseUser.uid), { 
            xp: (stats.xp || 0) + 10,
            lastActivity: serverTimestamp()
        });
      }
    } catch (e) { console.error(e); }
  }, [currentCard, firebaseUser, cards, stats.xp, pickNextCard]);

  // --- CRUD ---

  const addCard = useCallback(async (cardData) => {
    if (isStudent) {
        alert("Students cannot create new cards.");
        return;
    }
    const newId = String(Date.now());
    const collectionPath = "content"; 
    
    if (firebaseUser) {
        await setDoc(doc(db, "users", firebaseUser.uid, collectionPath, newId), {
            ...cardData,
            createdAt: serverTimestamp()
        });
    }
  }, [firebaseUser, isStudent]);

  const deleteCard = useCallback(async (cardId) => {
    if (isStudent) return; 
    if (firebaseUser) {
        try {
            // محاولة الحذف من البيانات الشخصية
            await deleteDoc(doc(db, "users", firebaseUser.uid, "content", String(cardId)));
            // ملاحظة: لا يمكن حذف البيانات الافتراضية لأنها hardcoded في الملف، ولكن هذا سيحذفها من العرض إذا كانت مضافة
        } catch (e) { console.error(e); }
    }
  }, [firebaseUser, isStudent]);

  const updateCard = useCallback(async (cardId, newData) => {
    if (isStudent) return;
    if (firebaseUser) {
        try {
            // إذا كانت الكلمة أصلية (من fullDatabase)، سنقوم بإنشاء نسخة معدلة منها في الـ content الخاص بالمستخدم
            await setDoc(doc(db, "users", firebaseUser.uid, "content", String(cardId)), newData, { merge: true });
        } catch (e) { console.error(e); }
    }
  }, [firebaseUser, isStudent]);

  return { 
    cards, 
    currentCard, 
    stats, 
    handleSwipe, 
    loading, 
    addCard, 
    deleteCard, 
    updateCard,
    isBanned: userData?.isBanned || false
  };
};