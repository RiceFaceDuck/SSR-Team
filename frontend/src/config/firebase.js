import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// โค้ด FirebaseConfig ที่ลูกพี่ส่งมา
const firebaseConfig = {
  apiKey: "AIzaSyDMhbAlH6UxbYK0I6VULTbvM9uLhsBidHQ",
  authDomain: "ssr-team.firebaseapp.com",
  projectId: "ssr-team",
  storageBucket: "ssr-team.firebasestorage.app",
  messagingSenderId: "349137449851",
  appId: "1:349137449851:web:9c4ae3504a269a57b183de",
  measurementId: "G-F5KCM3V0XM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export ส่วนที่จะต้องใช้งานจริง
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;