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
    <div className="h-[105px] sm:h-[120px] pb-2 bg-[#0a192f] border-t-2 border-[#fbbf24] flex items-center justify-evenly px-2 sm:px-6 relative z-10 w-full overflow-x-hidden">
      <div className="absolute top-0 left-0 bg-[#fbbf24] text-[#0a192f] text-[8px] font-bold px-1.5 py-0.5 rounded-br-md z-20">
        BENCH
      </div>
      
      {/* Render 4 Bench Slots */}
      {['GK', 'DF', 'MF', 'FW'].map((pos, index) => {
        const player = enrichedBench[index];
        const isTargetValid = pendingPlacement && normalizePosition(pendingPlacement.position) === pos;
        const highlightClass = isTargetValid && !player ? 'ring-4 ring-[#fbbf24] shadow-[0_0_25px_rgba(251,191,36,1)] rounded-md animate-pulse z-30 scale-110' : '';
        return (
          <div 
            key={`bench-${index}`} 
            className={`mt-2 scale-95 sm:scale-100 flex-shrink-0 cursor-pointer relative transition-all duration-300 ${highlightClass} ${!player ? 'hover:-translate-y-1' : ''}`}
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
      <div className="mt-2 scale-95 sm:scale-100 flex-shrink-0 relative cursor-pointer hover:-translate-y-1 transition-all duration-300" onClick={onManagerClick}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[6px] font-bold px-1 rounded-sm whitespace-nowrap z-20 shadow-md">
            MANAGER
          </div>
          {manager ? (
            <div className="w-[45px] h-[60px] sm:w-[50px] sm:h-[65px] bg-[#0a192f] border-2 border-[#3b82f6] rounded-md shadow-[0_0_15px_rgba(59,130,246,0.5)] overflow-hidden flex flex-col items-center justify-center relative">
               <img src={manager.avatarUrl} alt={manager.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
               <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-1 text-center">
                 <span className="text-[7px] font-bold text-white leading-none line-clamp-1">{manager.name}</span>
               </div>
            </div>
          ) : (
            <PlayerNode player={undefined} expectedPosition="MGR" isBench={true} />
          )}
      </div>
    </div>
  );
}
