"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';

// FIX: إضافة export هنا
export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const email = auth.currentUser.email;
    
    const myNotifsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(myNotifsQuery, (snap) => {
        const myNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(myNotifs);
    });

    let unsubAdmin = () => {};
    if (email === 'islamaz@bomba.com') {
        const adminQuery = query(
            collection(db, "notifications"),
            where("target", "==", "admin"),
            orderBy("createdAt", "desc")
        );
        unsubAdmin = onSnapshot(adminQuery, (snap) => {
            const adminNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotifications(prev => {
                const combined = [...prev, ...adminNotifs];
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                return unique.sort((a,b) => b.createdAt - a.createdAt);
            });
        });
    }

    return () => {
        unsub();
        unsubAdmin();
    };
  }, []); // إزالة التبعية لـ auth.currentUser لتجنب الدخول في حلقة

  const removeNotification = async (id) => {
    try {
        await deleteDoc(doc(db, "notifications", id));
        setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <UIContext.Provider value={{ 
        currentView, setCurrentView, 
        activeCategory, setActiveCategory,
        showSupport, setShowSupport,
        activeOverlayGame, setActiveOverlayGame,
        notifications, removeNotification
    }}>
      {children}
    </UIContext.Provider>
  );
};