import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

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
export const functions = getFunctions(app, 'us-central1'); // Default region

// 🌟 NEW: เปิดใช้งาน Firebase App Check เพื่อป้องกันบอทและสแปม
// หากจะใช้จริงบน Production ต้องไปเอา Site Key จาก Google Cloud Console (reCAPTCHA Enterprise)
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('YOUR_RECAPTCHA_ENTERPRISE_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});

// Enable Offline Persistence for Firestore (ประหยัด Reads + รองรับ Offline)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
  } else if (err.code === 'unimplemented') {
    console.warn("The current browser does not support all of the features required to enable persistence.");
  }
});

export default app;