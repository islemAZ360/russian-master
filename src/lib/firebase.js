/* Filename: lib/firebase.js */
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { 
  initializeFirestore, 
  memoryLocalCache 
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBkWZay17VwaFAUpNHymaBrdlEx9WeYwXQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "russiantrainer-ff18f.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://russiantrainer-ff18f-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "russiantrainer-ff18f",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "russiantrainer-ff18f.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "686548730721",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:686548730721:web:0d587b33a91a0dd2c4bb20",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-RVYNST9PFY"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);

// FIX: إجبار استخدام الذاكرة المؤقتة (RAM) فقط
// هذا يمنع التحميل اللانهائي الناتج عن تلف قاعدة البيانات المحلية في المتصفح
let db;
try {
  db = initializeFirestore(app, {
    localCache: memoryLocalCache() 
  });
} catch (e) {
  // Fallback ignoring cache settings if blocked
  const { getFirestore } = require("firebase/firestore");
  db = getFirestore(app);
}

export { db };
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export const MASTER_EMAIL = process.env.NEXT_PUBLIC_MASTER_EMAIL || "islamaz@bomba.com";

export default app;