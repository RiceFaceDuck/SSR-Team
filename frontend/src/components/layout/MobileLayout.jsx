import React, { useEffect } from 'react';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';
import { STYLES } from '../../config/theme';

// นำเข้า Store สำหรับเช็คสถานะการลาก (Drag & Drop)
import { useDragStore } from '../../store/useDragStore';

export default function MobileLayout({ children, currentPath, onNavigate, onLogout }) {
  // ดึงสถานะว่ากำลังลากนักเตะอยู่หรือไม่
  const isDragging = useDragStore((state) => state.isDragging);

  // ระบบ Auto-Switch: สลับหน้าจออัตโนมัติเมื่อเริ่มลากนักเตะ
  useEffect(() => {
    // ถ้าเริ่มลากแล้ว และยังไม่ได้อยู่หน้า 'pitch' (สนาม) ให้สลับหน้าทันที
    if (isDragging && currentPath !== 'pitch') {
      onNavigate('pitch');
    }
  }, [isDragging, currentPath, onNavigate]);

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