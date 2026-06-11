import React from 'react';

/**
 * PlayerNode - Displays an individual player on the pitch.
 * Matches the reference design: White card, player image, name, price, and + button.
 */
const PlayerNode = ({ player, expectedPosition, isSelected, isBench }) => {
  if (!player) return <EmptyNode expectedPosition={expectedPosition} isBench={isBench} />;

  // Mocks for image and team abbreviation
  const playerImage = player.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`;
  const teamAbbr = player.team || 'UNK';
  const role = player.role || ''; // e.g. (C)
  const isCaptain = role === 'C';
  const cardIcon = player.appliedCardIcon;

  return (
    <div className={`flex flex-col items-center justify-end w-[55px] sm:w-[65px] group relative cursor-pointer active:scale-95 transition-all duration-300 ${isSelected ? '-translate-y-2' : ''}`}>
      
      {/* 🌟 Glowing effect when selected or captain */}
      {(isSelected || isCaptain) && (
        <div className={`absolute inset-0 blur-md rounded-md opacity-60 animate-pulse z-[-1] ${isCaptain ? 'bg-[#f59e0b]' : 'bg-[#fbbf24]'}`} />
      )}
      
      {/* 🌟 Captain Crown Badge (Outstanding UI) */}
      {isCaptain && (
        <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="bg-gradient-to-b from-[#fbbf24] to-[#d97706] p-1 sm:p-1.5 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)] border border-white">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Player Image / Shirt Area (Top part) */}
      <div className="relative w-full h-7 sm:h-8 flex justify-center items-end mb-0.5">
        {/* Placeholder for player face / shirt */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-t-md shadow-sm border border-b-0 border-slate-300 overflow-hidden relative flex items-end justify-center">
          <img src={playerImage} alt={player.name} className="w-full h-full object-cover" />
          
          {/* Team Logo Badge (Top Left) */}
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center text-[6px] font-bold">
            {teamAbbr.substring(0, 1)}
          </div>

          {/* Position Text (Top Right) */}
          <div className="absolute top-0.5 right-0.5 text-[7px] font-black text-slate-700 bg-white/80 px-0.5 rounded shadow-sm">
            {expectedPosition}
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
      <div className={`w-full bg-white rounded-b-md shadow-md overflow-hidden flex flex-col z-10 transition-colors ${isSelected ? 'border-2 border-[#fbbf24]' : isCaptain ? 'border-2 border-[#d97706]' : 'border border-slate-300'}`}>
        
        {/* Name and Team/Role */}
        <div className="bg-white px-0.5 py-0.5 text-center flex flex-col items-center justify-center min-h-[18px]">
          <span className="text-[8px] sm:text-[9px] font-black text-slate-800 leading-none truncate w-full text-center">
            {player.name.split(' ').pop()}
          </span>
          <span className="text-[6px] sm:text-[7px] font-semibold text-slate-500 leading-none mt-0.5">
            {teamAbbr.substring(0, 3).toUpperCase()} {role && <span className="font-bold text-slate-800">({role})</span>}
          </span>
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
    <div className="flex flex-col items-center justify-end w-[55px] sm:w-[65px] cursor-pointer transition-all duration-300 group">
      
      {/* Top Part (Shirt Area) matching PlayerNode exactly */}
      <div className="relative w-full h-7 sm:h-8 flex justify-center items-end mb-0.5">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${topGradient} rounded-t-md border border-b-0 ${borderClass} shadow-inner flex flex-col items-center justify-center overflow-hidden group-hover:border-[#fbbf24] transition-colors relative`}>
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
          
          <span className="text-[#fbbf24] text-xl font-black drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] group-hover:scale-125 transition-transform duration-300 z-10">
            +
          </span>
          
          {/* Position Badge */}
          <div className="absolute top-0.5 right-0.5 text-[6px] font-black text-[#0a192f] bg-[#fbbf24] px-0.5 rounded shadow-sm z-10 leading-none">
            {expectedPosition}
          </div>
        </div>
      </div>

      {/* Bottom Part (Info Card) matching PlayerNode exactly */}
      <div className={`w-full bg-gradient-to-b ${bottomGradient} rounded-b-md shadow-md overflow-hidden flex flex-col z-10 transition-colors border ${borderClass} group-hover:border-[#fbbf24]`}>
        <div className="px-0.5 py-0.5 text-center flex flex-col items-center justify-center min-h-[18px]">
          <span className="text-[7px] sm:text-[8px] font-bold text-[#60a5fa] tracking-wider group-hover:text-white transition-colors leading-none">
            ADD PLAYER
          </span>
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

export default PlayerNode;
