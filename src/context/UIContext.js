"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, MASTER_EMAIL } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext'; 

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const { user } = useAuth();
  
  // --- حالات الواجهة الأساسية ---
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // --- نظام البث المباشر (Global Live System) ---
  // يجب تعريف الحالة الابتدائية بدقة
  const [liveStream, setLiveStream] = useState({
    isActive: false,
    roomName: null,
    isMinimized: false
  });

  const startBroadcast = (room) => {
    setLiveStream({ isActive: true, roomName: room, isMinimized: false });
    setCurrentView('live');
  };

  const endBroadcast = () => {
    setLiveStream({ isActive: false, roomName: null, isMinimized: false });
  };

  const toggleMinimize = (minimize) => {
    setLiveStream(prev => ({ ...prev, isMinimized: minimize }));
  };

  // التأثير الذكي للتصغير التلقائي
  useEffect(() => {
    if (liveStream.isActive) {
      if (currentView !== 'live') {
        setLiveStream(prev => ({ ...prev, isMinimized: true }));
      } else {
        setLiveStream(prev => ({ ...prev, isMinimized: false }));
      }
    }
  }, [currentView, liveStream.isActive]);

  // --- نظام الإشعارات ---
  useEffect(() => {
    if (!user) {
        setNotifications([]);
        return;
    }
    
    const myNotifsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid)
    );

    const unsubMy = onSnapshot(myNotifsQuery, (snap) => {
        const myData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(prev => {
            const others = prev.filter(n => n.userId !== user.uid && n.target === 'admin');
            const all = [...others, ...myData];
            const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
            return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        });
    }, (e) => console.log("Notif error:", e));

    let unsubAdmin = () => {};
    if (user.email === MASTER_EMAIL) {
        const adminQuery = query(
            collection(db, "notifications"),
            where("target", "==", "admin")
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
    } catch (e) { console.error("Remove notif failed", e); }
  };

  // تمرير القيم بدقة - liveState هنا هو الحل للخطأ
  // لاحظ: اسم المتغير في RealLiveStream.jsx يجب أن يطابق الاسم هنا (liveStream)
  // في الكود السابق كان هناك خلط بين liveState و liveStream. وحدت الاسم ليكون `liveStream`.
  const value = {
      currentView, setCurrentView, 
      activeCategory, setActiveCategory,
      showSupport, setShowSupport,
      activeOverlayGame, setActiveOverlayGame,
      notifications, removeNotification,
      
      // هنا الإصلاح: التأكد من تمرير liveStream وليس liveState
      liveState: liveStream, 
      startBroadcast, endBroadcast, toggleMinimize
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};