import React from 'react';
import PlayerSlot from './PlayerSlot';

export default function BenchArea() {
  return (
    <div className="mt-4 bg-white/50 backdrop-blur-md rounded-3xl p-4 border border-slate-200">
      <h4 className="text-xs font-bold text-slate-500 text-center mb-3 uppercase tracking-wider">ผู้เล่นสำรอง (Bench)</h4>
      <div className="flex justify-around items-center">
        {/* พื้นที่สำหรับนักเตะสำรอง 5 คน + โค้ช */}
        <PlayerSlot position="GK" />
        <PlayerSlot position="DEF" />
        <PlayerSlot position="MID" />
        <PlayerSlot position="FWD" />
        <div className="w-1 h-8 bg-slate-300 rounded-full mx-1"></div>
        <PlayerSlot position="MGR" />
      </div>
    </div>
  );
}