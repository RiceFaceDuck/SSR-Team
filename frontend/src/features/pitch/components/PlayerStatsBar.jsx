import React from 'react';

const PlayerStatsBar = ({ stats, isBench }) => {
  // Hide stats for bench players, but keep the space to align with other nodes
  if (isBench) {
    return <div className="h-4 sm:h-5 w-full"></div>;
  }

  if (!stats) return <div className="h-4 sm:h-5 w-full"></div>;

  const { goals = 0, assists = 0, yellowCards = 0, redCards = 0 } = stats;
  
  // Only show if at least one stat is > 0
  if (goals === 0 && assists === 0 && yellowCards === 0 && redCards === 0) {
    return <div className="h-4 sm:h-5 w-full"></div>; // Placeholder to keep height consistent
  }

  return (
    <div className="flex flex-row justify-center items-end h-4 sm:h-5 w-full mb-[2px]">
      <div className="flex flex-row justify-center items-end gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-300 rounded-t-md px-1.5 py-0.5 shadow-sm min-h-[18px]">
        {goals > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[10px] leading-none">⚽</span>
            <span className="text-[7px] sm:text-[8px] font-bold text-slate-800 leading-none mt-[1px]">{goals}</span>
          </div>
        )}
        {assists > 0 && (
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[10px] leading-none">👟</span>
            <span className="text-[7px] sm:text-[8px] font-bold text-slate-800 leading-none mt-[1px]">{assists}</span>
          </div>
        )}
        {yellowCards > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-2 h-2.5 sm:w-2.5 sm:h-3 bg-yellow-400 border border-yellow-600 rounded-[1px] shadow-sm mt-0.5"></div>
            <span className="text-[7px] sm:text-[8px] font-bold text-slate-800 leading-none mt-[1px]">{yellowCards}</span>
          </div>
        )}
        {redCards > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-2 h-2.5 sm:w-2.5 sm:h-3 bg-red-500 border border-red-700 rounded-[1px] shadow-sm mt-0.5"></div>
            <span className="text-[7px] sm:text-[8px] font-bold text-slate-800 leading-none mt-[1px]">{redCards}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerStatsBar;
