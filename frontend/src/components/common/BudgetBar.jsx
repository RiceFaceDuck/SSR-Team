/**
 * @file BudgetBar.jsx
 * @description UI Component สำหรับแสดงหลอดงบประมาณ (Budget Bar) ที่เหลืออยู่ของผู้เล่น
 * เชื่อมต่อกับ Global State ทันที และมีระบบเปลี่ยนสีตามสัดส่วนเงินที่เหลือเพื่อเตือนผู้เล่น
 */

import React from 'react';
import { Wallet } from 'lucide-react';

// แก้ไข Path ให้ถูกต้อง (ถอยกลับ 2 ขั้นเพื่อไปหา src/store)
import { useUserStore } from '../../store/useUserStore';

export default function BudgetBar() {
  // ดึงค่าเงินที่เหลือจาก Store ส่วนกลาง
  const budgetLeft = useUserStore((state) => state.budgetLeft);
  
  // สมมติว่าทุนเริ่มต้นคือ 100.0M เพื่อนำมาหาเปอร์เซ็นต์ความยาวของหลอด
  const MAX_BUDGET = 100.0;
  
  // คำนวณเปอร์เซ็นต์ (จำกัดช่วงให้อยู่ระหว่าง 0 ถึง 100)
  const percentage = Math.max(0, Math.min(100, (budgetLeft / MAX_BUDGET) * 100));

  // กำหนดสีของหลอดตามจำนวนเงินที่เหลือ (Premium Feedback)
  let barColor = 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-indigo-400/50';
  let textColor = 'text-indigo-600';
  let iconBg = 'bg-indigo-50';

  if (percentage <= 15) {
    // เงินเหลือน้อยมาก (ต้ำกว่า 15%) - สีแดงเตือนภัย
    barColor = 'bg-gradient-to-r from-rose-400 to-red-500 shadow-red-400/50';
    textColor = 'text-red-600';
    iconBg = 'bg-red-50';
  } else if (percentage <= 40) {
    // เงินเหลือปานกลาง (ต่ำกว่า 40%) - สีส้มระวัง
    barColor = 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-400/50';
    textColor = 'text-orange-600';
    iconBg = 'bg-orange-50';
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 w-full mb-5">
      <div className="flex justify-between items-end mb-3">
        <div className="flex items-center gap-2.5">
          {/* ไอคอนกระเป๋าเงิน */}
          <div className={`p-2 rounded-xl ${iconBg} ${textColor} transition-colors duration-500`}>
            <Wallet size={18} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              งบประมาณคงเหลือ
            </span>
            <span className={`text-xl font-black ${textColor} leading-none transition-colors duration-500`}>
              £{budgetLeft.toFixed(1)}m
            </span>
          </div>
        </div>
        
        {/* ข้อความกำกับสัดส่วน */}
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      
      {/* โครงสร้างหลอด Progress Bar */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
        {/* แอนิเมชันของหลอดที่วิ่งตามเปอร์เซ็นต์จริง */}
        <div 
          className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${barColor}`}
          style={{ width: `${percentage}%` }}
        >
          {/* เอฟเฟกต์แสงสะท้อน (Shimmer Overlay) ให้ดูมีความเป็นเกมพรีเมียม */}
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full opacity-50 mix-blend-overlay"></div>
        </div>
      </div>
    </div>
  );
}