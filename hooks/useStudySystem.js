import { useState, useEffect } from 'react';
import { fullDatabase } from '../data/fullDatabase';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc, onSnapshot, writeBatch } from "firebase/firestore";

export const useStudySystem = (user) => {
  const [cards, setCards] = useState([]);
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'user' });
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);
  
  // بيانات النظام
  const [isMaster, setIsMaster] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    if (!user) {
        setCards([]);
        setLoading(false);
        return;
    }

    // 1. مزامنة بيانات المستخدم والصلاحيات
    const userRef = doc(db, "users", user.uid);
    const unsubUser = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setStats(data);
            
            const isMasterEmail = user.email === 'islamaz@bomba.com';
            setIsMaster(isMasterEmail);
            setIsAdmin(data.role === 'admin' || data.role === 'master' || isMasterEmail);
            setIsBanned(data.isBanned === true);

            // إصلاح الصلاحيات تلقائياً للماستر
            if (isMasterEmail && data.role !== 'master') {
                await updateDoc(userRef, { role: 'master' });
            }
        } else {
            // إنشاء ملف مستخدم جديد
            await setDoc(userRef, { 
                email: user.email, 
                xp: 0, 
                role: user.email === 'islamaz@bomba.com' ? 'master' : 'user',
                createdAt: new Date().toISOString() 
            });
        }
    });

    // 2. تحميل البطاقات الخاصة (Personalized Data)
    const cardsCollection = collection(db, "users", user.uid, "personal_cards");
    
    const loadUserCards = async () => {
        const snapshot = await getDocs(cardsCollection);
        
        if (snapshot.empty) {
            // مستخدم جديد: نسخ قاعدة البيانات الافتراضية له
            console.log("Initializing user database...");
            const batch = writeBatch(db);
            // نأخذ أول 50 كلمة فقط لتسريع العملية في البداية (يمكنك زيادة العدد)
            fullDatabase.slice(0, 50).forEach(card => {
                const newDocRef = doc(cardsCollection, String(card.id));
                batch.set(newDocRef, { ...card, level: 0, nextReview: Date.now() });
            });
            await batch.commit();
            // إعادة التحميل
            loadUserCards(); 
        } else {
            const userCards = snapshot.docs.map(d => d.data());
            setCards(userCards);
            updateCurrentCard(userCards);
            setLoading(false);
        }
    };

    loadUserCards();

    return () => unsubUser();
  }, [user]);

  // تحديث البطاقة الحالية للمراجعة
  const updateCurrentCard = (list) => {
      const due = list.filter(c => c.level < 5 && (c.nextReview || 0) <= Date.now());
      setCurrentCard(due.length > 0 ? due[0] : null);
  };

  // منطق Swipe (المراجعة)
  const handleSwipe = async (direction) => {
      if (!currentCard || !user) return;
      
      const known = direction === 'right';
      const nextLevel = known ? Math.min(currentCard.level + 1, 5) : 0;
      // خوارزمية التكرار المتباعد البسيطة
      const nextReview = Date.now() + (known ? (Math.pow(2, nextLevel) * 86400000) : 60000); 

      const updatedCard = { ...currentCard, level: nextLevel, nextReview };
      
      // تحديث الحالة المحلية فوراً
      const newCards = cards.map(c => c.id === currentCard.id ? updatedCard : c);
      setCards(newCards);
      updateCurrentCard(newCards);

      // تحديث قاعدة البيانات الخاصة بالمستخدم
      const cardRef = doc(db, "users", user.uid, "personal_cards", String(currentCard.id));
      await updateDoc(cardRef, { level: nextLevel, nextReview });

      // زيادة XP
      if (known) {
          await updateDoc(doc(db, "users", user.uid), { xp: (stats.xp || 0) + 10 });
      }
  };

  // CRUD OPERATIONS (تعديل خاص بالمستخدم فقط)
  
  const addCard = async (cardData) => {
      const newId = Date.now().toString();
      const newCard = { ...cardData, id: newId, level: 0, nextReview: Date.now() };
      await setDoc(doc(db, "users", user.uid, "personal_cards", newId), newCard);
      setCards(prev => [...prev, newCard]);
  };

  const deleteCard = async (cardId) => {
      await deleteDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)));
      setCards(prev => prev.filter(c => c.id !== cardId));
  };

  const updateCard = async (cardId, newData) => {
      await updateDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)), newData);
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...newData } : c));
  };

  return { 
      cards, currentCard, stats, handleSwipe, 
      loading, addCard, deleteCard, updateCard,
      isAdmin, isMaster, isBanned
  };
};