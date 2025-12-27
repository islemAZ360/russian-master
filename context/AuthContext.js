"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();
const MASTER_EMAIL = "islamaz@bomba.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. صمام أمان: إذا تأخر Firebase، افتح الموقع بالقوة بعد 3 ثواني
    const safetyTimer = setTimeout(() => {
        console.warn("⚠️ Firebase took too long. Forcing app load.");
        setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
            setUser(u);
            const userRef = doc(db, "users", u.uid);
            
            // محاولة جلب البيانات (مع معالجة الأخطاء)
            try {
                const snap = await getDoc(userRef);
                if (!snap.exists()) {
                    // إنشاء مستخدم جديد إذا لم يوجد
                    await setDoc(userRef, { 
                        email: u.email, 
                        role: u.email === MASTER_EMAIL ? 'master' : 'user', 
                        xp: 0, 
                        createdAt: new Date().toISOString() 
                    });
                }
                
                // الاستماع للتحديثات
                onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) setUserData(docSnap.data());
                }, (error) => console.log("User stream error (ignorable):", error));

            } catch (err) {
                console.error("Firestore access error:", err);
            }
        } else {
            setUser(null);
            setUserData(null);
        }
      } catch (e) {
          console.error("Auth Error:", e);
      } finally {
          // في كل الحالات، أوقف التحميل
          setLoading(false);
          clearTimeout(safetyTimer);
      }
    });

    return () => {
        unsubscribe();
        clearTimeout(safetyTimer);
    };
  }, []);

  // تحديد الصلاحيات بناءً على الإيميل لضمان العمل حتى لو فشلت قاعدة البيانات
  const isMaster = user?.email === MASTER_EMAIL;
  const isAdmin = userData?.role === 'admin' || userData?.role === 'master' || isMaster;
  const isJunior = userData?.role === 'junior' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, isMaster, isJunior }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);