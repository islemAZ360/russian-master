import { useState, useEffect } from 'react';
import { fullDatabase } from '../data/fullDatabase'; // هذا الملف يحتوي على بياناتك الأصلية (1424 كلمة)
import { db } from '../lib/firebase';
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc, writeBatch, getDoc } from "firebase/firestore";

export const useStudySystem = (user) => {
  // هام جداً: نبدأ بـ fullDatabase فوراً لضمان عدم اختفاء البيانات
  const [cards, setCards] = useState(fullDatabase); 
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'user' });
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);
  
  // دالة لاختيار بطاقة للمراجعة
  const updateCurrentCard = (list) => {
      if (!list || list.length === 0) return;
      // نختار بطاقة لم يحن موعد مراجعتها، أو عشوائية إذا كان الكل مراجع
      const due = list.filter(c => c.level < 5 && (!c.nextReview || c.nextReview <= Date.now()));
      setCurrentCard(due.length > 0 ? due[0] : list[Math.floor(Math.random() * list.length)]);
  };

  useEffect(() => {
    // تعيين البطاقة الأولية فوراً من البيانات الأصلية
    updateCurrentCard(fullDatabase);
    setLoading(false);

    if (!user) return;

    // محاولة جلب بيانات مخصصة من السيرفر (بدون تعطيل العرض الحالي)
    const syncUserData = async () => {
        try {
            // جلب الإحصائيات
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) setStats(userSnap.data());

            // جلب البطاقات الشخصية
            const cardsCollection = collection(db, "users", user.uid, "personal_cards");
            const snapshot = await getDocs(cardsCollection);
            
            if (!snapshot.empty) {
                // إذا وجدنا بيانات مخصصة، ندمجها
                const userCardsMap = new Map(snapshot.docs.map(d => [d.id, d.data()]));
                
                // دمج البيانات الأصلية مع تقدم المستخدم
                const mergedCards = fullDatabase.map(card => {
                    const userProgress = userCardsMap.get(String(card.id));
                    return userProgress ? { ...card, ...userProgress } : card;
                });
                
                setCards(mergedCards);
                updateCurrentCard(mergedCards);
            } else {
                // إذا لم توجد بيانات، نستخدم الأصلية وننسخها في الخلفية (بصمت)
                initializeUserDb(user.uid);
            }
        } catch (e) {
            console.error("Sync error, using local data:", e);
        }
    };

    syncUserData();
  }, [user]);

  // نسخ البيانات في الخلفية للمستخدم الجديد
  const initializeUserDb = async (uid) => {
      console.log("Initializing user database in background...");
      const batch = writeBatch(db);
      const cardsCollection = collection(db, "users", uid, "personal_cards");
      // ننسخ أول 20 كلمة فقط لتسريع العملية مبدئياً
      fullDatabase.slice(0, 20).forEach(card => {
          const docRef = doc(cardsCollection, String(card.id));
          batch.set(docRef, { ...card, level: 0, nextReview: Date.now() });
      });
      await batch.commit().catch(e => console.log("Batch error:", e));
  };

  const handleSwipe = async (direction) => {
      if (!currentCard || !user) return;
      
      const known = direction === 'right';
      const nextLevel = known ? Math.min((currentCard.level || 0) + 1, 5) : 0;
      const nextReview = Date.now() + (known ? (Math.pow(2, nextLevel) * 86400000) : 60000); 

      const updatedCard = { ...currentCard, level: nextLevel, nextReview };
      
      // تحديث الواجهة فوراً
      const newCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
      setCards(newCards);
      updateCurrentCard(newCards);

      // حفظ في الخلفية
      try {
          const cardRef = doc(db, "users", user.uid, "personal_cards", String(currentCard.id));
          await setDoc(cardRef, { ...updatedCard }, { merge: true });
          
          if (known) {
              await updateDoc(doc(db, "users", user.uid), { xp: (stats.xp || 0) + 10 });
          }
      } catch (e) { console.error("Save failed:", e); }
  };

  // دوال الإضافة والحذف والتعديل
  const addCard = async (cardData) => {
      const newCard = { ...cardData, id: Date.now(), level: 0 };
      setCards(prev => [...prev, newCard]);
      if(user) await setDoc(doc(db, "users", user.uid, "personal_cards", String(newCard.id)), newCard);
  };

  const deleteCard = async (cardId) => {
      setCards(prev => prev.filter(c => c.id !== cardId));
      if(user) await deleteDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)));
  };

  const updateCard = async (cardId, newData) => {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...newData } : c));
      if(user) await updateDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)), newData);
  };

  return { 
      cards, currentCard, stats, handleSwipe, 
      loading, addCard, deleteCard, updateCard, 
      resetProgress: () => {},
      isAdmin: stats.role === 'admin' || stats.role === 'master',
      isMaster: stats.role === 'master',
      isBanned: false 
  };
};