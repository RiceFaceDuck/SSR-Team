import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import QuestManager from './features/quests/QuestManager'; // 🌟 NEW: นำเข้าไฟล์หน้าจัดการของจริงมาแล้ว!

// MOCK COMPONENTS สำหรับหน้าอื่นๆ ที่ยังไม่ได้ทำ
const DashboardScreen = () => (
  <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
    <h2 className="text-2xl font-bold text-slate-800 mb-2">แดชบอร์ดสรุปผล</h2>
    <p className="text-slate-500">ยินดีต้อนรับสู่ระบบจัดการหลังบ้าน</p>
  </div>
);

export default function App() {
  // สมมติฐานว่าแอดมินล็อกอินแล้ว
  const [isAuthenticated, setIsAuthenticated] = useState(true);

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
                
                {/* 🌟 UPDATED: เรียกใช้ QuestManager ของจริงแทนหน้า Mock */}
                <Route path="/quests" element={<QuestManager />} />
                
                {/* Route จำลองอื่นๆ ป้องกัน Error */}
                <Route path="/users" element={<div className="p-8 bg-white rounded-3xl shadow-sm">กำลังพัฒนา: จัดการผู้ใช้งาน</div>} />
                <Route path="/players" element={<div className="p-8 bg-white rounded-3xl shadow-sm">กำลังพัฒนา: ฐานข้อมูลนักเตะ</div>} />
                <Route path="/matches" element={<div className="p-8 bg-white rounded-3xl shadow-sm">กำลังพัฒนา: จัดการแข่งขัน</div>} />
                <Route path="/settings" element={<div className="p-8 bg-white rounded-3xl shadow-sm">กำลังพัฒนา: ตั้งค่าระบบ</div>} />
                
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