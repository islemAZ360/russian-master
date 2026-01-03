"use client";
import { useState, useEffect, useCallback } from 'react';
import { fullDatabase } from '../data/fullDatabase'; 
import { db } from '../lib/firebase';
import { doc, setDoc, collection, getDocs, updateDoc, deleteDoc, writeBatch, getDoc, onSnapshot } from "firebase/firestore";

const APP_VERSION = "2.0.2";

export const useStudySystem = (user) => {
  const [cards, setCards] = useState(fullDatabase); 
  const [stats, setStats] = useState({ xp: 0, streak: 0, role: 'user' });
  const [loading, setLoading] = useState(true);
  const [currentCard, setCurrentCard] = useState(null);
  const [isBanned, setIsBanned] = useState(false);

  // Check version on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedVersion = localStorage.getItem('app_version');
    if (savedVersion !== APP_VERSION) {
      console.log("Detecting new version, clearing old state...");
      // Keep auth data but clear other caches
      const authData = localStorage.getItem('firebase:authUser');
      localStorage.clear(); 
      if (authData) {
        localStorage.setItem('firebase:authUser', authData);
      }
      localStorage.setItem('app_version', APP_VERSION);
    }
  }, []);

  // Smart card picker function
  const pickNextCard = useCallback((currentList, excludeId = null) => {
    if (!currentList || currentList.length === 0) {
      setCurrentCard(null);
      return;
    }
    
    const now = Date.now();
    // Filter out the current card to avoid repetition
    const availableCards = excludeId 
      ? currentList.filter(c => c.id !== excludeId)
      : currentList;
    
    // Cards that are due (or new with level 0)
    const due = availableCards.filter(c => c.level < 5 && (!c.nextReview || c.nextReview <= now));
    
    if (due.length > 0) {
      // Pick randomly from due cards to avoid boredom
      const randomIndex = Math.floor(Math.random() * due.length);
      setCurrentCard(due[randomIndex]);
    } else if (availableCards.length > 0) {
      // If no due cards, pick any card for review (Overdrive Mode)
      const randomAny = Math.floor(Math.random() * availableCards.length);
      setCurrentCard(availableCards[randomAny]);
    } else {
      setCurrentCard(null);
    }
  }, []);

  // Initial load and user sync
  useEffect(() => {
    pickNextCard(fullDatabase);
    setLoading(false);

    if (!user) return;

    let unsubscribe = () => {};

    const syncUserData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        
        // Listen for real-time user data changes
        unsubscribe = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setStats(userData);
            
            // Check if user is banned
            if (userData.isBanned) {
              setIsBanned(true);
            }
          }
        }, (error) => {
          console.error("User snapshot error:", error);
        });

        // Get user cards
        const cardsCollection = collection(db, "users", user.uid, "personal_cards");
        const snapshot = await getDocs(cardsCollection);
        
        if (!snapshot.empty) {
          const userCardsMap = new Map(snapshot.docs.map(d => [d.id, d.data()]));
          const mergedCards = fullDatabase.map(card => {
            const userProgress = userCardsMap.get(String(card.id));
            return userProgress ? { ...card, ...userProgress } : card;
          });
          setCards(mergedCards);
          pickNextCard(mergedCards);
        } else {
          await initializeUserDb(user.uid);
        }
      } catch (e) {
        console.error("Sync error:", e);
      }
    };

    syncUserData();
    
    return () => unsubscribe();
  }, [user, pickNextCard]);

  const initializeUserDb = async (uid) => {
    try {
      const batch = writeBatch(db);
      const cardsCollection = collection(db, "users", uid, "personal_cards");
      fullDatabase.slice(0, 20).forEach(card => {
        const docRef = doc(cardsCollection, String(card.id));
        batch.set(docRef, { ...card, level: 0, nextReview: Date.now() });
      });
      await batch.commit();
    } catch (e) {
      console.error("Batch initialization error:", e);
    }
  };

  // Core swipe handler with optimistic UI
  const handleSwipe = useCallback(async (direction) => {
    if (!currentCard || !user) return;
    
    const known = direction === 'right';
    // Algorithm: If known, next review is far. If not known, next review is soon.
    const nextLevel = known ? Math.min((currentCard.level || 0) + 1, 5) : 0;
    const nextReview = Date.now() + (known ? (Math.pow(2, nextLevel) * 86400000) : 60000); 

    // 1. Optimistic UI update
    const updatedCard = { ...currentCard, level: nextLevel, nextReview };
    
    const newCardsList = cards.map(c => c.id === currentCard.id ? updatedCard : c);
    setCards(newCardsList);
    
    // 2. Pick next card immediately (exclude current card)
    pickNextCard(newCardsList, currentCard.id);

    // 3. Save to Firebase (background)
    try {
      const cardRef = doc(db, "users", user.uid, "personal_cards", String(currentCard.id));
      await setDoc(cardRef, { ...updatedCard }, { merge: true });
      
      if (known) {
        await updateDoc(doc(db, "users", user.uid), { xp: (stats.xp || 0) + 10 });
        setStats(prev => ({...prev, xp: prev.xp + 10}));
      }
    } catch (e) { 
      console.error("Save failed:", e); 
    }
  }, [currentCard, user, cards, stats.xp, pickNextCard]);

  const addCard = useCallback(async (cardData) => {
    const newCard = { ...cardData, id: Date.now(), level: 0, nextReview: Date.now() };
    setCards(prev => [...prev, newCard]);
    
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid, "personal_cards", String(newCard.id)), newCard);
      } catch (e) {
        console.error("Add card error:", e);
      }
    }
    return newCard;
  }, [user]);

  const deleteCard = useCallback(async (cardId) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    
    if (user) {
      try {
        await deleteDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)));
      } catch (e) {
        console.error("Delete card error:", e);
      }
    }
  }, [user]);

  const updateCard = useCallback(async (cardId, newData) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...newData } : c));
    
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid, "personal_cards", String(cardId)), newData);
      } catch (e) {
        console.error("Update card error:", e);
      }
    }
  }, [user]);

  const resetProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      const batch = writeBatch(db);
      const cardsCollection = collection(db, "users", user.uid, "personal_cards");
      
      cards.forEach(card => {
        const docRef = doc(cardsCollection, String(card.id));
        batch.update(docRef, { level: 0, nextReview: Date.now() });
      });
      
      await batch.commit();
      
      // Reset local state
      const resetCards = cards.map(c => ({ ...c, level: 0, nextReview: Date.now() }));
      setCards(resetCards);
      pickNextCard(resetCards);
    } catch (e) {
      console.error("Reset progress error:", e);
    }
  }, [user, cards, pickNextCard]);

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
    isAdmin: stats.role === 'admin' || stats.role === 'master',
    isMaster: stats.role === 'master',
    isBanned 
  };
};
