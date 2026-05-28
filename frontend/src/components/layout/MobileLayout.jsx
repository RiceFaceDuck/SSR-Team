import React from 'react';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';
import { STYLES } from '../../config/theme';

export default function MobileLayout({ children, currentPath, onNavigate, onLogout }) {
  // 🌟 ลบโค้ดผูกมัดกับ Drag & Drop ออกทั้งหมด Layout กลับมาเบาหวิวอีกครั้ง

  return (
    <div className={STYLES.appBg}>
      <div className={STYLES.mobileContainer}>
        
        {/* แถบด้านบน */}
        <TopHeader onLogout={onLogout} onNavigate={onNavigate} />

        {/* พื้นที่แสดงเนื้อหาตรงกลาง */}
        <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
          {children}
        </div>

        {/* แถบเมนูด้านล่าง */}
        <BottomNav currentPath={currentPath} onNavigate={onNavigate} />
        
      </div>
    </div>
  );
}