import React, { useState } from 'react';
import AdminLayout from './components/layout/AdminLayout';
import TimeController from './features/gameweek/TimeController';
import NoAdsToggle from './features/gameweek/NoAdsToggle';

// เปลี่ยนจาก PlayerManager เดิม เป็น PlayerFeature (ระบบใหม่ที่เราเพิ่งสร้างเสร็จ)
import PlayerFeature from './features/players/PlayerFeature'; 

import RedeemLogs from './features/verify/RedeemLogs';
import ThemeController from './features/theme/ThemeController';

export default function App() {
  const [currentPath, setCurrentPath] = useState('gameweek');

  return (
    <AdminLayout currentPath={currentPath} setPath={setCurrentPath}>
      
      {/* 1. เมนูควบคุม Gameweek */}
      {currentPath === 'gameweek' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">ระบบ Gameweek (เวลา)</h2>
            <p className="text-sm text-slate-500">ควบคุมช่วงเวลาเปิด-ปิดตลาด และโหมดปิดโฆษณา</p>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <TimeController />
            <NoAdsToggle />
          </div>
        </div>
      )}

      {/* 2. เมนูจัดการธีม (อัปโหลดรูปลง Google Drive) */}
      {currentPath === 'theme' && (
        <div className="animate-in fade-in duration-300">
          <ThemeController />
        </div>
      )}
      
      {/* 3. เมนูจัดการนักเตะ (ติดตั้งระบบใหม่ที่นี่) */}
      {currentPath === 'players' && (
        <div className="animate-in fade-in duration-300">
          <PlayerFeature />
        </div>
      )}
      
      {/* 4. เมนูจัดการสปอนเซอร์ */}
      {currentPath === 'sponsor' && (
        <div className="animate-in fade-in duration-300">
          <h2 className="text-2xl font-black text-slate-800 mb-1">จัดการสปอนเซอร์ & โฆษณา</h2>
          <p className="text-sm text-slate-500">ตั้งค่าป้ายแบนเนอร์และลิงก์ Affiliate ในหน้าเควส</p>
        </div>
      )}
      
      {/* 5. เมนูตรวจสอบประวัติ */}
      {currentPath === 'database' && (
        <div className="animate-in fade-in duration-300">
          <RedeemLogs />
        </div>
      )}
      
    </AdminLayout>
  );
}