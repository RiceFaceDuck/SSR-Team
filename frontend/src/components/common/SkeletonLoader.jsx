/**
 * @file SkeletonLoader.jsx
 * @description UI Component สำหรับแสดงโครงกระดูกแอนิเมชันระหว่างรอโหลดข้อมูล (Loading State)
 * ช่วยยกระดับ UX ให้ดูพรีเมียม สบายตา และลดความหงุดหงิดของผู้เล่นเมื่ออินเทอร์เน็ตช้า
 */

import React from 'react';

/**
 * @param {string} type - รูปแบบของ Skeleton ('row' สำหรับแถวรายชื่อในตลาด, 'slot' สำหรับช่องในสนาม)
 * @param {number} count - จำนวน Skeleton ที่ต้องการให้แสดงผล
 */
export default function SkeletonLoader({ type = 'row', count = 3 }) {
  // สร้าง Array เปล่าตามจำนวน count เพื่อนำไปวนลูปแสดงผล
  const skeletons = Array.from({ length: count }, (_, index) => index);

  // รูปแบบที่ 1: แถวรายชื่อนักเตะ (Market Player Row)
  if (type === 'row') {
    return (
      <div className="space-y-3 w-full">
        {skeletons.map((key) => (
          <div 
            key={key} 
            className="bg-white p-4 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {/* รูปโปรไฟล์จำลอง (Avatar) */}
              <div className="w-10 h-10 bg-slate-200/70 rounded-full animate-pulse shrink-0"></div>
              
              {/* ชื่อและตำแหน่งจำลอง (Text) */}
              <div className="space-y-2.5">
                <div className="h-3.5 bg-slate-200/80 rounded-md animate-pulse w-28"></div>
                <div className="h-2.5 bg-slate-100 rounded-md animate-pulse w-16"></div>
              </div>
            </div>
            
            {/* ราคาและปุ่มจำลอง (Price & Button) */}
            <div className="flex flex-col items-end gap-2.5">
              <div className="h-4 bg-slate-200/80 rounded-md animate-pulse w-14"></div>
              <div className="h-5 bg-slate-100 rounded-full animate-pulse w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // รูปแบบที่ 2: ช่องใส่นักเตะบนสนาม (Pitch Player Slot)
  if (type === 'slot') {
    return (
      <div className="flex justify-around w-full z-10 px-2 gap-2">
        {skeletons.map((key) => (
          <div 
            key={key} 
            className="w-14 h-14 bg-white/40 backdrop-blur-sm rounded-full shadow-md border-2 border-slate-200/50 flex flex-col items-center justify-center animate-pulse"
          >
            <div className="w-6 h-6 bg-slate-300/50 rounded-full mb-1"></div>
            <div className="w-8 h-2 bg-slate-300/50 rounded-sm"></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}