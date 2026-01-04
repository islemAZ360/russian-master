"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, MASTER_EMAIL } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext'; 

// الحالة الافتراضية لنظام البث
const defaultLiveState = {
  isActive: false,
  roomName: null,
  isMinimized: false
};

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const { user } = useAuth();
  
  // --- 1. حالات الواجهة (UI States) ---
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // --- 2. حالة البث المباشر (Live Stream State) ---
  const [liveStream, setLiveStream] = useState(defaultLiveState);

  // --- 3. وظائف نظام البث (Live Actions) ---
  
  // بدء البث والتوجه لصفحة اللايف
  const startBroadcast = useCallback((room) => {
    setLiveStream({ isActive: true, roomName: room, isMinimized: false });
    setCurrentView('live');
  }, []);

  // إنهاء البث وتصفير الحالة (إصلاح مشكلة الخروج)
  const endBroadcast = useCallback(() => {
    setLiveStream(defaultLiveState);
    // العودة للقاعدة إذا كان المستخدم في صفحة اللايف
    setCurrentView(prev => prev === 'live' ? 'home' : prev);
  }, []);

  // تصغير وتكبير نافذة البث
  const toggleMinimize = useCallback((minimize) => {
    setLiveStream(prev => ({ ...prev, isMinimized: minimize }));
  }, []);

  // مراقبة التنقل لعمل تصغير تلقائي (Auto-Minimize)
  useEffect(() => {
    if (liveStream.isActive) {
      if (currentView !== 'live') {
        setLiveStream(prev => ({ ...prev, isMinimized: true }));
      } else {
        setLiveStream(prev => ({ ...prev, isMinimized: false }));
      }
    }
  }, [currentView, liveStream.isActive]);

  // --- 4. نظام الإشعارات المتطور (Notifications System) ---
  
  useEffect(() => {
    if (!user) {
        setNotifications([]);
        return;
    }
    
    // أ. جلب إشعارات المستخدم الخاصة (بناءً على UID)
    const myNotifsQuery = query(
        collection(db, "notifications"), 
        where("userId", "==", user.uid)
    );
    
    const unsubMy = onSnapshot(myNotifsQuery, (snap) => {
        const myData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        setNotifications(prev => {
            // الحفاظ على إشعارات الأدمن الموجودة مسبقاً ودمج الإشعارات الجديدة
            const adminNotifs = prev.filter(n => n.target === 'admin');
            const all = [...adminNotifs, ...myData];
            // إزالة التكرار بناءً على ID
            const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
            // الترتيب حسب الوقت
            return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        });
    }, (e) => console.log("User notifications error:", e));

    // ب. جلب إشعارات الإدارة (إذا كان المستخدم هو MASTER_EMAIL)
    let unsubAdmin = () => {};
    if (user.email === MASTER_EMAIL) {
        const adminQuery = query(
            collection(db, "notifications"), 
            where("target", "==", "admin")
        );
        
        unsubAdmin = onSnapshot(adminQuery, (snap) => {
            const adminData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            
            setNotifications(prev => {
                const userNotifs = prev.filter(n => n.target !== 'admin');
                const all = [...userNotifs, ...adminData];
                const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
                return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            });
        }, (e) => console.log("Admin notifications error:", e));
    }

    return () => { 
        unsubMy(); 
        unsubAdmin(); 
    };
  }, [user]);

  // حذف إشعار
  const removeNotification = async (id) => {
    try { 
        await deleteDoc(doc(db, "notifications", id)); 
        setNotifications(prev => prev.filter(n => n.id !== id)); 
    } catch (e) { 
        console.error("Remove notification failed:", e); 
    }
  };

  // --- 5. تصدير القيم (Context Value) ---
  const value = {
      // رؤية الصفحات
      currentView, 
      setCurrentView, 
      activeCategory, 
      setActiveCategory,
      showSupport, 
      setShowSupport,
      activeOverlayGame, 
      setActiveOverlayGame,
      
      // الإشعارات
      notifications, 
      removeNotification,
      
      // البث المباشر (Mapped to liveState as expected by components)
      liveState: liveStream, 
      startBroadcast, 
      endBroadcast, 
      toggleMinimize
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// الهوك الخاص باستخدام السياق
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};