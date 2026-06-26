import React from 'react';
import { STYLES, playSound } from '../../config/theme';

export default function Button({ children, onClick, variant = 'primary', className = '' }) {
  // เลือกสไตล์ปุ่มตามค่า variant ที่ส่งมา (ค่าเริ่มต้นคือ primary)
  const baseStyle = variant === 'primary' ? STYLES.buttonPrimary : STYLES.buttonSecondary;

  // ฟังก์ชันดักจับการคลิก เพื่อให้เล่นเสียงก่อน แล้วค่อยทำงานต่อ
  const handleClick = (e) => {
    playSound('click'); // เรียกใช้ระบบเสียงจากศูนย์บัญชาการ Theme
    if (onClick) onClick(e);
  };

  return (
    <button onClick={handleClick} className={`${baseStyle} ${className}`}>
      {children}
    </button>
  );
}
