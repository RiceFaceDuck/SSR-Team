import React from 'react';

const PlayerStatsBar = ({ stats, isBench }) => {
  // No longer hiding for bench players based on user request

  const goals = stats?.goals || 0;
  const assists = stats?.assists || 0;
  const yellowCards = stats?.yellowCards || 0;
  const redCards = stats?.redCards || 0;

  // If no stats to show, return placeholder to keep alignment
  if (goals === 0 && assists === 0 && yellowCards === 0 && redCards === 0) {
    return <div className="h-3.5 sm:h-4 lg:h-5 w-full mb-[2px]"></div>;
  }

  return (
    <div className="flex flex-row justify-center items-end h-3.5 sm:h-4 lg:h-5 w-full mb-[2px]">
      <div className="flex flex-row justify-center items-end gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-sm border border-slate-300 rounded-t-md px-1.5 py-0.5 shadow-sm min-h-[16px] sm:min-h-[18px]">
        
        {goals > 0 && (
          <div className="flex flex-col items-center justify-end">
            <span className="text-[7px] sm:text-[9px] leading-none opacity-80">⚽</span>
            <span className="text-[6px] sm:text-[8px] font-black text-slate-800 leading-none mt-0.5">{goals}</span>
          </div>
        )}

        {assists > 0 && (
          <div className="flex flex-col items-center justify-end">
            <span className="text-[7px] sm:text-[9px] leading-none opacity-80">👟</span>
            <span className="text-[6px] sm:text-[8px] font-black text-slate-800 leading-none mt-0.5">{assists}</span>
          </div>
        )}

        {yellowCards > 0 && (
          <div className="flex flex-col items-center justify-end">
            <div className="w-1.5 h-2 sm:w-2.5 sm:h-3 bg-yellow-400 border border-yellow-600 rounded-[1px] shadow-sm mt-0.5 mb-0.5"></div>
            <span className="text-[6px] sm:text-[8px] font-black text-slate-800 leading-none">{yellowCards}</span>
          </div>
        )}

        {redCards > 0 && (
          <div className="flex flex-col items-center justify-end">
            <div className="w-1.5 h-2 sm:w-2.5 sm:h-3 bg-red-500 border border-red-700 rounded-[1px] shadow-sm mt-0.5 mb-0.5"></div>
            <span className="text-[6px] sm:text-[8px] font-black text-slate-800 leading-none">{redCards}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlayerStatsBar;
