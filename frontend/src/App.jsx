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

// นำเข้า Components ที่ใช้ร่วมกันระดับสูงสุด
import Toast from './components/common/Toast';
import FloatingDragAvatar from './components/player/FloatingDragAvatar';

export default function App() {
  // ดึง State และ Action จาก Zustand (เชื่อมโยงระบบหลังบ้านกับหน้าบ้าน)
  const { 
    isAuthenticated, 
    isAuthLoading, 
    setUserAuth, 
    clearAuth, 
    setAuthReady 
  } = useUserStore();
  
  // สถานะหน้าปัจจุบัน (เริ่มที่หน้าสนามจัดทีม)
  const [currentPath, setCurrentPath] = useState('pitch');

  useEffect(() => {
    // onAuthStateChanged จะทำงานอัตโนมัติทุกครั้งที่สถานะการล็อกอินเปลี่ยนไป
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // กรณี: ผู้ใช้มีเซสชันล็อกอินอยู่ -> ไปดึงข้อมูล Profile จากฐานข้อมูลมาเตรียมไว้
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // ยัดข้อมูลใส่ State ส่วนกลาง (นำขวด 🧪 และแต้ม มาใช้งานต่อ)
            setUserAuth({
              uid: user.uid,
              displayName: userData.displayName || user.displayName,
              email: user.email,
              photoURL: userData.photoURL || user.photoURL,
              role: userData.role || 'player',
              energyBottles: userData.energyBottles || 0,
              userPoints: userData.userPoints || 0,
              
              // ดึงสถานะทีมล่าสุดจาก Database มาแสดง
              budgetLeft: userData.budgetLeft !== undefined ? userData.budgetLeft : 100.0,
              mySquad: userData.mySquad || [],
              formation: userData.formation || '4-4-2'
            });
          } else {
            // กรณี: เพิ่งกดล็อกอินครั้งแรกสุด
            setUserAuth({
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              energyBottles: 100, // ให้ค่าเริ่มต้นแสดงโชว์ไปก่อนเพื่อความลื่นไหล
              budgetLeft: 100.0,
              mySquad: [],
              formation: '4-4-2'
            });
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error);
          clearAuth(); // ป้องกันการค้าง ถ้าดึงข้อมูลพังให้เตะออกไปหน้าล็อกอิน
        }
      } else {
        // กรณี: ผู้ใช้ยังไม่ได้ล็อกอิน หรือเพิ่งกด Logout
        clearAuth();
        setAuthReady(); // ปลดล็อกหน้าจอ Loading
      }
    });

    // ล้างการติดตามเมื่อ Component ถูกทำลาย
    return () => unsubscribe();
  }, [setUserAuth, clearAuth, setAuthReady]);

  const handleLogout = async () => {
    await logoutUser();
  };

  // ถ้า Firebase ยังเช็กสถานะการล็อกอินไม่เสร็จ ให้โชว์หน้า Loading โก้ๆ ไว้ก่อน
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F7FE] relative overflow-hidden">
        {/* แสง Ambient ตกแต่งพื้นหลัง */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl flex items-center justify-center border border-white mb-6">
            <span className="relative flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white shadow-inner"></span>
            </span>
          </div>
          <h2 className={`text-2xl ${STYLES.glowText} animate-pulse`}>กำลังโหลดข้อมูลทีม...</h2>
          <p className="text-slate-400 font-medium text-sm mt-2">โปรดรอสักครู่ โค้ช</p>
        </div>
      </div>
    );
  }

  // ถ้ายังไม่ได้ล็อกอิน (และโหลดเสร็จแล้ว) ให้เด้งไปหน้า LoginScreen 
  if (!isAuthenticated) {
    return (
      <>
        <Toast />
        <LoginScreen />
      </>
    );
  }

  // ถ้าล็อกอินสำเร็จแล้ว จะเข้ามาโซนนี้ทันที
  return (
    <>
      {/* ฝัง Components ที่ต้องลอยอยู่เหนือทุกหน้าต่างไว้ที่นี่ */}
      <Toast /> 
      <FloatingDragAvatar />
      
      <MobileLayout 
        currentPath={currentPath} 
        onNavigate={setCurrentPath}
        onLogout={handleLogout}
      >
        {/* ระบบ Router สลับหน้า */}
        {currentPath === 'pitch' && <PitchScreen />}
        {currentPath === 'market' && <MarketScreen />}
        {currentPath === 'quest' && <QuestScreen />}
        {currentPath === 'redeem' && <RedeemScreen />}
        
        {/* Router หน้าอื่นๆ */}
        {currentPath === 'profile' && <ProfileScreen />}
        {currentPath === 'leaderboard' && <LeaderboardScreen />}
        {currentPath === 'social' && <SocialScreen />}
        {currentPath === 'live' && <LiveScoreScreen />}
      </MobileLayout>
    </>
  );
}