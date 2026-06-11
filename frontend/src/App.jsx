import React, { useState, useEffect } from 'react';
import { auth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'; // 🌟 UPDATED: นำเข้า setDoc และ serverTimestamp เผื่อกรณีสร้าง User ใหม่
import { useUserStore } from './store/useUserStore';
import { useGameStore } from './store/useGameStore';
import { logoutUser } from './features/auth/authService';

import MobileLayout from './components/layout/MobileLayout';
import { STYLES } from './config/theme';

import LoginScreen from './features/auth/LoginScreen';
import PitchScreen from './features/pitch/PitchScreen';
import MarketScreen from './features/market/MarketScreen';
import QuestScreen from './features/quests/QuestScreen';
import RedeemScreen from './features/redeem/RedeemScreen';
import ProfileScreen from './features/profile/ProfileScreen';
import LeaderboardScreen from './features/leaderboard/LeaderboardScreen';
import SocialScreen from './features/social/SocialScreen';
import LiveScoreScreen from './features/live/LiveScoreScreen';

import Toast from './components/common/Toast';

export default function App() {
  const { 
    isAuthenticated, 
    isAuthLoading, 
    setUserAuth, 
    clearAuth, 
    setAuthReady,
    loadSquadFromCloud // 🌟 NEW: นำเข้าฟังก์ชันโหลดทีมจาก Cloud
  } = useUserStore();
  
  const { initThemeListener } = useGameStore();

  const [currentPath, setCurrentPath] = useState('pitch');

  // 🌟 เปิดการทำงานของระบบซิงค์สถิติและข้อมูลเกมแบบ Real-time ให้ครอบคลุมทั้งแอป (Global Listener)
  useEffect(() => {
    const unsubscribeTheme = initThemeListener();
    return () => unsubscribeTheme();
  }, [initThemeListener]);

  // 🌟 เพิ่มระบบ Seamless Navigation รับ Event สลับหน้าจออัตโนมัติจากทุกที่ในแอป
  useEffect(() => {
    const handleSwitchTab = (e) => {
      if (e.detail) {
        setCurrentPath(e.detail);
      }
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // 🌟 1. เซ็ตข้อมูลผู้ใช้งานพื้นฐานก่อน (อัปเดตแค่นี้พอ)
            setUserAuth({
              uid: user.uid,
              displayName: userData.displayName || user.displayName,
              email: user.email,
              photoURL: userData.photoURL || user.photoURL,
              role: userData.role || 'player',
              balls: userData.balls !== undefined ? userData.balls : (userData.energyBottles || 0), // 🌟 รองรับตัวแปร balls
              userPoints: userData.userPoints || 0,
            });

            // 🌟 2. สั่งโหลดทีมจาก Cloud ผ่าน Service ที่ถูกต้อง (แก้บั๊กเซฟทีมหาย!)
            await loadSquadFromCloud(user.uid);

          } else {
            // กรณีผู้เล่นใหม่ (อาจจะหลุดมาจากการ Login)
            const newUserData = {
              uid: user.uid,
              displayName: user.displayName || 'ผู้จัดการทีมหน้าใหม่',
              email: user.email,
              photoURL: user.photoURL || '',
              role: 'player',
              balls: 100, // ทุนเริ่มต้น 100 Balls
              userPoints: 0,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            };

            await setDoc(userDocRef, newUserData);

            setUserAuth(newUserData);
            // 🌟 โหลดทีมเผื่อไว้ (ถึงจะเป็นไอดีใหม่ก็ต้องเรียก เพื่อให้เซ็ตค่าเริ่มต้นที่ถูกต้อง)
            await loadSquadFromCloud(user.uid);
          }
        } catch (error) {
          console.error("❌ Auth Fetch Error:", error);
          clearAuth();
        }
      } else {
        clearAuth();
        setAuthReady();
      }
    });
    return () => unsubscribe();
  }, [setUserAuth, clearAuth, setAuthReady, loadSquadFromCloud]); // 🌟 อัปเดต Dependency Array

  const handleLogout = async () => {
    await logoutUser();
  };

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F7FE] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl flex items-center justify-center border border-white mb-6">
            <span className="relative flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white shadow-inner"></span>
            </span>
          </div>
          <h2 className={`text-2xl ${STYLES.glowText} animate-pulse`}>กำลังโหลดข้อมูล...</h2>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <><Toast /><LoginScreen /></>;
  }

  // เทคนิค Keep-alive DOM
  const getRouteClass = (path) => currentPath === path 
    ? "block h-full w-full animate-in fade-in duration-300" 
    : "fixed -left-[9999px] opacity-0 pointer-events-none";

  return (
    <>
      <Toast /> 
      
      <MobileLayout currentPath={currentPath} onNavigate={setCurrentPath} onLogout={handleLogout}>
        <div className={getRouteClass('pitch')}><PitchScreen /></div>
        <div className={getRouteClass('market')}><MarketScreen /></div>
        <div className={getRouteClass('quest')}><QuestScreen /></div>
        <div className={getRouteClass('redeem')}><RedeemScreen /></div>
        <div className={getRouteClass('profile')}><ProfileScreen /></div>
        <div className={getRouteClass('leaderboard')}><LeaderboardScreen /></div>
        <div className={getRouteClass('social')}><SocialScreen /></div>
        <div className={getRouteClass('live')}><LiveScoreScreen /></div>
      </MobileLayout>
    </>
  );
}