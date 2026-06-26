/**
 * @file PositionBadge.jsx
 * @description UI Component สำหรับแสดงป้ายกำกับตำแหน่งนักเตะ (FW, MF, DF, GK)
 * ออกแบบสไตล์พรีเมียม โทนสว่าง (Pastel) โค้งมน เพื่อนำไปใช้ซ้ำทั้งในหน้าตลาดและหน้าจัดทีม
 */

import React from 'react';

export default function PositionBadge({ position = 'UK', className = '' }) {
  // กำหนดสไตล์เริ่มต้นสำหรับกรณีไม่ทราบตำแหน่ง (Unknown)
  let badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200 shadow-slate-100/50';

  // สลับสีพาสเทลตามตำแหน่งของนักเตะ (เน้นความสบายตาและพรีเมียม)
  switch (position.toUpperCase()) {
    case 'FW': // กองหน้า
      badgeStyle = 'bg-rose-100 text-rose-700 border-rose-200 shadow-rose-100/50';
      break;
    case 'MF': // กองกลาง
      badgeStyle = 'bg-blue-100 text-blue-700 border-blue-200 shadow-blue-100/50';
      break;
    case 'DF': // กองหลัง
      badgeStyle = 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-emerald-100/50';
      break;
    case 'GK': // ผู้รักษาประตู
      badgeStyle = 'bg-amber-100 text-amber-700 border-amber-200 shadow-amber-100/50';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md border shadow-sm ${badgeStyle} ${className}`}
    >
      {position}
    </span>
  );
}
