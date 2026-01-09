"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, query, where, onSnapshot, doc, deleteDoc, getDocs, writeBatch 
} from 'firebase/firestore';
import { useAuth } from './AuthContext'; 

// الحالة الافتراضية للبث
const defaultLiveState = {
  isActive: false,
  roomName: null,
  isMinimized: false
};

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  
  const [notifications, setNotifications] = useState([]);
  const [liveStream, setLiveStream] = useState(defaultLiveState);

  // --- 1. إدارة البث المباشر ---

  const startBroadcast = useCallback((room) => {
    setLiveStream({ isActive: true, roomName: room, isMinimized: false });
    setCurrentView('live');
  }, []);

  // 🔥 دالة إنهاء البث وتنظيف الإشعارات
  const endBroadcast = useCallback(async (explicitRoomId = null) => {
    // نستخدم المعرف الممرر يدوياً (الأضمن) أو الموجود في الحالة الحالية
    const roomToDelete = explicitRoomId || liveStream.roomName;
    
    // أ. تصفير الحالة المحلية في الواجهة فوراً
    setLiveStream(defaultLiveState);
    setCurrentView(prev => prev === 'live' ? 'home' : prev);

    // ب. تنظيف الإشعارات من قاعدة البيانات لمنع ظهور تنبيهات منتهية
    if (roomToDelete) {
        try {
            console.log(`🧹 Cleaning alerts for room: ${roomToDelete}`);
            
            const q = query(
                collection(db, "notifications"),
                where("type", "==", "live_start"),
                where("roomId", "==", roomToDelete)
            );
            
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                const batch = writeBatch(db);
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`✅ Deleted ${snapshot.size} notifications.`);
            }
        } catch (error) {
            console.error("❌ Failed to clean live notifications:", error);
        }
    }
  }, [liveStream.roomName]);

  const toggleMinimize = useCallback((minimize) => {
    setLiveStream(prev => ({ ...prev, isMinimized: minimize }));
  }, []);

  // مراقبة التنقل: تصغير البث تلقائياً إذا انتقل المستخدم لصفحة أخرى
  useEffect(() => {
    if (liveStream.isActive) {
      if (currentView !== 'live') {
        setLiveStream(prev => ({ ...prev, isMinimized: true }));
      } else {
        setLiveStream(prev => ({ ...prev, isMinimized: false }));
      }
    }
  }, [currentView, liveStream.isActive]);

  // --- 2. نظام جلب الإشعارات (Real-time) ---
  
  // دالة مساعدة لدمج وترتيب الإشعارات
  const updateNotificationsState = (newDocs, isAdminSource = false) => {
      setNotifications(prev => {
          let merged = [];
          
          if (isAdminSource) {
              // إذا جاء التحديث من مصدر الأدمن، ندمجه مع الإشعارات الشخصية الموجودة
              const userOnly = prev.filter(n => n.target !== 'admin');
              merged = [...userOnly, ...newDocs];
          } else {
              // إذا جاء التحديث من المصدر الشخصي، ندمجه مع إشعارات الأدمن الموجودة
              const adminOnly = prev.filter(n => n.target === 'admin');
              merged = [...adminOnly, ...newDocs];
          }
          
          // إزالة التكرار (بناءً على ID)
          const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
          
          // الترتيب حسب الوقت (الأحدث أولاً)
          return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      });
  };

  useEffect(() => {
    if (!user) {
        setNotifications([]);
        return;
    }
    
    const unsubscribers = [];

    // أ. الاستماع للإشعارات الشخصية (الموجهة لـ userId)
    const myNotifsQuery = query(
        collection(db, "notifications"), 
        where("userId", "==", user.uid)
    );
    
    const unsubMy = onSnapshot(myNotifsQuery, (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        updateNotificationsState(data, false);
    });
    unsubscribers.push(unsubMy);

    // ب. الاستماع لإشعارات الإدارة (فقط إذا كان المستخدم أدمن)
    if (isAdmin) {
        const adminQuery = query(
            collection(db, "notifications"), 
            where("target", "==", "admin")
        );
        const unsubAdmin = onSnapshot(adminQuery, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            updateNotificationsState(data, true);
        });
        unsubscribers.push(unsubAdmin);
    }

    return () => { 
        unsubscribers.forEach(unsub => unsub());
    };
  }, [user, isAdmin]);

  const removeNotification = async (id) => {
    // التحديث الفوري للواجهة (Optimistic UI)
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    try { 
        await deleteDoc(doc(db, "notifications", id)); 
    } catch (e) { 
        console.error("Failed to delete notification record:", e); 
        // في حال الفشل، يمكن إعادة التحميل أو تجاهل الخطأ لأن الـ Listener سيصحح الوضع
    }
  };

  const value = {
      // Navigation
      currentView, setCurrentView, 
      activeCategory, setActiveCategory,
      
      // Features
      showSupport, setShowSupport,
      activeOverlayGame, setActiveOverlayGame,
      
      // Notifications
      notifications, removeNotification,
      
      // Live Stream
      liveState: liveStream, 
      startBroadcast, endBroadcast, toggleMinimize
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};