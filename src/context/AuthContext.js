"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db, MASTER_EMAIL } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

// FIX: إضافة export هنا
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const initializeUserProfile = useCallback(async (firebaseUser) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        const initialRole = firebaseUser.email?.toLowerCase() === MASTER_EMAIL.toLowerCase() ? 'master' : 'user';
        const newProfile = {
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || "/avatars/avatar1.png",
          role: initialRole,
          xp: 0,
          isBanned: false,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        };
        await setDoc(userRef, newProfile);
      } else {
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
      }
    } catch (e) { console.error("Profile init warning:", e); }
  }, []);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
        if(loading) setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimer);
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          initializeUserProfile(firebaseUser);
          
          const userRef = doc(db, "users", firebaseUser.uid);
          onSnapshot(userRef, (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data);
                if (data.isBanned && firebaseUser.email !== MASTER_EMAIL) auth.signOut();
              }
            });
        } else {
          setUser(null);
          setUserData(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => {
        clearTimeout(safetyTimer);
        unsubscribe();
    };
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const value = {
    user, userData, loading, logout,
    isAdmin: userData?.role === 'admin' || userData?.role === 'master',
    isJunior: ['junior','admin','master'].includes(userData?.role),
    isMaster: userData?.role === 'master',
    isBanned: userData?.isBanned === true
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// لا نحتاج لتصدير useAuth من هنا لأننا أنشأناها كملف منفصل