import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

  React.useEffect(() => {
    // 🌟 ลงชื่อเข้าใช้แบบไม่ระบุตัวตน (Anonymous Login) อัตโนมัติ เพื่อให้ผ่าน Firestore Security Rules
    import('firebase/auth').then(({ signInAnonymously }) => {
      import('./config/firebase').then(({ auth }) => {
        signInAnonymously(auth)
          .then(() => setIsAuthenticated(true))
          .catch((error) => {
            console.error("Auth Error:", error);
            // อนุญาตให้เข้าแอดมินได้แม้จะล็อกอินไม่สำเร็จ แต่เวลาเขียน Database อาจจะ Error
            setIsAuthenticated(true);
          });
      });
    });
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        หน้าจอ Login (จำลอง) - <button onClick={() => setIsAuthenticated(true)} className="ml-4 bg-blue-600 px-4 py-2 rounded">เข้าสู่ระบบ</button>
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
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-500">ระบบทำงานปกติ</span>
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