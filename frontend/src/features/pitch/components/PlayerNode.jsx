import React from 'react';
import { Lock } from 'lucide-react';
import EmptyNode from './EmptyNode';
import PlayerStatsBar from './PlayerStatsBar';

/**
 * PlayerNode - Displays an individual player on the pitch.
 * Matches the reference design: White card, player image, name, price, and + button.
 */
const PlayerNode = ({ player, expectedPosition, isSelected, isBench }) => {
  if (!player) return <EmptyNode expectedPosition={expectedPosition} isBench={isBench} />;

  // Mocks for image and team abbreviation
  const playerImage = player.imageUrl || player.fullData?.imageUrl || player.fullData?.image || ('https://ui-avatars.com/api/?background=random&color=fff&name=' + player.name);
  const teamAbbr = player.team || 'UNK';
  const role = player.role || ''; // e.g. (C) or (VC)
  const isCaptain = role === 'C';
  const isViceCaptain = role === 'VC';
  const cardIcon = player.appliedCardIcon;

  return (
    <div className={`flex flex-col items-center justify-end w-[48px] sm:w-[55px] lg:w-[65px] group relative cursor-pointer active-press hover-lift transition-all duration-300 ${isSelected ? '-translate-y-2' : ''}`}>
      
      {/* 🌟 Glowing effect when selected */}
      {isSelected && (
        <div className="absolute inset-0 blur-md rounded-md opacity-60 animate-pulse z-[-1] bg-[#fbbf24]" />
      )}

      {/* Stats Bar */}
      <PlayerStatsBar stats={player.liveStats || player.stats} isBench={isBench} />

      {/* Player Image / Shirt Area (Top part) */}
      <div className="relative w-full h-10 sm:h-12 lg:h-14 flex justify-center items-end mb-[1px]">
        {/* Placeholder for player face / shirt */}
        <div className="w-full h-10 sm:h-12 lg:h-14 bg-white rounded-t-md shadow-sm border border-b-0 border-slate-300 overflow-hidden relative flex items-end justify-center">
          <img src={playerImage} alt={player.name} className="w-full h-full object-cover" />
          
          {/* Captain / Vice Captain Indicator */}
          {(isCaptain || isViceCaptain) && (
            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white/80 backdrop-blur-sm rounded-tr-lg flex items-center justify-center shadow-sm z-10 border-t border-r border-slate-200">
              <span className={`text-[8px] sm:text-[9px] font-black ${isViceCaptain ? 'text-orange-500' : 'text-slate-800'}`}>
                {role}
              </span>
            </div>
          )}

          {/* Lock Indicator */}
          {player.isLocked && (
            <div className="absolute top-1 right-1 z-10 text-white drop-shadow-md">
              <Lock size={12} strokeWidth={3} />
            </div>
          )}

          {/* Gameweek Points Badge */}
          <div className="absolute top-0.5 left-1 flex items-center justify-center z-10">
            <span 
              className="text-[10px] sm:text-[12px] font-black text-[#0f284e]"
              style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0px 2px 3px rgba(0,0,0,0.5)' }}
            >
              {player.displayPoints ?? (player.liveStats?.gwPoints || player.totalPoints || 0)}
            </span>
          </div>

          {/* Equipped Card Icon */}
          {cardIcon && (
            <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-purple-100 rounded-tl-lg flex items-center justify-center border-t border-l border-purple-200 shadow-sm animate-pulse">
              <span className="text-[10px] sm:text-xs">{cardIcon}</span>
            </div>
          )}
        </div>
      </div>

      {/* Info Card (Bottom part) */}
      <div className={`w-full bg-white rounded-b-md shadow-md overflow-hidden flex flex-col z-10 transition-colors ${isSelected ? 'border-2 border-[#fbbf24]' : 'border border-slate-300'}`}>
        
        {/* Name and Team/Role */}
        <div className="bg-white px-1 py-0.5 flex flex-row items-center justify-start min-h-[20px] w-full overflow-hidden">
          {/* Position Badge in Name Panel */}
          <div className="text-[6px] sm:text-[7px] font-black text-slate-700 bg-slate-100 border border-slate-300 px-[2px] py-[1px] rounded shadow-sm mr-1 shrink-0 leading-none">
            {expectedPosition}
          </div>
          <div className="flex flex-col items-start justify-center flex-1 overflow-hidden">
            <span className="text-[8px] sm:text-[9px] font-black text-slate-800 leading-none truncate w-full text-left">
              {player.name.split(' ').pop()}
            </span>
            <span className="text-[6px] sm:text-[7px] font-semibold text-slate-500 leading-none mt-0.5 text-left truncate w-full">
              {teamAbbr.substring(0, 3).toUpperCase()} {role && <span className="font-bold text-slate-800">({role})</span>}
            </span>
          </div>
        </div>

        {/* Price and Plus Button Bar */}
        <div className="bg-[#1e293b] flex justify-between items-center h-3.5 sm:h-4 w-full">
          <span className="text-white text-[7px] sm:text-[8px] font-bold px-0.5 flex-1 text-center">
            {player.price}m
          </span>
          {/* Plus Button inside the card */}
          <div className="bg-[#fbbf24] h-full w-3.5 sm:w-4 flex items-center justify-center border-l border-slate-700 hover:bg-[#f59e0b]">
            <span className="text-[#1e293b] text-[9px] font-black">+</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlayerNode;
