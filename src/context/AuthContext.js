"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db, MASTER_EMAIL } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  /**
   * دالة تهيئة الملف الشخصي (Profile Initialization)
   * تُستخدم لإنشاء مستند المستخدم في Firestore لأول مرة
   */
  const initializeUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;
    
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);
      
      // إذا كان المستخدم جديداً تماماً (لم يتم إنشاء مستنده بعد)
      if (!snap.exists()) {
        const initialRole = firebaseUser.email?.toLowerCase() === MASTER_EMAIL?.toLowerCase() ? 'master' : 'user';
        
        const newProfile = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Agent', // اسم مؤقت لحين اختيار الاسم الرمزي
          photoURL: firebaseUser.photoURL || "/avatars/avatar1.png",
          role: initialRole,
          xp: 0,
          streak: 0,
          isBanned: false,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        
        await setDoc(userRef, newProfile);
      } else {
        // إذا كان موجوداً، نكتفي بتحديث وقت آخر دخول
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
      }
    } catch (e) { 
        console.error("Critical Profile Initialization Error:", e); 
    }
  }, []);

  useEffect(() => {
    // المستمع الرئيسي لحالة تسجيل الدخول
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // محاولة تهيئة الملف إذا لم يكن موجوداً
        await initializeUserProfile(firebaseUser);
        
        // البدء بمراقبة بيانات المستخدم في Firestore في الوقت الفعلي
        const userRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            
            // بروتوكول الحظر الفوري
            if (data.isBanned && firebaseUser.email?.toLowerCase() !== MASTER_EMAIL?.toLowerCase()) {
              signOut(auth);
            }
          }
        }, (err) => {
          console.error("User Data Stream Error:", err);
        });

        // تنظيف مستمع المستند عند تسجيل الخروج
        return () => unsubscribeDoc();

      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [initializeUserProfile]);

  /**
   * وظيفة إنهاء الجلسة بشكل آمن
   */
  const logout = async () => {
    try {
        await signOut(auth);
        window.location.reload(); // إعادة تحميل النظام لتصفير كافة الحالات (Clean Slate)
    } catch (e) {
        console.error("Security Termination Failed:", e);
    }
  };

  // القيم التي سيتم تصديرها لكافة أنحاء التطبيق
  const value = {
    user, 
    userData, 
    loading, 
    logout,
    // مساعدات برمجية سريعة لفحص الصلاحيات
    isAdmin: userData?.role === 'admin' || userData?.role === 'master',
    isJunior: ['junior','admin','master'].includes(userData?.role),
    isMaster: userData?.role === 'master' || user?.email?.toLowerCase() === MASTER_EMAIL?.toLowerCase(),
    isBanned: userData?.isBanned === true
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// الهوك المخصص للوصول السهل لبيانات الهوية
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider. Neural link failed.');
  }
  return context;
};