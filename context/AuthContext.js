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
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userRef = doc(db, "users", u.uid);
        const snap = await getDoc(userRef);
        
        if (u.email === MASTER_EMAIL) {
            if (!snap.exists()) await setDoc(userRef, { email: u.email, role: 'master', xp: 0, createdAt: new Date().toISOString() });
            else if (snap.data().role !== 'master') await updateDoc(userRef, { role: 'master' });
        } else if (!snap.exists()) {
            await setDoc(userRef, { email: u.email, role: 'user', xp: 0, createdAt: new Date().toISOString() });
        }

        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
             const data = docSnap.data();
             setUserData(data);
             if (data.isBanned && u.email !== MASTER_EMAIL) {
                auth.signOut();
                window.location.reload();
             }
          }
        });
        return () => unsubDoc();
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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