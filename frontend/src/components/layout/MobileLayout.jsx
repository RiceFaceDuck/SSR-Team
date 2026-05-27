import React from 'react';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';
import { STYLES } from '../../config/theme';

export default function MobileLayout({ children, currentPath, onNavigate, onLogout }) {
  return (
    <div className={STYLES.appBg}>
      <div className={STYLES.mobileContainer}>
        
        {/* แถบด้านบน (เพิ่ม onNavigate ส่งเข้าไปเพื่อให้ปุ่มด้านบนกดเปลี่ยนหน้าได้) */}
        <TopHeader onLogout={onLogout} onNavigate={onNavigate} />

        {/* พื้นที่แสดงเนื้อหาตรงกลาง (เนื้อหาจะเปลี่ยนไปตามหน้าที่กด) */}
        <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
          {children}
        </div>

        {/* แถบเมนูด้านล่าง */}
        <BottomNav currentPath={currentPath} onNavigate={onNavigate} />
        
      </div>
    </div>
  );
}