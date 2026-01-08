"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db, MASTER_EMAIL } from '@/lib/firebase';
import { 
  collection, query, where, onSnapshot, doc, deleteDoc, getDocs, writeBatch 
} from 'firebase/firestore';
import { useAuth } from './AuthContext'; 

// الحالة الافتراضية الثابتة لنظام البث المباشر
const defaultLiveState = {
  isActive: false,
  roomName: null,
  isMinimized: false
};

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const { user, isAdmin } = useAuth();
  
  // --- 1. حالات الواجهة الأساسية ---
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  
  const [notifications, setNotifications] = useState([]);

  // --- 2. حالة البث المباشر ---
  const [liveStream, setLiveStream] = useState(defaultLiveState);

  // --- 3. وظائف التحكم في البث (Live Actions) ---
  
  const startBroadcast = useCallback((room) => {
    setLiveStream({ isActive: true, roomName: room, isMinimized: false });
    setCurrentView('live');
  }, []);

  // 🔥 التعديل: حذف إشعارات البث تلقائياً عند الإغلاق
  const endBroadcast = useCallback(async () => {
    const roomToDelete = liveStream.roomName;
    
    // 1. تصفير الحالة المحلية
    setLiveStream(defaultLiveState);
    setCurrentView(prev => prev === 'live' ? 'home' : prev);

    // 2. تنظيف الإشعارات من قاعدة البيانات (للطلاب)
    if (roomToDelete) {
        try {
            // البحث عن كل الإشعارات المتعلقة بهذه الغرفة
            const q = query(
                collection(db, "notifications"),
                where("type", "==", "live_start"),
                where("roomId", "==", roomToDelete)
            );
            
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
                // استخدام Batch للحذف السريع والمجمع
                const batch = writeBatch(db);
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`🧹 Cleaned up ${snapshot.size} live notifications for room: ${roomToDelete}`);
            }
        } catch (error) {
            console.error("Failed to clean live notifications:", error);
        }
    }
  }, [liveStream.roomName]);

  const toggleMinimize = useCallback((minimize) => {
    setLiveStream(prev => ({ ...prev, isMinimized: minimize }));
  }, []);

  // مراقبة التنقل لتصغير الفيديو تلقائياً
  useEffect(() => {
    if (liveStream.isActive) {
      if (currentView !== 'live') {
        setLiveStream(prev => ({ ...prev, isMinimized: true }));
      } else {
        setLiveStream(prev => ({ ...prev, isMinimized: false }));
      }
    }
  }, [currentView, liveStream.isActive]);

  // --- 4. نظام الإشعارات المطور (Fetching Logic) ---
  
  useEffect(() => {
    if (!user) {
        setNotifications([]);
        return;
    }
    
    const unsubscribers = [];

    // أ. جلب إشعارات المستخدم الشخصية (للجميع)
    const myNotifsQuery = query(
        collection(db, "notifications"), 
        where("userId", "==", user.uid)
    );
    
    const unsubMy = onSnapshot(myNotifsQuery, (snap) => {
        updateNotificationsState(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    unsubscribers.push(unsubMy);

    // ب. جلب إشعارات الإدارة (للأدمن فقط) - الردود والتبليغات
    if (isAdmin) {
        const adminQuery = query(
            collection(db, "notifications"), 
            where("target", "==", "admin")
        );
        
        const unsubAdmin = onSnapshot(adminQuery, (snap) => {
            updateNotificationsState(snap.docs.map(d => ({ id: d.id, ...d.data() })), true);
        });
        unsubscribers.push(unsubAdmin);
    }

    return () => { 
        unsubscribers.forEach(unsub => unsub());
    };
  }, [user, isAdmin]);

  // دالة مساعدة لدمج الإشعارات ومنع التكرار
  const updateNotificationsState = (newDocs, isAdminSource = false) => {
      setNotifications(prev => {
          // دمج القائمة الحالية مع الجديدة
          let merged = [];
          if (isAdminSource) {
              const userOnly = prev.filter(n => n.target !== 'admin');
              merged = [...userOnly, ...newDocs];
          } else {
              const adminOnly = prev.filter(n => n.target === 'admin');
              merged = [...adminOnly, ...newDocs];
          }

          // إزالة التكرار بناءً على ID
          const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
          
          // الترتيب من الأحدث للأقدم
          return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      });
  };

  // حذف إشعار (يدوي)
  const removeNotification = async (id) => {
    try { 
        await deleteDoc(doc(db, "notifications", id)); 
    } catch (e) { 
        console.error("Failed to delete notification record:", e); 
        // تحديث محلي احتياطي
        setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const value = {
      currentView, setCurrentView, 
      activeCategory, setActiveCategory,
      showSupport, setShowSupport,
      activeOverlayGame, setActiveOverlayGame,
      notifications, removeNotification,
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