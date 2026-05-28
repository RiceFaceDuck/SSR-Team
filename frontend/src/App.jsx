import React, { useState, useEffect } from 'react';
import { auth, db } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useUserStore } from './store/useUserStore';
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
import FloatingDragAvatar from './components/player/FloatingDragAvatar';

export default function App() {
  const { isAuthenticated, isAuthLoading, setUserAuth, clearAuth, setAuthReady } = useUserStore();
  const [currentPath, setCurrentPath] = useState('pitch');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserAuth({
              uid: user.uid,
              displayName: userData.displayName || user.displayName,
              email: user.email,
              photoURL: userData.photoURL || user.photoURL,
              role: userData.role || 'player',
              energyBottles: userData.energyBottles || 0,
              userPoints: userData.userPoints || 0,
              budgetLeft: userData.budgetLeft !== undefined ? userData.budgetLeft : 100.0,
              mySquad: userData.mySquad || [],
              formation: userData.formation || '4-4-2'
            });
          } else {
            setUserAuth({
              uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL,
              energyBottles: 100, budgetLeft: 100.0, mySquad: [], formation: '4-4-2'
            });
          }
        } catch (error) {
          console.error("Auth Fetch Error:", error);
          clearAuth();
        }
      } else {
        clearAuth();
        setAuthReady();
      }
    });
    return () => unsubscribe();
  }, [setUserAuth, clearAuth, setAuthReady]);

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

  // เทคนิค Keep-alive DOM: แทนที่จะลบทิ้ง เราใช้ fixed เอาไปซ่อนไว้นอกจอ (กัน event นิ้วสะดุด)
  const getRouteClass = (path) => currentPath === path 
    ? "block h-full w-full animate-in fade-in duration-300" 
    : "fixed -left-[9999px] opacity-0 pointer-events-none";

  return (
    <>
      <Toast /> 
      <FloatingDragAvatar />
      
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