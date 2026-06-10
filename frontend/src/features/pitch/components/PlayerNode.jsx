import React from 'react';

/**
 * PlayerNode - Displays an individual player on the pitch.
 * Matches the reference design: White card, player image, name, price, and + button.
 */
const PlayerNode = ({ player, expectedPosition }) => {
  if (!player) return <EmptyNode expectedPosition={expectedPosition} />;

  // Mocks for image and team abbreviation
  const playerImage = player.imageUrl || 'https://ui-avatars.com/api/?background=random&color=fff&name=' + player.name;
  const teamAbbr = player.team || 'UNK';
  const role = player.role || ''; // e.g. (C)

  return (
    <div className="flex flex-col items-center justify-end w-[45px] sm:w-[50px] group relative cursor-pointer active:scale-95 transition-transform">
      
      {/* Player Image / Shirt Area (Top part) */}
      <div className="relative w-full h-6 flex justify-center items-end mb-0.5">
        {/* Placeholder for player face / shirt */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-t-md shadow-sm border border-b-0 border-slate-300 overflow-hidden relative flex items-end justify-center">
          <img src={playerImage} alt={player.name} className="w-full h-full object-cover" />
          
          {/* Team Logo Badge (Top Left) */}
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-slate-200 rounded-full border border-slate-300 flex items-center justify-center text-[6px] font-bold">
            {teamAbbr.substring(0, 1)}
          </div>

          {/* Position Text (Top Right) */}
          <div className="absolute top-0.5 right-0.5 text-[7px] font-black text-slate-700 bg-white/80 px-0.5 rounded">
            {expectedPosition}
          </div>
        </div>
      </div>

      {/* Info Card (Bottom part) */}
      <div className="w-full bg-white rounded-b-md shadow-md border border-slate-300 overflow-hidden flex flex-col z-10">
        
        {/* Name and Team/Role */}
        <div className="bg-white px-0.5 py-0.5 text-center flex flex-col items-center justify-center min-h-[16px]">
          <span className="text-[7px] sm:text-[8px] font-black text-slate-800 leading-none truncate w-full text-center">
            {player.name.split(' ').pop()}
          </span>
          <span className="text-[5px] sm:text-[6px] font-semibold text-slate-500 leading-none mt-0.5">
            {teamAbbr} {role && <span className="font-bold text-slate-800">({role})</span>}
          </span>
        </div>

        {/* Price and Plus Button Bar */}
        <div className="bg-[#1e293b] flex justify-between items-center h-3 w-full">
          <span className="text-white text-[6px] font-bold px-0.5 flex-1 text-center">
            £{player.price}m
          </span>
          {/* Plus Button inside the card */}
          <div className="bg-[#fbbf24] h-full w-3 flex items-center justify-center border-l border-slate-700 hover:bg-[#f59e0b]">
            <span className="text-[#1e293b] text-[8px] font-black">+</span>
          </div>
        </div>

      </div>
    </div>
  );
};

const EmptyNode = ({ expectedPosition }) => (
  <div className="flex flex-col items-center justify-end w-[45px] sm:w-[50px] cursor-pointer opacity-80 hover:opacity-100 active:scale-95 transition-all">
    
    {/* Empty Image Placeholder */}
    <div className="relative w-full h-6 flex justify-center items-end mb-0.5">
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-200/50 backdrop-blur-sm rounded-t-md border border-b-0 border-dashed border-[#fbbf24] flex items-center justify-center">
        {/* Mock empty shirt */}
        <div className="w-4 h-4 border-2 border-dashed border-[#fbbf24] rounded-t-sm opacity-50"></div>
        <div className="absolute top-0 right-0 text-[5px] font-black text-white bg-black/40 px-0.5 rounded">
          {expectedPosition}
        </div>
      </div>
    </div>

    {/* Empty Card */}
    <div className="w-full bg-white/90 backdrop-blur-sm rounded-b-md shadow-md border border-slate-300 overflow-hidden flex flex-col z-10">
      <div className="bg-white/90 px-0.5 py-0.5 text-center flex flex-col items-center justify-center min-h-[16px]">
        <span className="text-[7px] font-black text-slate-400">
          ว่าง
        </span>
      </div>
      <div className="bg-[#1e293b] flex justify-between items-center h-3 w-full">
        <span className="text-[#fbbf24] text-[6px] font-bold px-0.5 flex-1 text-center leading-none">
          + Add
        </span>
      </div>
    </div>
    
  </div>
);

export default PlayerNode;
