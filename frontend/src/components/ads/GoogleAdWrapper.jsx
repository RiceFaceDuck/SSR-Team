import React from 'react';
import { useGameStore } from '../../store/useGameStore';

export default function GoogleAdWrapper({ children }) {
  // จำลองการดึงค่า สถานะโฆษณา จาก Store ส่วนกลาง
  const { isNoAdsMode } = useGameStore();

  // ถ้าระบบหลังบ้านสั่งเปิด "No Ads Mode" (บอลกำลังเตะ) ให้ซ่อนโฆษณาทันที
  if (isNoAdsMode) {
    return null;
  }

  return (
    <div className="w-full bg-slate-200 border border-slate-300 rounded-xl p-2 text-center text-xs text-slate-500 my-4 flex items-center justify-center min-h-[60px]">
      {children || 'พื้นที่โฆษณา Google AdSense'}
    </div>
  );
}