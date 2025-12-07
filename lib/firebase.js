import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// إعداداتك الخاصة
const firebaseConfig = {
  apiKey: "AIzaSyBkWZay17VwaFAUpNHymaBrdlEx9WeYwXQ",
  authDomain: "russiantrainer-ff18f.firebaseapp.com",
  databaseURL: "https://russiantrainer-ff18f-default-rtdb.firebaseio.com",
  projectId: "russiantrainer-ff18f",
  storageBucket: "russiantrainer-ff18f.firebasestorage.app",
  messagingSenderId: "686548730721",
  appId: "1:686548730721:web:0d587b33a91a0dd2c4bb20",
  measurementId: "G-RVYNST9PFY"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تصدير الخدمات
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();