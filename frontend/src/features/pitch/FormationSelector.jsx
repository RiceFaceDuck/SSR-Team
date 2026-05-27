import React from 'react';

export default function FormationSelector() {
  return (
    <div className="bg-white/80 p-3 rounded-2xl shadow-sm border border-slate-100 mb-4 flex justify-between items-center backdrop-blur-md">
      <div>
        <h4 className="font-bold text-sm text-slate-800">แผนการเล่น (Formation)</h4>
        <p className="text-[10px] text-slate-500 font-medium">เลือกรูปแบบการจัดตำแหน่งผู้เล่น</p>
      </div>
      <select className="bg-slate-100 text-indigo-700 text-sm rounded-xl px-4 py-2 font-black outline-none border-2 border-transparent hover:border-indigo-100 transition-colors cursor-pointer appearance-none shadow-inner">
        <option value="4-4-2">4-4-2</option>
        <option value="4-3-3">4-3-3 (Attacking)</option>
        <option value="3-5-2">3-5-2</option>
      </select>
    </div>
  );
}