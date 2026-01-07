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
   * الرتبة الافتراضية هنا هي 'user' (يوزر عادي)
   */
  const initializeUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;
    
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);
      
      // إذا كان المستخدم جديداً تماماً (لم يتم إنشاء مستنده بعد)
      if (!snap.exists()) {
        // إذا كان الإيميل هو إيميل الماستر، نعطيه رتبة ماستر، غير ذلك رتبة يوزر عادي
        const initialRole = firebaseUser.email?.toLowerCase() === MASTER_EMAIL?.toLowerCase() ? 'master' : 'user';
        
        const newProfile = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Novice Agent', // اسم مؤقت
          photoURL: firebaseUser.photoURL || "/avatars/avatar1.png",
          role: initialRole, // user, student, teacher, admin, master
          teacherId: null,   // معرف الأستاذ (للطلبة فقط)
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
            
            // بروتوكول الحظر الفوري (لأي شخص غير الماستر)
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
        window.location.reload(); // إعادة تحميل النظام لتصفير كافة الحالات
    } catch (e) {
        console.error("Security Termination Failed:", e);
    }
  };

  // تحديد الرتبة الحالية لسهولة الاستخدام
  const currentRole = userData?.role || 'user';

  // القيم التي سيتم تصديرها لكافة أنحاء التطبيق
  const value = {
    user, 
    userData, 
    loading, 
    logout,
    
    // --- نظام الصلاحيات الجديد (RBAC) ---
    role: currentRole, // user, student, teacher, admin, master
    
    // 1. صلاحيات الماستر والأدمن (يديرون الموقع والأساتذة)
    isMaster: currentRole === 'master',
    isAdmin: currentRole === 'admin' || currentRole === 'master',
    
    // 2. صلاحيات الأستاذ (واجهة خاصة، إدارة طلبة، إنشاء محتوى خاص)
    isTeacher: currentRole === 'teacher',
    
    // 3. صلاحيات الطالب (يتبع لأستاذ، محتوى محدد، شات محدد)
    isStudent: currentRole === 'student',
    
    // 4. صلاحيات المستخدم العادي (محتوى عام، شات عام)
    isUser: currentRole === 'user',

    // --- بيانات إضافية للعلاقات ---
    teacherId: userData?.teacherId || null, // للطلاب: معرف أستاذهم
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