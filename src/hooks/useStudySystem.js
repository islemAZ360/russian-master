"use client";
import { useState, useEffect, useCallback } from 'react';
import { fullDatabase } from '@/data/fullDatabase'; 
import { MILITARY_RANKS } from '@/data/militaryRanks'; // استيراد نظام الرتب
import { db } from '@/lib/firebase';
import { 
  doc, setDoc, collection, updateDoc, 
  deleteDoc, onSnapshot, serverTimestamp, 
  query, where, getDocs, addDoc 
} from "firebase/firestore";
import { useUI } from './useUI';
import { useAuth } from './useAuth';

const SYSTEM_VERSION = "5.4.0-NOTIF-SYNC";

export const useStudySystem = (firebaseUser) => {
  const { activeCategory } = useUI();
  const { userData, isTeacher, isStudent } = useAuth();
  
  const [cards, setCards] = useState([]); 
  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [rawContent, setRawContent] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  // تنظيف الكاش عند التحديث
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedVer = localStorage.getItem('RM_SYS_VER');
    if (savedVer !== SYSTEM_VERSION) {
      localStorage.removeItem('cached_content');
      localStorage.setItem('RM_SYS_VER', SYSTEM_VERSION);
    }
  }, []);

  // دمج المحتوى مع التقدم
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
    const timer = setTimeout(() => {
        setCurrentCard(prev => prev || pickCardInternal(merged, activeCategory));
    }, 100);
    return () => clearTimeout(timer);
  }, [rawContent, progressMap, activeCategory]);

  // جلب المحتوى
  useEffect(() => {
    if (!firebaseUser) {
        setLoading(false);
        return;
    }
    setLoading(true);
    let unsubContent = () => {};

    try {
        if (isTeacher) {
            const q = collection(db, "users", firebaseUser.uid, "content");
            unsubContent = onSnapshot(q, (snap) => {
                const teacherContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setRawContent(teacherContent.length > 0 ? teacherContent : fullDatabase);
                setLoading(false);
            });
        } else if (isStudent) {
            if (userData?.teacherId) {
                const q = collection(db, "users", userData.teacherId, "content");
                unsubContent = onSnapshot(q, (snap) => {
                    const assignedContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setRawContent(assignedContent.length > 0 ? assignedContent : fullDatabase); 
                    setLoading(false);
                });
            } else {
                setRawContent(fullDatabase);
                setLoading(false);
            }
        } else {
            const q = collection(db, "users", firebaseUser.uid, "content");
            unsubContent = onSnapshot(q, (snap) => {
                const personalContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                const combined = [...fullDatabase, ...personalContent];
                const uniqueMap = new Map(combined.map(item => [item.id, item]));
                setRawContent(Array.from(uniqueMap.values()));
                setLoading(false);
            });
        }
    } catch (error) {
        console.error("Content Error:", error);
        setRawContent(fullDatabase);
        setLoading(false);
    }
    return () => unsubContent();
  }, [firebaseUser, userData, isTeacher, isStudent]);

  // جلب الإحصائيات والتقدم
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
    return () => { unsubStats(); unsubProgress(); };
  }, [firebaseUser]);

  // خوارزمية اختيار البطاقة
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

  const pickNextCard = useCallback((currentList, excludeId = null) => {
    const next = pickCardInternal(currentList, activeCategory, excludeId);
    setCurrentCard(next);
  }, [activeCategory]);

  // --- معالجة الإجابة (مع منطق الترقية الجديد) ---
  const handleSwipe = useCallback(async (direction) => {
    if (!currentCard || !firebaseUser) return;
    
    const known = direction === 'right';
    const nextLevel = known ? Math.min((currentCard.level || 0) + 1, 5) : 0;
    const intervals = [1, 60, 1440, 4320, 10080, 43200];
    const minutesToAdd = known ? intervals[nextLevel] : 1;
    const nextReview = Date.now() + (minutesToAdd * 60 * 1000);

    // تحديث محلي
    const updatedCard = { ...currentCard, level: nextLevel, nextReview };
    const newCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(newCards);
    pickNextCard(newCards, currentCard.id);

    try {
      // حفظ التقدم
      const progressRef = doc(db, "users", firebaseUser.uid, "progress", String(currentCard.id));
      await setDoc(progressRef, { 
          level: nextLevel, 
          nextReview,
          lastStudied: serverTimestamp()
      }, { merge: true });
      
      // زيادة الـ XP والتحقق من الترقية
      if (known) {
        const currentXP = stats.xp || 0;
        const newXP = currentXP + 10;

        await updateDoc(doc(db, "users", firebaseUser.uid), { 
            xp: newXP,
            lastActivity: serverTimestamp()
        });

        // 🔥 التحقق من الترقية (Rank Up Check)
        const oldRank = MILITARY_RANKS.reduce((curr, r) => currentXP >= r.xp ? r : curr, MILITARY_RANKS[0]);
        const newRank = MILITARY_RANKS.reduce((curr, r) => newXP >= r.xp ? r : curr, MILITARY_RANKS[0]);

        if (newRank.id !== oldRank.id) {
            // إرسال إشعار الترقية
            await addDoc(collection(db, "notifications"), {
                userId: firebaseUser.uid,
                type: 'rank_up',
                title: `🎖️ PROMOTED TO ${newRank.name}`,
                message: `Congratulations! You have reached the rank of ${newRank.title}. Access granted to new perks.`,
                senderId: 'system',
                createdAt: serverTimestamp(),
                read: false
            });
        }
      }
    } catch (e) { console.error("Save Error:", e); }
  }, [currentCard, firebaseUser, cards, stats.xp, pickNextCard]);

  // --- إضافة بطاقة (مع إشعار الطلاب) ---
  const addCard = useCallback(async (cardData) => {
    if (isStudent) {
        alert("Access Denied.");
        return;
    }
    
    const newId = String(Date.now());
    
    if (firebaseUser) {
        try {
            // 1. حفظ المحتوى
            await setDoc(doc(db, "users", firebaseUser.uid, "content", newId), {
                ...cardData,
                id: newId,
                createdAt: serverTimestamp()
            });

            // 2. 🔥 إرسال إشعار للطلاب (إذا كان أستاذاً)
            if (isTeacher) {
                // جلب جميع الطلاب المرتبطين بهذا الأستاذ
                const studentsQuery = query(collection(db, "users"), where("teacherId", "==", firebaseUser.uid));
                const studentsSnap = await getDocs(studentsQuery);
                
                // إرسال إشعار لكل طالب
                const notifyPromises = studentsSnap.docs.map(studentDoc => 
                    addDoc(collection(db, "notifications"), {
                        userId: studentDoc.id,
                        target: 'student',
                        type: 'new_content',
                        title: "📚 NEW INTEL RECEIVED",
                        message: `Commander added new data: "${cardData.russian}" to ${cardData.category || "General"}.`,
                        senderId: firebaseUser.uid,
                        createdAt: serverTimestamp(),
                        read: false
                    })
                );
                
                await Promise.all(notifyPromises);
            }
        } catch (e) {
            console.error("Add Card Error:", e);
        }
    }
  }, [firebaseUser, isStudent, isTeacher]);

  const deleteCard = useCallback(async (cardId) => {
    if (isStudent) return;
    if (firebaseUser) {
        try {
            await deleteDoc(doc(db, "users", firebaseUser.uid, "content", String(cardId)));
        } catch (e) { console.error(e); }
    }
  }, [firebaseUser, isStudent]);

  const updateCard = useCallback(async (cardId, newData) => {
    if (isStudent) return;
    if (firebaseUser) {
        try {
            await updateDoc(doc(db, "users", firebaseUser.uid, "content", String(cardId)), newData);
        } catch (e) { console.error(e); }
    }
  }, [firebaseUser, isStudent]);

  const resetProgress = async () => {
      if(!confirm("Reset progress?")) return;
      await updateDoc(doc(db, "users", firebaseUser.uid), { xp: 0 });
      window.location.reload();
  };

  return { 
    cards, currentCard, stats, handleSwipe, loading, 
    addCard, deleteCard, updateCard, resetProgress,
    isBanned: userData?.isBanned || false
  };
};