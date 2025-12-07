import { useState, useEffect } from 'react';
import { fullDatabase } from '../data/fullDatabase';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, onSnapshot } from "firebase/firestore";

export const useStudySystem = (user) => {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ xp: 0, streak: 0, avatar: "👤" });
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [broadcast, setBroadcast] = useState(null); // رسالة الأدمن

  useEffect(() => {
    if (!user) {
        setCards([]);
        setLoading(false);
        return;
    }

    // 1. مراقبة المستخدم
    const unsubUser = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setStats(data);
            setIsAdmin(data.isAdmin === true);
            setIsBanned(data.isBanned === true);
        } else {
            const isAdm = user.email.toLowerCase() === 'islamaz@bomba.com';
            setDoc(doc(db, "users", user.uid), { email: user.email, xp: 0, streak: 0, avatar: "👤", isAdmin: isAdm, isBanned: false, createdAt: new Date().toISOString() });
        }
    });

    // 2. مراقبة رسائل النظام (البث المباشر)
    const unsubSystem = onSnapshot(doc(db, "system", "broadcast"), (docSnap) => {
        if (docSnap.exists() && docSnap.data().active) {
            setBroadcast(docSnap.data().message);
        } else {
            setBroadcast(null);
        }
    });

    // 3. تحميل البطاقات
    const loadCards = async () => {
        try {
            const progressRef = collection(db, "users", user.uid, "progress");
            const progressSnap = await getDocs(progressRef);
            const progressMap = {};
            progressSnap.forEach(doc => { progressMap[doc.id] = doc.data(); });

            const merged = fullDatabase.map(card => {
                const p = progressMap[card.id];
                return p ? { ...card, ...p } : { ...card, level: 0, steps: 0, nextReview: Date.now() };
            });

            setCards(merged);
            updateCurrentCard(merged);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };

    loadCards();
    return () => { unsubUser(); unsubSystem(); };
  }, [user]);

  const updateCurrentCard = (list) => {
      const due = list.filter(c => c.level < 5 && c.nextReview <= Date.now());
      setCurrentCard(due.length > 0 ? due[0] : null);
  };

  const handleSwipe = async (direction) => {
      if (!currentCard || !user || isBanned) return;
      const known = direction === 'right';
      const nextLevel = known ? Math.min(currentCard.level + 1, 5) : 0;
      const nextReview = Date.now() + (known ? (nextLevel * 86400000) + 60000 : 30000);

      const updated = { ...currentCard, level: nextLevel, nextReview };
      const newCards = cards.map(c => c.id === currentCard.id ? updated : c);
      
      setCards(newCards);
      updateCurrentCard(newCards);

      const cardRef = doc(db, "users", user.uid, "progress", String(currentCard.id));
      await setDoc(cardRef, { card_id: currentCard.id, level: nextLevel, next_review: nextReview });
      
      if (known) {
          await updateDoc(doc(db, "users", user.uid), { xp: (stats.xp || 0) + 10 });
      }
  };

  // دالة تغيير الأفاتار
  const setAvatar = async (emoji) => {
      if (user) await updateDoc(doc(db, "users", user.uid), { avatar: emoji });
  };

  // دوال مساعدة
  const addCard = () => {}; 
  const deleteCard = () => {}; 
  const updateCard = () => {};
  const resetProgress = async () => { if(confirm("Reset?")) window.location.reload(); };

  return { 
      cards, currentCard, stats, handleSwipe, 
      resetProgress, loading, addCard, deleteCard, updateCard, 
      isAdmin, isBanned, broadcast, setAvatar 
  };
};