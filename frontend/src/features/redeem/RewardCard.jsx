import React from 'react';
import { STYLES } from '../../config/theme';

// ใช้ Named Export คู่กับ Default Export เพื่อป้องกันปัญหา import ไม่เจอ
export function RewardCard({ title, cost, imageSlot }) {
  // การ์ดแสดงของรางวัลในหน้าร้านค้า
  return (
    <div className={`${STYLES.card} flex flex-col h-full`}>
      <div className="w-full h-32 bg-slate-50 rounded-2xl mb-4 border border-slate-100 flex items-center justify-center text-slate-300">
        {imageSlot || 'รูปของรางวัล'}
      </div>
      <h3 className="font-bold text-slate-800 text-sm leading-tight flex-1">{title}</h3>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-black text-indigo-600">{cost} Pts</span>
        <button className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors">
          แลกรางวัล
        </button>
      </div>
    </div>
  );
}

export default RewardCard;