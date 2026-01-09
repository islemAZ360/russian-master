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
      
      // إذا كان المستخدم جديداً تماماً (ليس لديه سجل في Firestore)
      if (!snap.exists()) {
        // التحقق مما إذا كان هذا هو الإيميل الرئيسي (الماستر)
        const isMasterEmail = firebaseUser.email?.toLowerCase() === (MASTER_EMAIL || "").toLowerCase();
        
        // الرتبة الافتراضية: ماستر إذا تطابق الإيميل، وإلا مستخدم عادي
        const initialRole = isMasterEmail ? 'master' : 'user';
        
        const newProfile = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'New Agent',
          photoURL: firebaseUser.photoURL || "/avatars/avatar1.png",
          role: initialRole, 
          teacherId: null, // لا يوجد أستاذ افتراضياً
          xp: 0,
          streak: 0,
          isBanned: false,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          settings: { theme: 'dark', sound: true } // إعدادات افتراضية
        };
        
        await setDoc(userRef, newProfile);
      } else {
        // إذا كان المستخدم موجوداً، نقوم فقط بتحديث "آخر ظهور"
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
        
        // الاشتراك في تحديثات بيانات المستخدم في الوقت الفعلي (Firestore Listener)
        // هذا يضمن أن تغيير الرتبة من لوحة الأدمن ينعكس فوراً عند المستخدم دون تحديث الصفحة
        const userRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            
            // نظام الحماية: طرد المستخدم فوراً إذا تم حظره (إلا إذا كان الماستر)
            const isMaster = data.role === 'master' || firebaseUser.email?.toLowerCase() === (MASTER_EMAIL || "").toLowerCase();
            
            if (data.isBanned && !isMaster) {
              alert("ACCESS DENIED: Your neural link has been terminated by command.");
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
        // إعادة تحميل الصفحة لتنظيف أي كاش أو حالات عالقة في الذاكرة
        window.location.reload();
    } catch (e) {
        console.error("Logout Error:", e);
    }
  };

  // --- تعريف الرتب والصلاحيات (Role Logic) ---
  const role = userData?.role || 'user';
  
  // 1. الماستر: يملك كل الصلاحيات ولا يمكن حظره
  const isMaster = role === 'master' || user?.email?.toLowerCase() === (MASTER_EMAIL || "").toLowerCase();
  
  // 2. الأدمن: يشمل الماستر والأدمن العادي
  const isAdmin = isMaster || role === 'admin';
  
  // 3. الجونيور (Junior Admin): رتبة مساعدة للأدمن
  // (يستطيع دخول لوحة التحكم، لكن بصلاحيات محدودة حددناها في AdminDashboard)
  const isJunior = isAdmin || role === 'junior_admin' || role === 'moderator';

  // 4. الأستاذ (Teacher): يملك أدوات إدارة المحتوى والطلاب
  // ملاحظة: نمنح الأدمن صلاحيات الأستاذ أيضاً ليتمكن من تجربة الميزات
  const isTeacher = role === 'teacher' || isAdmin; 

  // 5. الطالب (Student): يرى محتوى الأستاذ فقط
  const isStudent = role === 'student';

  // 6. المستخدم العادي (User): لم ينضم لأي فصل بعد
  const isUser = role === 'user';

  const value = {
    user, 
    userData, 
    loading, 
    logout,
    role,
    
    // Flags للصلاحيات (نستخدم هذه في ViewManager وباقي المكونات)
    isMaster,
    isAdmin,
    isJunior,
    isTeacher,
    isStudent,
    isUser,

    // بيانات إضافية مفيدة
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