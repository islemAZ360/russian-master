// lib/logger.js
import { db } from './firebase';
import { collection, addDoc } from "firebase/firestore";

export const logEvent = async (user, action, status, details = "") => {
  if (!user) return;
  
  try {
    await addDoc(collection(db, "system_logs"), {
      userId: user.uid,
      email: user.email,
      action: action, // e.g., "Login", "Study Swipe", "Settings"
      status: status, // "SUCCESS", "FAIL", "WARN", "INFO"
      details: details,
      timestamp: Date.now()
    });
  } catch (e) {
    console.error("Log failed", e);
  }
};