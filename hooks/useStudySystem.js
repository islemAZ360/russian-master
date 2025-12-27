import { useState, useEffect } from 'react';
import { fullDatabase } from '../data/fullDatabase'; // تأكد أن هذا الملف موجود وفيه البيانات
import { db } from '../lib/firebase';
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc, onSnapshot, writeBatch, getDoc } from "firebase/firestore";

export const useStudySystem = (user) => {
  // نبدأ بالبيانات الكاملة افتراضياً حتى لا يظهر الموقع فارغاً
  const [cards, setCards] = useState(fullDatabase); 
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'user' });
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);
  
  // بيانات النظام
  const [isMaster, setIsMaster] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    // 1. إعداد المستخدم والصلاحيات
    const setupUser = async () => {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            setStats(data);
            const isMasterEmail = user.email === 'islamaz@bomba.com';
            setIsMaster(isMasterEmail);
            // التحقق من الصلاحية
            setIsAdmin(data.role === 'admin' || data.role === 'master' || isMasterEmail);
            setIsBanned(data.isBanned === true);
            
            // إصلاح تلقائي للماستر إذا لم تكن رتبته مضبوطة
            if (isMasterEmail && data.role !== 'master') {
                await updateDoc(userRef, { role: 'master' });
            }
        } else {
            // مستخدم جديد
            const isMasterEmail = user.email === 'islamaz@bomba.com';
            await setDoc(userRef, { 
                email: user.email, 
                xp: 0, 
                role: isMasterEmail ? 'master' : 'user',
                createdAt: new Date().toISOString() 
            });
            setIsMaster(isMasterEmail);
            setIsAdmin(isMasterEmail);
        }
    };

    setupUser();

    // 2. تحميل البطاقات الخاصة
    const loadUserCards = async () => {
        const cardsCollection = collection(db, "users", user.uid, "personal_cards");
        const snapshot = await getDocs(cardsCollection);
        
        if (snapshot.empty) {
            // إذا لم يكن لديه بطاقات خاصة، نستخدم قاعدة البيانات الكاملة ونبدأ النسخ
            console.log("No personal cards found. Using default database & initializing copy...");
            setCards(fullDatabase); // عرض البيانات فوراً
            updateCurrentCard(fullDatabase);
            
            // نسخ البيانات في الخلفية (أول 50 كلمة لتسريع العملية)
            const batch = writeBatch(db);
            fullDatabase.slice(0, 50).forEach(card => {
                const newDocRef = doc(cardsCollection, String(card.id));
                batch.set(newDocRef, { ...card, level: 0, nextReview: Date.now() });
            });
            await batch.commit().catch(console.error);
        } else {
            // إذا كان لديه بطاقات، نعرضها
            const userCards = snapshot.docs.map(d => d.data());
            setCards(userCards);
            updateCurrentCard(userCards);
        }
        setLoading(false);
    };

    loadUserCards();

  }, [user]);

  const updateCurrentCard = (list) => {
      const due = list.filter(c => c.level < 5 && (c.nextReview || 0) <= Date.now());
      setCurrentCard(due.length > 0 ? due[0] : null);
  };

  const handleSwipe = async (direction) => {
      if (!currentCard || !user) return;
      const known = direction === 'right';
      const nextLevel = known ? Math.min(currentCard.level + 1, 5) : 0;
      const nextReview = Date.now() + (known ? (Math.pow(2, nextLevel) * 86400000) : 60000); 

      const updatedCard = { ...currentCard, level: nextLevel, nextReview };
      
      setCards(prev => prev.map(c => c.id === currentCard.id ? updatedCard : c));
      updateCurrentCard(cards.map(c => c.id === currentCard.id ? updatedCard : c));

      // حفظ التقدم
      const cardRef = doc(db, "users", user.uid, "personal_cards", String(currentCard.id));
      // نستخدم setDoc مع merge لضمان إنشاء المستند إذا لم يكن موجوداً (في حالة استخدام البيانات الافتراضية)
      await setDoc(cardRef, { ...currentCard, level: nextLevel, nextReview }, { merge: true });

      if (known) {
          await updateDoc(doc(db, "users", user.uid), { xp: (stats.xp || 0) + 10 });
      }
  };

  // CRUD Operations
  const addCard = async (cardData) => {
      const newId = Date.now().toString();
      const newCard = { ...cardData, id: newId, level: 0, nextReview: Date.now() };
      setCards(prev => [...prev, newCard]);
      await setDoc(doc(db, "users", user.uid, "personal_cards", newId), newCard);
  };

  const deleteCard = async (cardId) => {
      setCards(prev => prev.filter(c => c.id !== cardId));
      await deleteDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)));
  };

  const updateCard = async (cardId, newData) => {
      setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...newData } : c));
      await updateDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)), newData);
  };

  const resetProgress = async () => { /* ... */ };

  return { 
      cards, currentCard, stats, handleSwipe, 
      loading, addCard, deleteCard, updateCard, resetProgress,
      isAdmin, isMaster, isBanned
  };
};