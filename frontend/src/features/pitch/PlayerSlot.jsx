import React from 'react';

export default function PlayerSlot({ position, player, onClick }) {
  // ชิ้นส่วนนี้คือ "นักเตะ 1 คนบนสนาม"
  // อนาคตจะใส่ Logic การลาก-วาง (Drag & Drop) ไว้ที่ไฟล์นี้

  return (
    <button 
      onClick={onClick}
      className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border-2 border-dashed border-slate-400 flex flex-col items-center justify-center hover:scale-110 hover:border-indigo-500 transition-transform relative"
    >
      {player ? (
        <span className="text-xs font-bold text-slate-800">{player.name}</span>
      ) : (
        <span className="text-xl text-slate-400 leading-none">+</span>
      )}
      <div className="absolute -bottom-2 bg-slate-800 text-white text-[9px] px-2 rounded-full font-bold shadow-sm">
        {position}
      </div>
    </button>
  );
}