import React from 'react';

const PopupStats = ({ player }) => {
  return (
    <div className="flex border-y border-slate-200 bg-slate-50">
      <div className="flex-1 p-2 text-center border-r border-slate-200">
        <p className="text-[9px] font-bold text-slate-500 mb-0.5">ราคา (PRICE)</p>
        <p className="text-sm font-black text-slate-800">{player.price}m</p>
      </div>
      <div className="flex-1 p-2 text-center">
        <p className="text-[9px] font-bold text-slate-500 mb-0.5">คะแนน (POINTS)</p>
        <p className="text-sm font-black text-amber-500">{player.totalPoints || 0}</p>
      </div>
    </div>
  );
};

export default PopupStats;
