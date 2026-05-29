import React from 'react';
import { RewardCard } from './RewardCard'; 
import { useRedeemStore } from '../../store/useRedeemStore';
import { useUserStore } from '../../store/useUserStore';

export default function RedeemScreen() {
  // ดึงข้อมูลของรางวัลจาก Store
  const rewards = useRedeemStore((state) => state.rewards);
  // ดึงยอด Balls ⚽ ปัจจุบันของผู้เล่นมาแสดงผล
  const balls = useUserStore((state) => state.balls);

  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">ร้านค้า</h2>
          <p className="text-slate-500 font-medium text-sm">
            นำ <span className="font-bold text-amber-500">Balls ⚽</span> มาแลกรางวัลสุดพิเศษ
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {/* ปุ่มดูประวัติ (เตรียมเชื่อมต่อในขั้นตอนถัดๆ ไป) */}
          <button className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm active:scale-95 transition-transform">
            ประวัติการแลก
          </button>
          
          {/* กล่องแสดงยอด Balls คงเหลือ (Premium UI) */}
          <div className="bg-slate-800 text-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">ยอดคงเหลือ</span>
            <span className="font-black text-amber-400">{balls?.toLocaleString() || 0} ⚽</span>
          </div>
        </div>
      </div>

      {/* Grid แสดงของรางวัล (วนลูปจาก Store ดึงข้อมูลล่าสุดเสมอ) */}
      <div className="grid grid-cols-2 gap-4">
        {rewards.map((reward) => (
          <RewardCard 
            key={reward.id} 
            // ส่งข้อมูลเต็มๆ ไปให้ RewardCard ใช้ในสเต็ปถัดไป
            reward={reward} 
            // Fallback เผื่อ RewardCard ตัวเดิมยังใช้ Props เหล่านี้อยู่
            title={reward.title} 
            cost={reward.cost} 
          />
        ))}
      </div>

    </div>
  );
}