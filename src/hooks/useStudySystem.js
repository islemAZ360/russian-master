"use client";
import { useState, useEffect, useCallback } from 'react';
import { fullDatabase } from '../data/fullDatabase'; 
import { db } from '../lib/firebase';
import { 
  doc, setDoc, collection, updateDoc, 
  deleteDoc, onSnapshot, serverTimestamp 
} from "firebase/firestore";
import { useUI } from './useUI';
import { useAuth } from './useAuth'; // إضافة استدعاء useAuth

// إصدار النظام: لضمان تحديث الكاش عند التغييرات الجذرية
const SYSTEM_PATCH_VERSION = "5.0.0-RBAC";

/**
 * هوك نظام الدراسة المركزي (useStudySystem)
 * النسخة المحدثة: تدعم تعدد المصادر بناءً على الرتبة (RBAC)
 */
export const useStudySystem = (firebaseUser) => {
  const { activeCategory } = useUI();
  // نحصل على بيانات الرتبة وتفاصيل المستخدم من الكونتكست مباشرة
  const { userData, isTeacher, isStudent, isUser, isAdmin } = useAuth();
  
  // --- الحالات الأساسية ---
  const [cards, setCards] = useState([]); 
  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // تخزين المحتوى الخام (الكلمات) والتقدم (المستويات) بشكل منفصل لدمجهما
  const [rawContent, setRawContent] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  /**
   * 1. دمج المحتوى مع التقدم (Data Merging Logic)
   * تأخذ الكلمات وتدمج معها مستوى الحفظ الخاص بالمستخدم الحالي
   */
  useEffect(() => {
    if (!rawContent.length) {
        setCards([]);
        return;
    }

    const merged = rawContent.map(card => {
        // البحث عن تقدم المستخدم لهذه البطاقة
        const userProgress = progressMap[card.id];
        return userProgress ? { ...card, ...userProgress } : { ...card, level: 0 };
    });

    setCards(merged);
    
    // إذا لم تكن هناك بطاقة محددة حالياً، نختار واحدة
    // (نستخدم setTimeout لتجنب تعارض تحديث الحالة أثناء الرندرة)
    setTimeout(() => {
        pickNextCard(merged);
    }, 0);
    
  }, [rawContent, progressMap]); // إعادة الدمج عند تغير المحتوى أو التقدم

  /**
   * 2. جلب "محتوى" الكلمات (Source of Truth)
   * يختلف المصدر بناءً على الرتبة
   */
  useEffect(() => {
    if (!firebaseUser || !userData) {
        setLoading(false);
        return;
    }

    setLoading(true);
    let unsubContent = () => {};

    // أ. الأستاذ: يرى المحتوى الذي أنشأه في مجموعته الخاصة
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
            // طالب بدون أستاذ؟ (حالة نادرة)
            setRawContent([]); 
            setLoading(false);
        }
    }
    // ج. المستخدم العادي / الأدمن: يرى البيانات الافتراضية + إضافاته الشخصية
    else {
        // أولاً نضع البيانات الافتراضية
        // ثم نراقب الإضافات الشخصية
        const q = collection(db, "users", firebaseUser.uid, "content");
        unsubContent = onSnapshot(q, (snap) => {
            const personalContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // دمج الافتراضي مع الشخصي
            setRawContent([...fullDatabase, ...personalContent]);
            setLoading(false);
        });
    }

    return () => unsubContent();
  }, [firebaseUser, userData, isTeacher, isStudent]);

  /**
   * 3. جلب "تقدم" المستخدم (User Progress)
   * هذا دائماً في مجموعة المستخدم الخاصة، بغض النظر عن رتبته
   */
  useEffect(() => {
    if (!firebaseUser) return;

    // مراقبة إحصائيات XP والستريك
    const userRef = doc(db, "users", firebaseUser.uid);
    const unsubStats = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({ xp: data.xp || 0, streak: data.streak || 0 });
      }
    });

    // مراقبة تقدم الكروت (Level, NextReview)
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

  /**
   * 4. خوارزمية اختيار الكارت (Smart Picker)
   */
  const pickNextCard = useCallback((currentList, excludeId = null) => {
    if (!currentList || currentList.length === 0) {
      setCurrentCard(null);
      return;
    }

    const now = Date.now();
    
    // التصفية حسب الفئة
    let pool = activeCategory === 'All' 
      ? currentList 
      : currentList.filter(c => c.category === activeCategory);

    if (excludeId) pool = pool.filter(c => c.id !== excludeId);

    // البحث عن المستحق للمراجعة
    const due = pool.filter(c => (c.level || 0) < 5 && (!c.nextReview || c.nextReview <= now));

    if (due.length > 0) {
      setCurrentCard(due[Math.floor(Math.random() * due.length)]);
    } else if (pool.length > 0) {
      setCurrentCard(pool[Math.floor(Math.random() * pool.length)]);
    } else {
      setCurrentCard(null);
    }
  }, [activeCategory]);

  /**
   * 5. معالجة السحب (Swipe) - تسجيل التقدم
   */
  const handleSwipe = useCallback(async (direction) => {
    if (!currentCard || !firebaseUser) return;
    
    const known = direction === 'right';
    const oldLevel = currentCard.level || 0;
    const nextLevel = known ? Math.min(oldLevel + 1, 5) : 0;
    
    // فواصل زمنية للمراجعة (SRS)
    const intervals = [1, 60, 1440, 4320, 10080, 43200]; // بالدقيقة
    const minutesToAdd = known ? intervals[nextLevel] : 5;
    const nextReview = Date.now() + (minutesToAdd * 60 * 1000);

    // تحديث محلي سريع (Optimistic)
    const updatedCard = { ...currentCard, level: nextLevel, nextReview };
    const newCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(newCards);
    pickNextCard(newCards, currentCard.id);

    // حفظ في Firestore (في كولكشن progress دائماً)
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
    } catch (e) { console.error("Save Progress Error:", e); }
  }, [currentCard, firebaseUser, cards, stats.xp, pickNextCard]);

  // --- وظائف الإدارة (CRUD Functions) ---

  const addCard = useCallback(async (cardData) => {
    // الطالب ممنوع من الإضافة
    if (isStudent) {
        alert("Students cannot create new cards.");
        return;
    }

    const newId = String(Date.now());
    // الأستاذ والمستخدم يضيفون في المحتوى الخاص بهم
    const collectionPath = isTeacher || isUser || isAdmin ? "content" : null;
    
    if (collectionPath && firebaseUser) {
        await setDoc(doc(db, "users", firebaseUser.uid, collectionPath, newId), {
            ...cardData,
            createdAt: serverTimestamp()
        });
    }
  }, [firebaseUser, isStudent, isTeacher, isUser, isAdmin]);

  const deleteCard = useCallback(async (cardId) => {
    if (isStudent) return; // الطالب لا يحذف

    // محاولة الحذف من المحتوى الخاص
    if (firebaseUser) {
        try {
            await deleteDoc(doc(db, "users", firebaseUser.uid, "content", String(cardId)));
        } catch (e) { console.error(e); }
    }
  }, [firebaseUser, isStudent]);

  const updateCard = useCallback(async (cardId, newData) => {
    if (isStudent) return; // الطالب لا يعدل المحتوى

    if (firebaseUser) {
        try {
            await updateDoc(doc(db, "users", firebaseUser.uid, "content", String(cardId)), newData);
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