import React, { useState } from 'react';

const SquadHeader = ({ totalPoints }) => {
  return (
    <div className="flex-shrink-0 w-full px-2 pt-1 pb-1 bg-[#061121] z-10">
      
      <div className="text-center text-[9px] font-semibold text-[#8b9bb4] tracking-widest mb-0.5">
        MY DREAM TEAM - WEEK 1
      </div>

      {/* User Info & Points */}
      <div className="flex justify-between items-center mb-0.5 relative">
        {/* User Info Placeholder */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-[#1e3a8a] border border-[#fbbf24] flex items-center justify-center text-[#fbbf24] text-[10px] font-bold shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            JD
          </div>
          <div className="flex flex-col justify-center leading-tight">
            <span className="font-bold text-white text-xs">John Doe</span>
            <span className="text-[8px] text-[#8b9bb4]">RANK <span className="text-white font-semibold">1,500</span></span>
          </div>
        </div>

        {/* Title Center */}
        <div className="absolute left-1/2 -translate-x-1/2 text-base font-black tracking-widest text-white">
          SQUAD
        </div>

        {/* Total Points */}
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[8px] text-[#8b9bb4]">TOTAL POINTS</span>
          <span className="font-bold text-lg text-[#fbbf24] drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">{totalPoints}</span>
        </div>
      </div>
    </div>
  );
};

export default SquadHeader;
