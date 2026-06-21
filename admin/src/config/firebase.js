import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; 
// ฝั่ง Admin มักจะไม่ต้องใช้ Analytics จึงปิดไว้ก่อนได้ครับ

const firebaseConfig = {
  apiKey: "AIzaSyDMhbAlH6UxbYK0I6VULTbvM9uLhsBidHQ",
  authDomain: "ssr-team.firebaseapp.com",
  projectId: "ssr-team",
  storageBucket: "ssr-team.firebasestorage.app",
  messagingSenderId: "349137449851",
  appId: "1:349137449851:web:9c4ae3504a269a57b183de",
  measurementId: "G-F5KCM3V0XM"
};

// Initialize Firebase for Admin
// เช็คว่ามีการ Initialize Firebase ไปแล้วหรือยัง (ป้องกัน Error duplicate-app จาก Vite HMR รันซ้ำ)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

import { getFunctions } from "firebase/functions";

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;