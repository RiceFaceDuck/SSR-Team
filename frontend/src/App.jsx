import React, { useState, useEffect } from 'react';
import { useUserStore } from './store/useUserStore';
import { useGameStore } from './store/useGameStore';
import { logoutUser } from './features/auth/authService';

// Custom Hooks
import { useAuthSync } from './hooks/useAuthSync';
import { useSessionTimeout } from './hooks/useSessionTimeout';

// Layout & UI
import MobileLayout from './components/layout/MobileLayout';
import { STYLES } from './config/theme';
import Toast from './components/common/Toast';

// Screens
import LoginScreen from './features/auth/LoginScreen';
import StartGameScreen from './features/auth/StartGameScreen';
import PitchScreen from './features/pitch/PitchScreen';
import MarketScreen from './features/market/MarketScreen';
import QuestScreen from './features/quests/QuestScreen';
import RedeemScreen from './features/redeem/RedeemScreen';
import ProfileScreen from './features/profile/ProfileScreen';
import LeaderboardScreen from './features/leaderboard/LeaderboardScreen';
import SocialScreen from './features/social/SocialScreen';
import LiveScoreScreen from './features/live/LiveScoreScreen';

export default function App() {
  const { isAuthenticated, isAuthLoading } = useUserStore();
  const { initThemeListener } = useGameStore();

  const [currentPath, setCurrentPath] = useState('pitch');
  const [isGameStarted, setIsGameStarted] = useState(false); // 🌟 State สำหรับคุมหน้า Tap to Start

  // 🌟 1. ดึงข้อมูล Auth จาก Firebase แบบอัตโนมัติ (SRP)
  useAuthSync();
  
  // 🌟 2. ระบบเตะออกอัตโนมัติเมื่อครบ 20 นาที
  useSessionTimeout();

  useEffect(() => {
    const unsubscribeTheme = initThemeListener();

    // ดักจับ Referral Code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }

    return () => unsubscribeTheme();
  }, [initThemeListener]);

  useEffect(() => {
    const handleSwitchTab = (e) => {
      if (e.detail) {
        setCurrentPath(e.detail);
      }
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setIsGameStarted(false); // รีเซ็ตสถานะเมื่อล็อกเอาท์
  };

  // กำลังโหลดข้อมูล (Loading State)
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

  // กรณียังไม่ล็อกอิน -> แสดงหน้า LoginScreen
  if (!isAuthenticated) {
    return (
      <>
        <Toast />
        <LoginScreen onLogin={() => {}} />
      </>
    );
  }

  // 🌟 กรณีล็อกอินแล้ว แต่ยังไม่ได้กดเริ่มเกม -> แสดงหน้า Tap to Start
  if (isAuthenticated && !isGameStarted) {
    return (
      <>
        <Toast />
        <StartGameScreen onStart={() => setIsGameStarted(true)} />
      </>
    );
  }

  // เทคนิค Keep-alive DOM เพื่อให้สลับแท็บเร็วขึ้น
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