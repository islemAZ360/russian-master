"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, MASTER_EMAIL } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
// استيراد useAuth من ملف الكونتكست مباشرة لتجنب الدوران
import { useAuth } from './AuthContext'; 

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    if (!user) {
        setNotifications([]);
        return;
    }
    
    // 1. إشعاراتي
    const myNotifsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
    );

    const unsubMy = onSnapshot(myNotifsQuery, (snap) => {
        const myData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(prev => {
            // دمج ذكي
            const others = prev.filter(n => n.userId !== user.uid && n.target === 'admin');
            const all = [...others, ...myData];
            // إزالة التكرار
            const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
            return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        });
    }, (e) => console.log("Notif error:", e));

    // 2. إشعارات الأدمن
    let unsubAdmin = () => {};
    if (user.email === MASTER_EMAIL) {
        const adminQuery = query(
            collection(db, "notifications"),
            where("target", "==", "admin"),
            orderBy("createdAt", "desc")
        );
        unsubAdmin = onSnapshot(adminQuery, (snap) => {
            const adminData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotifications(prev => {
                const myOwn = prev.filter(n => n.target !== 'admin');
                const all = [...myOwn, ...adminData];
                const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
                return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            });
        });
    }

    return () => {
        unsubMy();
        unsubAdmin();
    };
  }, [user]);

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

// تعريف الـ Hook هنا
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};