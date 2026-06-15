import React from 'react';

const EmptyNode = ({ expectedPosition, isBench }) => {
  const topGradient = isBench 
    ? 'from-[#334155] to-[#1e293b]' 
    : 'from-[#0f284e] to-[#0a192f]';
  const bottomGradient = isBench 
    ? 'from-[#1e293b] to-[#0f172a]' 
    : 'from-[#1e3a8a] to-[#0f284e]';
  const borderClass = isBench 
    ? 'border-[#475569]' 
    : 'border-[#3b82f6]/40';

  return (
    <div className="flex flex-col items-center justify-end w-[48px] sm:w-[55px] lg:w-[65px] cursor-pointer transition-all duration-300 group">
      
      {/* Top Part (Shirt Area) matching PlayerNode exactly */}
      <div className="relative w-full h-10 sm:h-12 lg:h-14 flex justify-center items-end mb-[1px]">
        <div className={`w-full h-10 sm:h-12 lg:h-14 bg-gradient-to-br ${topGradient} rounded-t-md border border-b-0 ${borderClass} shadow-inner flex flex-col items-center justify-center overflow-hidden group-hover:border-[#fbbf24] transition-colors relative`}>
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
          
          <span className="text-[#fbbf24] text-xl font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] group-hover:scale-125 transition-transform duration-300 z-10">
            +
          </span>
          
        </div>
      </div>

      {/* Bottom Part (Info Card) matching PlayerNode exactly */}
      <div className={`w-full bg-gradient-to-b ${bottomGradient} rounded-b-md shadow-md overflow-hidden flex flex-col z-10 transition-colors border ${borderClass} group-hover:border-[#fbbf24]`}>
        <div className="px-1 py-0.5 flex flex-row items-center justify-start min-h-[20px] w-full overflow-hidden">
          {/* Position Badge in Name Panel */}
          <div className="text-[6px] sm:text-[7px] font-black text-[#0a192f] bg-[#fbbf24] px-[2px] py-[1px] rounded shadow-sm mr-1 shrink-0 leading-none">
            {expectedPosition}
          </div>
          <div className="flex flex-col items-start justify-center flex-1 overflow-hidden">
            <span className="text-[7px] sm:text-[8px] font-bold text-[#60a5fa] tracking-wider group-hover:text-white transition-colors leading-none truncate w-full text-left">
              {expectedPosition === 'MGR' ? 'ADD MANAGER' : 'ADD PLAYER'}
            </span>
          </div>
        </div>
        <div className={`flex justify-center items-center h-3.5 sm:h-4 w-full border-t ${borderClass}`}>
          <span className="text-[#fbbf24] text-[6px] sm:text-[7px] font-bold px-0.5 text-center leading-none opacity-80">
            TAP TO SELECT
          </span>
        </div>
      </div>

    </div>
  );
};

export default EmptyNode;
