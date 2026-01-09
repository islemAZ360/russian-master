"use client";
import { useState, useEffect, useCallback } from 'react';
import { fullDatabase } from '@/data/fullDatabase'; 
import { MILITARY_RANKS } from '@/data/militaryRanks'; 
import { db } from '@/lib/firebase';
import { 
  doc, setDoc, collection, updateDoc, 
  deleteDoc, onSnapshot, serverTimestamp, 
  query, where, getDocs, addDoc 
} from "firebase/firestore";
import { useUI } from './useUI';
import { useAuth } from '@/context/AuthContext'; // استخدام المسار الصحيح

const SYSTEM_VERSION = "5.5.0-TEACHER-SYNC";

export const useStudySystem = (firebaseUser) => {
  const { activeCategory } = useUI();
  const { userData, isTeacher, isStudent } = useAuth();
  
  const [cards, setCards] = useState([]); 
  const [stats, setStats] = useState({ xp: 0, streak: 0 });
  const [currentCard, setCurrentCard] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [rawContent, setRawContent] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  // تنظيف الكاش عند تحديث إصدار النظام
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedVer = localStorage.getItem('RM_SYS_VER');
    if (savedVer !== SYSTEM_VERSION) {
      localStorage.removeItem('cached_content');
      localStorage.setItem('RM_SYS_VER', SYSTEM_VERSION);
    }
  }, []);

  // --- 1. دمج المحتوى مع تقدم الطالب ---
  useEffect(() => {
    // إذا لم يكن هناك محتوى، نفرغ البطاقات
    if (!rawContent.length) {
        setCards([]);
        return;
    }

    // دمج بيانات البطاقة الأصلية مع بيانات تقدم الطالب (مثل المستوى وموعد المراجعة)
    const merged = rawContent.map(card => {
        const userProgress = progressMap[card.id];
        return userProgress ? { ...card, ...userProgress } : { ...card, level: 0 };
    });

    setCards(merged);

    // اختيار بطاقة جديدة للدراسة إذا لم تكن هناك بطاقة حالية
    // نستخدم Timeout بسيط لضمان عدم تداخل تحديثات الحالة
    const timer = setTimeout(() => {
        setCurrentCard(prev => {
            // إذا كانت البطاقة الحالية موجودة ومازالت صالحة (لم يتم حذفها)، نحتفظ بها
            const stillExists = merged.find(c => c.id === prev?.id);
            if (prev && stillExists) return prev;
            
            // وإلا نختار بطاقة جديدة
            return pickCardInternal(merged, activeCategory);
        });
    }, 100);

    return () => clearTimeout(timer);
  }, [rawContent, progressMap, activeCategory]);

  // --- 2. جلب المحتوى بناءً على الرتبة (Logic Core) ---
  useEffect(() => {
    if (!firebaseUser) {
        setLoading(false);
        return;
    }
    setLoading(true);
    let unsubContent = () => {};

    try {
        if (isTeacher) {
            // الأستاذ: يرى المحتوى الذي أنشأه هو فقط ليقوم بتعديله
            const q = collection(db, "users", firebaseUser.uid, "content");
            unsubContent = onSnapshot(q, (snap) => {
                const teacherContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // إذا لم يضف شيئاً، نعرض له قاعدة البيانات العامة كبداية
                setRawContent(teacherContent.length > 0 ? teacherContent : fullDatabase);
                setLoading(false);
            });
        } else if (isStudent) {
            // الطالب: يرى محتوى أستاذه
            if (userData?.teacherId) {
                const q = collection(db, "users", userData.teacherId, "content");
                unsubContent = onSnapshot(q, (snap) => {
                    const assignedContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    // الطالب يرى محتوى الأستاذ، وإذا كان فارغاً يرى المحتوى العام
                    setRawContent(assignedContent.length > 0 ? assignedContent : fullDatabase); 
                    setLoading(false);
                });
            } else {
                // طالب بدون أستاذ: يرى المحتوى العام
                setRawContent(fullDatabase);
                setLoading(false);
            }
        } else {
            // مستخدم عادي: يرى المحتوى العام + محتواه الخاص
            const q = collection(db, "users", firebaseUser.uid, "content");
            unsubContent = onSnapshot(q, (snap) => {
                const personalContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // دمج المحتوى العام مع الخاص
                const combined = [...fullDatabase, ...personalContent];
                // إزالة التكرار
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

  // --- 3. جلب الإحصائيات وتقدم الطالب ---
  useEffect(() => {
    if (!firebaseUser) return;

    // مراقبة الـ XP والـ Streak
    const userRef = doc(db, "users", firebaseUser.uid);
    const unsubStats = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({ xp: data.xp || 0, streak: data.streak || 0 });
      }
    });

    // مراقبة تقدم البطاقات (Level, Next Review)
    const progressColl = collection(db, "users", firebaseUser.uid, "progress");
    const unsubProgress = onSnapshot(progressColl, (snap) => {
        const map = {};
        snap.docs.forEach(d => { map[d.id] = d.data(); });
        setProgressMap(map);
    });

    return () => { unsubStats(); unsubProgress(); };
  }, [firebaseUser]);

  // --- خوارزمية SRS لاختيار البطاقة ---
  const pickCardInternal = (list, category, excludeId = null) => {
      if (!list || list.length === 0) return null;
      const now = Date.now();
      
      // 1. التصفية حسب القسم
      let pool = category === 'All' ? list : list.filter(c => c.category === category);
      
      // 2. استبعاد البطاقة الحالية (لمنع التكرار الفوري)
      if (excludeId) pool = pool.filter(c => c.id !== excludeId);
      
      // 3. البحث عن البطاقات المستحقة للمراجعة (Level < 5 && Time passed)
      const due = pool.filter(c => (c.level || 0) < 5 && (!c.nextReview || c.nextReview <= now));
      
      // 4. الاختيار
      if (due.length > 0) return due[Math.floor(Math.random() * due.length)]; // أولوية للمستحقة
      if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)]; // ثم العشوائية من نفس القسم
      
      return null;
  };

  const pickNextCard = useCallback((currentList, excludeId = null) => {
    const next = pickCardInternal(currentList, activeCategory, excludeId);
    setCurrentCard(next);
  }, [activeCategory]);

  // --- 4. معالجة الإجابة (Swipe Logic) ---
  const handleSwipe = useCallback(async (direction) => {
    if (!currentCard || !firebaseUser) return;
    
    const known = direction === 'right';
    
    // منطق التكرار المتباعد (Spaced Repetition)
    const nextLevel = known ? Math.min((currentCard.level || 0) + 1, 5) : 0; // إذا أخطأ يعود للصفر
    const intervals = [1, 60, 1440, 4320, 10080, 43200]; // دقائق (دقيقة، ساعة، يوم، 3 أيام، أسبوع، شهر)
    const minutesToAdd = known ? intervals[nextLevel] : 1; // مراجعة فورية عند الخطأ
    const nextReview = Date.now() + (minutesToAdd * 60 * 1000);

    // التحديث الفوري للواجهة (Optimistic UI)
    const updatedCard = { ...currentCard, level: nextLevel, nextReview };
    const newCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(newCards);
    
    // اختيار البطاقة التالية فوراً
    pickNextCard(newCards, currentCard.id);

    try {
      // 1. حفظ تقدم البطاقة في Firestore
      const progressRef = doc(db, "users", firebaseUser.uid, "progress", String(currentCard.id));
      await setDoc(progressRef, { 
          level: nextLevel, 
          nextReview,
          lastStudied: serverTimestamp()
      }, { merge: true });
      
      // 2. زيادة الـ XP والتحقق من الترقية
      if (known) {
        const currentXP = stats.xp || 0;
        const newXP = currentXP + 10; // 10 نقاط لكل إجابة صحيحة

        await updateDoc(doc(db, "users", firebaseUser.uid), { 
            xp: newXP,
            lastActivity: serverTimestamp()
        });

        // 🔥 التحقق من الترقية (Rank Up Check)
        // هذا الجزء يضمن تحديث الرتبة في لوحة الأدمن وفي الملف الشخصي
        const oldRank = MILITARY_RANKS.reduce((curr, r) => currentXP >= r.xp ? r : curr, MILITARY_RANKS[0]);
        const newRank = MILITARY_RANKS.reduce((curr, r) => newXP >= r.xp ? r : curr, MILITARY_RANKS[0]);

        if (newRank.id !== oldRank.id) {
            // إرسال إشعار الترقية (يظهر في NotificationCenter)
            await addDoc(collection(db, "notifications"), {
                userId: firebaseUser.uid,
                type: 'rank_up',
                title: `🎖️ PROMOTED TO ${newRank.name}`,
                message: `Congratulations! You have reached the rank of ${newRank.title}. Glory to the Squad!`,
                senderId: 'system',
                createdAt: serverTimestamp(),
                read: false
            });
        }
      }
    } catch (e) { console.error("Save Error:", e); }
  }, [currentCard, firebaseUser, cards, stats.xp, pickNextCard]);

  // --- 5. إضافة بطاقة (للأستاذ فقط) ---
  const addCard = useCallback(async (cardData) => {
    // حماية: الطالب لا يضيف محتوى
    if (isStudent) {
        alert("Access Denied: Students cannot modify database.");
        return;
    }
    
    const newId = String(Date.now());
    
    if (firebaseUser) {
        try {
            // أ. حفظ المحتوى في مجموعة الأستاذ
            await setDoc(doc(db, "users", firebaseUser.uid, "content", newId), {
                ...cardData,
                id: newId,
                createdAt: serverTimestamp()
            });

            // ب. 🔥 إرسال إشعار للطلاب (ميزة حيوية)
            if (isTeacher) {
                // جلب جميع الطلاب المرتبطين بهذا الأستاذ
                const studentsQuery = query(collection(db, "users"), where("teacherId", "==", firebaseUser.uid));
                const studentsSnap = await getDocs(studentsQuery);
                
                if (!studentsSnap.empty) {
                    const notifyPromises = studentsSnap.docs.map(studentDoc => 
                        addDoc(collection(db, "notifications"), {
                            userId: studentDoc.id,
                            target: 'student',
                            type: 'new_content',
                            title: "📚 NEW INTEL RECEIVED",
                            message: `Commander added new data: "${cardData.russian}" to category: ${cardData.category || "General"}.`,
                            senderId: firebaseUser.uid,
                            createdAt: serverTimestamp(),
                            read: false
                        })
                    );
                    await Promise.all(notifyPromises);
                }
            }
        } catch (e) {
            console.error("Add Card Error:", e);
            alert("Failed to upload data.");
        }
    }
  }, [firebaseUser, isStudent, isTeacher]);

  // --- 6. حذف وتعديل (للأستاذ فقط) ---
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

  // --- 7. تصفير التقدم ---
  const resetProgress = async () => {
      if(!confirm("WARNING: This will wipe all your neural progress (XP & Levels). Continue?")) return;
      try {
          await updateDoc(doc(db, "users", firebaseUser.uid), { xp: 0 });
          // ملاحظة: حذف subcollection "progress" يتطلب Cloud Function أو حذف المستندات واحداً تلو الآخر
          // للتبسيط هنا نصفر الـ XP فقط ونعيد تحميل الصفحة
          window.location.reload();
      } catch (e) {
          console.error("Reset Failed", e);
      }
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
    // حالة الحظر لتوجيه المستخدم في الواجهة
    isBanned: userData?.isBanned || false
  };
};