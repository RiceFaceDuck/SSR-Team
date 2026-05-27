import React from 'react';
import { STYLES } from '../../config/theme';

export default function PlayerRow({ name = "Player Name", position = "POS", price = "0.0M", trend = "up" }) {
  // ชิ้นส่วนแสดงรายชื่อนักเตะ 1 คนในตลาด
  return (
    <div className={`${STYLES.card} !p-4 flex items-center justify-between`}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-black text-xs border border-slate-200">
          PIC
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">{name}</h3>
          <p className="text-[10px] text-slate-500 font-medium">{position} • Club</p>
        </div>
      </div>
      <div className="text-right flex flex-col items-end">
        <p className="font-black text-base text-indigo-600">{price}</p>
        {trend === 'up' && <span className="text-[9px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-100">↑ ราคาขึ้น</span>}
        {trend === 'down' && <span className="text-[9px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-100">↓ ราคาตก</span>}
      </div>
    </div>
  );
}