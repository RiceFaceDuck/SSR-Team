import React from 'react';
import PlayerNode from './PlayerNode';
import { normalizePosition } from '../../../utils/squadValidator';

export default function PitchBenchArea({ 
  enrichedBench, 
  pendingPlacement, 
  selectedPlayer, 
  manager,
  handleBenchSlotClick, 
  handlePlayerClick,
  onManagerClick 
}) {
  return (
    <div className="h-[100px] sm:h-[120px] lg:h-[135px] py-1 sm:py-2 bg-[#0a192f] border-t-2 border-[#fbbf24] flex items-center justify-evenly px-2 sm:px-6 relative z-10 w-full overflow-x-hidden">
      <div className="absolute top-0 left-0 bg-[#fbbf24] text-[#0a192f] text-[8px] font-bold px-1.5 py-0.5 rounded-br-md z-20">
        BENCH
      </div>
      
      {/* Render 4 Bench Slots */}
      {['GK', 'DF', 'MF', 'FW'].map((pos, index) => {
        const player = enrichedBench[index];
        const isTargetValid = pendingPlacement && normalizePosition(pendingPlacement.position) === pos;
        const highlightClass = isTargetValid ? 'ring-4 ring-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.8)] rounded-md animate-pulse z-30' : '';
        return (
          <div 
            key={`bench-${index}`} 
            className={`scale-95 sm:scale-100 flex-shrink-0 cursor-pointer relative transition-all duration-300 ${highlightClass} ${!player ? 'hover:-translate-y-1' : ''}`}
            onClick={() => {
              if (!player) handleBenchSlotClick(pos);
              else handlePlayerClick(player);
            }}
          >
            <PlayerNode 
              player={player} 
              expectedPosition={player?.position || pos} 
              isSelected={selectedPlayer && selectedPlayer.playerId === String(player?.playerId)}
              isBench={true}
            />
          </div>
        );
      })}

      {/* Divider between Bench and Manager */}
      <div className="h-12 w-px bg-[#1e3a8a] mx-1 sm:mx-2 mt-2 flex-shrink-0"></div>

      {/* Manager Slot (Right side) */}
      {/* Manager Slot (Right side) */}
      <div className="flex-shrink-0 cursor-pointer hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center w-[75px] sm:w-[90px] lg:w-[110px]" onClick={onManagerClick}>
          {manager ? (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-[48px] sm:w-[55px] lg:w-[65px] flex flex-col items-center justify-center scale-95">
                {/* Top part: Image */}
                <div className="relative w-full h-10 sm:h-12 lg:h-14 flex justify-center items-end mb-[1px]">
                  <div className="w-full h-10 sm:h-12 lg:h-14 bg-[#0a192f] rounded-t-md shadow-sm border border-b-0 border-[#3b82f6] overflow-hidden relative flex items-end justify-center">
                    <img src={manager.avatarUrl} alt={manager.name} className="w-full h-full object-cover opacity-90" />
                  </div>
                </div>
                {/* Bottom part: Name */}
                <div className="w-full bg-gradient-to-b from-[#1e3a8a] to-[#0f284e] rounded-b-md shadow-md overflow-hidden flex flex-col z-10 transition-colors border border-[#3b82f6]">
                  <div className="px-1 py-1 flex flex-col justify-center items-center min-h-[16px] sm:min-h-[20px] w-full overflow-hidden">
                    <span className="text-[6px] sm:text-[7px] font-bold text-white text-center leading-none line-clamp-1 w-full">
                      {manager.name}
                    </span>
                  </div>
                </div>
              </div>
              {/* Description (Outside Card) */}
              <div className="mt-1 w-full text-center px-1">
                <span className="text-white text-[6px] sm:text-[7px] lg:text-[8px] font-medium leading-tight line-clamp-2">
                  {manager.description || 'เพิ่มความสามารถทีม'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-[48px] sm:w-[55px] lg:w-[65px] scale-95">
              <PlayerNode player={undefined} expectedPosition="MGR" isBench={true} />
            </div>
          )}
      </div>
    </div>
  );
}
