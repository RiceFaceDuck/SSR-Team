import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './config/firebase';
import Sidebar from './components/layout/Sidebar';
import QuestManager from './features/quests/QuestManager';
import UserManager from './features/users/UserManager';
import RewardManager from './features/rewards/RewardManager';

import PlayerFeature from './features/players/PlayerFeature';
import DataOverlapManagement from './features/players/views/DataOverlapManagement';
import TeamManager from './features/teams/views/TeamManager';
import ManagerList from './features/managers/views/ManagerList';
import CardList from './features/cards/views/CardList';
import LogicManual from './features/system/views/LogicManual';
import SystemSettings from './features/system/views/SystemSettings';
import GameweekDashboard from './features/gameweek/views/GameweekDashboard';
import DashboardScreen from './features/dashboard/views/Dashboard';
import GameRulesDashboard from './features/gameRules/views/GameRulesDashboard';
import HistoryArchive from './features/history/views/HistoryArchive';
import MatchDashboard from './features/matches/views/MatchDashboard';
import BallsCalculatorBoard from './features/economy/views/BallsCalculatorBoard';
import AchievementManager from './features/achievements/views/AchievementManager';

// 🌟 Removed placeholder DashboardScreen

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [userEmail, setUserEmail] = useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login Error:', error);
      alert('ล็อกอินล้มเหลว: ' + error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4">
        <div className="bg-slate-800 p-8 rounded-2xl text-center shadow-xl max-w-md w-full border border-slate-700">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">ระบบจัดการหลังบ้าน (Admin)</h2>
          <p className="text-slate-400 mb-8 text-sm">
            คุณต้องเข้าสู่ระบบด้วยบัญชีแอดมิน (เช่น bentsbac@gmail.com หรือ kwan.oneself@gmail.com)
            เพื่อแก้ไขข้อมูลในฐานข้อมูล (Firestore)
          </p>
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            เข้าสู่ระบบด้วย Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
        {/* แถบเมนูด้านซ้าย */}
        <Sidebar onLogout={() => setIsAuthenticated(false)} />

        {/* พื้นที่จัดการข้อมูลด้านขวา */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Topbar อย่างง่าย */}
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
            <h2 className="text-xl font-black text-slate-700 tracking-tight">ระบบจัดการหลังบ้าน</h2>
            <div className="flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-500">ระบบทำงานปกติ</span>

              {userEmail && (
                <div className="flex items-center gap-3 border-l border-slate-300 pl-4 ml-2">
                  <span className="text-sm font-bold text-blue-600">{userEmail}</span>
                  <button
                    onClick={async () => {
                      await signOut(auth);
                    }}
                    className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition-colors"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* กระดานแสดงผล (เปลี่ยนไปตาม Route) */}
          <div className="flex-1 overflow-x-hidden overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              <Routes>
                {/* หน้าหลัก */}
                <Route path="/" element={<DashboardScreen />} />

                {/* เรียกใช้ Component ของจริง */}
                <Route path="/quests" element={<QuestManager />} />
                <Route path="/users" element={<UserManager />} />
                <Route path="/achievements" element={<AchievementManager />} />
                <Route path="/rewards" element={<RewardManager />} />

                {/* 🌟 จุดที่แก้ไข (Hotfix): ลบ div กำลังพัฒนาออก และเสียบระบบจริงเข้าไป */}
                <Route path="/players/overlap" element={<DataOverlapManagement />} />
                <Route path="/players" element={<PlayerFeature />} />
                <Route path="/teams" element={<TeamManager />} />
                <Route path="/managers" element={<ManagerList />} />
                <Route path="/cards" element={<CardList />} />
                <Route path="/logic-manual" element={<LogicManual />} />
                <Route path="/settings" element={<SystemSettings />} />
                <Route path="/gameweek" element={<GameweekDashboard />} />
                <Route path="/rules" element={<GameRulesDashboard />} />
                <Route path="/history" element={<HistoryArchive />} />

                {/* Route จำลองอื่นๆ ป้องกัน Error */}
                <Route path="/matches" element={<MatchDashboard />} />
                <Route path="/economy" element={<BallsCalculatorBoard />} />

                {/* ดักจับ Route มั่วๆ ให้กลับไปหน้าแรก */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
