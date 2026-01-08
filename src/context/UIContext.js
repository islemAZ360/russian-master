"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, query, where, onSnapshot, doc, deleteDoc, getDocs, writeBatch 
} from 'firebase/firestore';
import { useAuth } from './AuthContext'; 

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

  const startBroadcast = useCallback((room) => {
    setLiveStream({ isActive: true, roomName: room, isMinimized: false });
    setCurrentView('live');
  }, []);

  // 🔥 التعديل الجذري: استقبال معرف الغرفة لحذف إشعاراتها
  const endBroadcast = useCallback(async (explicitRoomId = null) => {
    // نستخدم المعرف الممرر يدوياً (الأضمن) أو الموجود في الحالة
    const roomToDelete = explicitRoomId || liveStream.roomName;
    
    // 1. تصفير الحالة المحلية في الواجهة
    setLiveStream(defaultLiveState);
    setCurrentView(prev => prev === 'live' ? 'home' : prev);

    // 2. تنظيف الإشعارات من قاعدة البيانات
    if (roomToDelete) {
        try {
            console.log(`🧹 Attempting to clean alerts for room: ${roomToDelete}`);
            
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

  // مراقبة التنقل
  useEffect(() => {
    if (liveStream.isActive) {
      if (currentView !== 'live') {
        setLiveStream(prev => ({ ...prev, isMinimized: true }));
      } else {
        setLiveStream(prev => ({ ...prev, isMinimized: false }));
      }
    }
  }, [currentView, liveStream.isActive]);

  // --- نظام جلب الإشعارات ---
  useEffect(() => {
    if (!user) {
        setNotifications([]);
        return;
    }
    
    const unsubscribers = [];

    // أ. جلب إشعارات المستخدم
    const myNotifsQuery = query(
        collection(db, "notifications"), 
        where("userId", "==", user.uid)
    );
    
    const unsubMy = onSnapshot(myNotifsQuery, (snap) => {
        updateNotificationsState(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    unsubscribers.push(unsubMy);

    // ب. جلب إشعارات الأدمن
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

  const updateNotificationsState = (newDocs, isAdminSource = false) => {
      setNotifications(prev => {
          let merged = [];
          if (isAdminSource) {
              const userOnly = prev.filter(n => n.target !== 'admin');
              merged = [...userOnly, ...newDocs];
          } else {
              const adminOnly = prev.filter(n => n.target === 'admin');
              merged = [...adminOnly, ...newDocs];
          }
          const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
          return unique.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      });
  };

  const removeNotification = async (id) => {
    try { 
        await deleteDoc(doc(db, "notifications", id)); 
    } catch (e) { 
        console.error("Failed to delete notification record:", e); 
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