import React from 'react';
import { RewardCard } from './RewardCard'; // แก้ไขเป็น Named Import ให้ชัวร์ครับ

export default function RedeemScreen() {
  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">ร้านค้า</h2>
          <p className="text-slate-500 font-medium text-sm">นำแต้ม Pts มาแลกรางวัล</p>
        </div>
        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
          ประวัติการแลก
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <RewardCard title="หูฟัง Bluetooth Xiaomi" cost="15,000" />
        <RewardCard title="การ์ด: กัปตันจอมแบก" cost="2,500" />
        <RewardCard title="เสื้อบอลลิขสิทธิ์แท้" cost="25,000" />
        <RewardCard title="การ์ด: กำแพงเมืองจีน" cost="1,500" />
      </div>
    </div>
  );
}