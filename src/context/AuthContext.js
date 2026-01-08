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
   * تهيئة ملف المستخدم في قاعدة البيانات عند أول دخول
   */
  const initializeUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;
    
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);
      
      // إذا كان المستخدم جديداً، ننشئ له ملفاً
      if (!snap.exists()) {
        // التحقق مما إذا كان هذا هو الإيميل الرئيسي (الماستر)
        const isMasterEmail = firebaseUser.email?.toLowerCase() === MASTER_EMAIL?.toLowerCase();
        const initialRole = isMasterEmail ? 'master' : 'user';
        
        const newProfile = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'New Agent',
          photoURL: firebaseUser.photoURL || "/avatars/avatar1.png",
          role: initialRole, 
          teacherId: null,
          xp: 0,
          streak: 0,
          isBanned: false,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        
        await setDoc(userRef, newProfile);
      } else {
        // إذا كان موجوداً، نحدث وقت الدخول فقط
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
      }
    } catch (e) { 
        console.error("Profile Init Error:", e); 
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await initializeUserProfile(firebaseUser);
        
        // الاشتراك في تحديثات بيانات المستخدم (للتحديث الفوري للصلاحيات أو الحظر)
        const userRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            
            // نظام الحماية: طرد المستخدم فوراً إذا تم حظره (إلا إذا كان الماستر)
            if (data.isBanned && firebaseUser.email?.toLowerCase() !== MASTER_EMAIL?.toLowerCase()) {
              alert("ACCESS DENIED: Your neural link has been terminated.");
              signOut(auth);
              window.location.reload();
            }
          }
        });

        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [initializeUserProfile]);

  const logout = async () => {
    try {
        await signOut(auth);
        // إعادة تحميل الصفحة لتنظيف أي كاش أو حالات عالقة
        window.location.reload();
    } catch (e) {
        console.error("Logout Error:", e);
    }
  };

  // --- تعريف الرتب والصلاحيات (Role Logic) ---
  const role = userData?.role || 'user';
  
  // 1. الماستر: يملك كل الصلاحيات (لا يمكن حظره)
  const isMaster = role === 'master' || user?.email?.toLowerCase() === MASTER_EMAIL?.toLowerCase();
  
  // 2. الأدمن: يشمل الماستر والأدمن العادي
  const isAdmin = isMaster || role === 'admin';
  
  // 3. الجونيور (Junior Admin): رتبة مساعدة
  // (يستطيع دخول لوحة التحكم، لكن يمكننا تقييده في مكونات معينة لاحقاً)
  const isJunior = isAdmin || role === 'junior_admin' || role === 'moderator';

  // 4. الأستاذ (يملك أدوات إدارة المحتوى والطلاب)
  // ملاحظة: الأدمن يملك صلاحيات الأستاذ أيضاً لتجربة النظام
  const isTeacher = role === 'teacher' || isAdmin; 

  // 5. الطالب
  const isStudent = role === 'student';

  // 6. المستخدم العادي
  const isUser = role === 'user';

  const value = {
    user, 
    userData, 
    loading, 
    logout,
    role,
    
    // Flags للصلاحيات
    isMaster,
    isAdmin,
    isJunior,  // <--- هذا ما طلبته للتحكم في الوصول
    isTeacher,
    isStudent,
    isUser,

    // بيانات إضافية
    teacherId: userData?.teacherId || null,
    isBanned: userData?.isBanned === true
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};