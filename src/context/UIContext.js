"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, MASTER_EMAIL } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext'; 

// الحالة الافتراضية الثابتة لنظام البث المباشر
const defaultLiveState = {
  isActive: false,
  roomName: null,
  isMinimized: false
};

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const { user } = useAuth();
  
  // --- 1. حالات الواجهة الأساسية (Navigation & UI) ---
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  
  // ضمان أن الإشعارات تبدأ كمصفوفة فارغة دائماً
  const [notifications, setNotifications] = useState([]);

  // --- 2. حالة البث المباشر (Live Signals) ---
  const [liveStream, setLiveStream] = useState(defaultLiveState);

  // --- 3. وظائف التحكم في البث (Live Actions) ---
  
  const startBroadcast = useCallback((room) => {
    setLiveStream({ isActive: true, roomName: room, isMinimized: false });
    setCurrentView('live');
  }, []);

  const endBroadcast = useCallback(() => {
    setLiveStream(defaultLiveState);
    // العودة التلقائية للقاعدة عند إنهاء البث
    setCurrentView(prev => prev === 'live' ? 'home' : prev);
  }, []);

  const toggleMinimize = useCallback((minimize) => {
    setLiveStream(prev => ({ ...prev, isMinimized: minimize }));
  }, []);

  // مراقبة التنقل لتصغير الفيديو تلقائياً إذا خرج المستخدم من صفحة اللايف
  useEffect(() => {
    if (liveStream.isActive) {
      if (currentView !== 'live') {
        setLiveStream(prev => ({ ...prev, isMinimized: true }));
      } else {
        setLiveStream(prev => ({ ...prev, isMinimized: false }));
      }
    }
  }, [currentView, liveStream.isActive]);

  // --- 4. نظام الإشعارات المطور (Advanced Notification Engine) ---
  
  useEffect(() => {
    if (!user) {
        setNotifications([]);
        return;
    }
    
    // أ. جلب إشعارات المستخدم الشخصية (Invites, Support Replies, etc.)
    const myNotifsQuery = query(
        collection(db, "notifications"), 
        where("userId", "==", user.uid)
    );
    
    const unsubMy = onSnapshot(myNotifsQuery, (snap) => {
        const myData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        setNotifications(prev => {
            // تصفية الإشعارات القديمة ودمج الجديدة مع إشعارات الأدمن إن وجدت
            const adminNotifs = prev.filter(n => n.target === 'admin');
            const all = [...adminNotifs, ...myData];
            // إزالة التكرار بناءً على الـ ID
            const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
            // الترتيب من الأحدث للأقدم
            return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        });
    }, (error) => console.error("Notification Sync Error:", error));

    // ب. جلب إشعارات الإدارة (Support Tickets Alerts) - فقط للأدمن الرئيسي
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
        });
    }

    return () => { 
        unsubMy(); 
        unsubAdmin(); 
    };
  }, [user]);

  // حذف إشعار بعد التفاعل معه
  const removeNotification = async (id) => {
    try { 
        await deleteDoc(doc(db, "notifications", id)); 
        setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) { 
        console.error("Failed to delete notification record:", e); 
    }
  };

  // --- 5. تصدير القيم (Context Value) ---
  const value = {
      // رؤية الصفحات والمودالز
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
      
      // البث المباشر
      liveState: liveStream, 
      startBroadcast, 
      endBroadcast, 
      toggleMinimize
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

// هوك الاستخدام (Consumer Hook)
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};