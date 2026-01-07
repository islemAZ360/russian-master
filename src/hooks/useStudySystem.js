"use client";
import { useState, useEffect, useCallback } from 'react';
import { fullDatabase } from '@/data/fullDatabase'; 
import { db } from '@/lib/firebase';
import { 
  doc, setDoc, collection, updateDoc, 
  deleteDoc, onSnapshot, serverTimestamp 
} from "firebase/firestore";
import { useUI } from './useUI';
import { useAuth } from './useAuth';

const SYSTEM_VERSION = "5.3.0-CONTENT-SYNC";

export const useStudySystem = (firebaseUser) => {
  const { activeCategory } = useUI();
  const { userData, isTeacher, isStudent, isAdmin } = useAuth();
  
  const [cards, setCards] = useState([]); 
  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [rawContent, setRawContent] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  /**
   * 1. تنظيف الكاش عند التحديث لضمان تحميل المحتوى الجديد
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedVer = localStorage.getItem('RM_SYS_VER');
    if (savedVer !== SYSTEM_VERSION) {
      // مسح الكاش القديم الخاص بالمحتوى فقط
      localStorage.removeItem('cached_content');
      localStorage.setItem('RM_SYS_VER', SYSTEM_VERSION);
    }
  }, []);

  /**
   * 2. دمج المحتوى (Content) مع التقدم (Progress)
   * يتم دمج بيانات البطاقة الأصلية مع مستوى حفظ المستخدم لها
   */
  useEffect(() => {
    if (!rawContent.length) {
        setCards([]);
        return;
    }

    const merged = rawContent.map(card => {
        const userProgress = progressMap[card.id];
        return userProgress ? { ...card, ...userProgress } : { ...card, level: 0 };
    });

    setCards(merged);
    
    // اختيار بطاقة جديدة إذا لم تكن هناك بطاقة محددة
    const timer = setTimeout(() => {
        setCurrentCard(prev => prev || pickCardInternal(merged, activeCategory));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [rawContent, progressMap, activeCategory]);

  /**
   * 3. جلب المحتوى (Content Fetching Strategy)
   * هذه أهم جزئية في النظام التعليمي
   */
  useEffect(() => {
    if (!firebaseUser) {
        setLoading(false);
        return;
    }

    setLoading(true);
    let unsubContent = () => {};

    try {
        // السيناريو أ: الأستاذ (Teacher)
        // يرى المحتوى الذي قام هو بإنشائه في مجموعته الخاصة
        if (isTeacher) {
            const q = collection(db, "users", firebaseUser.uid, "content");
            unsubContent = onSnapshot(q, (snap) => {
                const teacherContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // إذا لم يكن لديه محتوى، يمكن دمج المحتوى العام كبداية (اختياري)
                setRawContent(teacherContent.length > 0 ? teacherContent : fullDatabase);
                setLoading(false);
            });
        }
        
        // السيناريو ب: الطالب (Student)
        // يجب أن يرى محتوى أستاذه (Commander) فقط
        else if (isStudent) {
            if (userData?.teacherId) {
                // الاشتراك في مجموعة "content" الخاصة بالأستاذ
                const q = collection(db, "users", userData.teacherId, "content");
                unsubContent = onSnapshot(q, (snap) => {
                    const assignedContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    
                    if (assignedContent.length > 0) {
                        setRawContent(assignedContent);
                    } else {
                        // إذا لم يضف الأستاذ شيئاً بعد، نعرض رسالة أو المحتوى العام
                        // هنا نفضل المحتوى العام حتى لا تكون الشاشة فارغة
                        setRawContent(fullDatabase); 
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Access to teacher content denied:", error);
                    setRawContent(fullDatabase); // Fallback secure
                    setLoading(false);
                });
            } else {
                // طالب بدون أستاذ (حالة نادرة) -> محتوى عام
                setRawContent(fullDatabase);
                setLoading(false);
            }
        }
        
        // السيناريو ج: المستخدم العادي أو الأدمن (User/Admin)
        // يرى المحتوى العام + محتواه الشخصي إذا أراد الإضافة
        else {
            const q = collection(db, "users", firebaseUser.uid, "content");
            unsubContent = onSnapshot(q, (snap) => {
                const personalContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // دمج المحتوى العام مع الشخصي
                const combined = [...fullDatabase, ...personalContent];
                // إزالة التكرار
                const uniqueMap = new Map(combined.map(item => [item.id, item]));
                setRawContent(Array.from(uniqueMap.values()));
                setLoading(false);
            });
        }
    } catch (error) {
        console.error("Content Strategy Error:", error);
        setRawContent(fullDatabase);
        setLoading(false);
    }

    return () => unsubContent();
  }, [firebaseUser, userData, isTeacher, isStudent]);

  /**
   * 4. جلب تقدم المستخدم (User Progress)
   * هذا خاص بالمستخدم نفسه دائماً، بغض النظر عن مصدر المحتوى
   */
  useEffect(() => {
    if (!firebaseUser) return;

    // جلب XP و Streak
    const userRef = doc(db, "users", firebaseUser.uid);
    const unsubStats = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({ xp: data.xp || 0, streak: data.streak || 0 });
      }
    });

    // جلب مستويات حفظ الكلمات
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

  // --- Logic: خوارزمية اختيار البطاقة (SRS Light) ---
  const pickCardInternal = (list, category, excludeId = null) => {
      if (!list || list.length === 0) return null;
      const now = Date.now();
      
      // 1. التصفية حسب القسم المختار
      let pool = category === 'All' ? list : list.filter(c => c.category === category);
      
      // 2. استبعاد البطاقة الحالية لمنع التكرار الفوري
      if (excludeId) pool = pool.filter(c => c.id !== excludeId);

      // 3. البحث عن بطاقات مستحقة للمراجعة (Due Review)
      const due = pool.filter(c => (c.level || 0) < 5 && (!c.nextReview || c.nextReview <= now));

      // 4. الاختيار العشوائي
      if (due.length > 0) return due[Math.floor(Math.random() * due.length)];
      
      // 5. إذا لم يوجد مستحق، اختر أي بطاقة من المجموعة (Study Ahead)
      if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
      
      return null;
  };

  const pickNextCard = useCallback((currentList, excludeId = null) => {
    const next = pickCardInternal(currentList, activeCategory, excludeId);
    setCurrentCard(next);
  }, [activeCategory]);

  const handleSwipe = useCallback(async (direction) => {
    if (!currentCard || !firebaseUser) return;
    
    const known = direction === 'right';
    const oldLevel = currentCard.level || 0;
    
    // منطق التكرار المتباعد (Spaced Repetition)
    const nextLevel = known ? Math.min(oldLevel + 1, 5) : 0; // عند الخطأ تعود للصفر
    const intervals = [1, 60, 1440, 4320, 10080, 43200]; // دقائق (1m, 1h, 1d, 3d, 7d, 30d)
    const minutesToAdd = known ? intervals[nextLevel] : 1; // دقيقة واحدة عند الخطأ
    const nextReview = Date.now() + (minutesToAdd * 60 * 1000);

    // تحديث الحالة المحلية فوراً (Optimistic UI)
    const updatedCard = { ...currentCard, level: nextLevel, nextReview };
    const newCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(newCards);
    
    // اختيار البطاقة التالية
    pickNextCard(newCards, currentCard.id);

    try {
      // حفظ التقدم في Firebase
      const progressRef = doc(db, "users", firebaseUser.uid, "progress", String(currentCard.id));
      await setDoc(progressRef, { 
          level: nextLevel, 
          nextReview,
          lastStudied: serverTimestamp()
      }, { merge: true });
      
      // زيادة الـ XP عند الإجابة الصحيحة
      if (known) {
        await updateDoc(doc(db, "users", firebaseUser.uid), { 
            xp: (stats.xp || 0) + 10,
            lastActivity: serverTimestamp()
        });
      }
    } catch (e) { console.error("Save Progress Error:", e); }
  }, [currentCard, firebaseUser, cards, stats.xp, pickNextCard]);

  // --- CRUD Operations (Creation/Deletion) ---

  const addCard = useCallback(async (cardData) => {
    // الطلاب لا يمكنهم إضافة محتوى (إلا إذا أردت السماح لهم بملاحظات خاصة)
    if (isStudent) {
        alert("Access Denied: Only Instructors can add neural data.");
        return;
    }
    
    const newId = String(Date.now());
    
    if (firebaseUser) {
        // الإضافة تتم في الـ subcollection الخاص بالمستخدم (الأستاذ)
        await setDoc(doc(db, "users", firebaseUser.uid, "content", newId), {
            ...cardData,
            id: newId,
            createdAt: serverTimestamp()
        });
    }
  }, [firebaseUser, isStudent]);

  const deleteCard = useCallback(async (cardId) => {
    if (isStudent) return; // حماية
    if (firebaseUser) {
        try {
            await deleteDoc(doc(db, "users", firebaseUser.uid, "content", String(cardId)));
        } catch (e) { console.error(e); }
    }
  }, [firebaseUser, isStudent]);

  const updateCard = useCallback(async (cardId, newData) => {
    if (isStudent) return; // حماية
    if (firebaseUser) {
        try {
            await updateDoc(doc(db, "users", firebaseUser.uid, "content", String(cardId)), newData);
        } catch (e) { console.error(e); }
    }
  }, [firebaseUser, isStudent]);

  const resetProgress = async () => {
      if(!confirm("Reset all learning progress? This cannot be undone.")) return;
      // هذا يتطلب حذف كل المستندات في progress subcollection
      // للتسهيل، سنقوم بذلك في المستقبل أو عبر دالة سحابية، 
      // حالياً يمكن تصفير الـ XP
      await updateDoc(doc(db, "users", firebaseUser.uid), { xp: 0 });
      window.location.reload();
  };

  return { 
    cards, 
    currentCard, 
    stats, 
    handleSwipe, 
    loading, 
    addCard, 
    deleteCard, 
    updateCard,
    resetProgress,
    isBanned: userData?.isBanned || false
  };
};