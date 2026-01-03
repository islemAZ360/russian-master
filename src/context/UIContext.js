"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext'; // نحتاج معرفة هل هو أدمن أم لا

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showSupport, setShowSupport] = useState(false);
  const [activeOverlayGame, setActiveOverlayGame] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // نستخدم AuthContext لمعرفة الصلاحيات
  // ملاحظة: بما أننا داخل UIProvider الذي هو ابن AuthProvider، يمكننا استخدام الهوك، 
  // لكن لتجنب Circular Dependency سنعتمد على auth.currentUser والمنطق الداخلي
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // التحقق البسيط من الأدمن لغرض الإشعارات
    const email = auth.currentUser.email;
    if (email === 'islamaz@bomba.com') setIsAdmin(true);

    // 1. الاستعلام الأساسي: إشعاراتي الخاصة
    const myNotifsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "desc")
    );

    // 2. إذا كان أدمن، نستمع أيضاً لإشعارات النظام (مثل تذاكر جديدة)
    // ملاحظة: في Firestore، الـ OR query معقدة، لذا سنقوم بدمج النتائج إذا لزم الأمر
    // للتبسيط والقوة: الأدمن سيتلقى الإشعارات الموجهة لـ "admin" أيضاً
    
    const unsub = onSnapshot(myNotifsQuery, (snap) => {
        const myNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(myNotifs);
    });

    // استماع إضافي للأدمن (إشعارات موجهة للكل أو للأدمن)
    let unsubAdmin = () => {};
    if (email === 'islamaz@bomba.com') {
        const adminQuery = query(
            collection(db, "notifications"),
            where("target", "==", "admin"),
            orderBy("createdAt", "desc")
        );
        unsubAdmin = onSnapshot(adminQuery, (snap) => {
            const adminNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            // دمج الإشعارات (الشخصية + الإدارية)
            setNotifications(prev => {
                const combined = [...prev, ...adminNotifs];
                // إزالة التكرار بناءً على الـ ID
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                return unique.sort((a,b) => b.createdAt - a.createdAt);
            });
        });
    }

    return () => {
        unsub();
        unsubAdmin();
    };
  }, [auth.currentUser]);

  const removeNotification = async (id) => {
    try {
        await deleteDoc(doc(db, "notifications", id));
        // تحديث الحالة محلياً فوراً لشعور بالسرعة
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

export const useUI = () => useContext(UIContext);