import React from 'react';

const SynergyIndicator = ({ activeSynergies, highlightedTeam, onTeamClick }) => {
  if (!activeSynergies || activeSynergies.length === 0) return null;

  return (
    <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-1 opacity-90 transition-opacity">
      {activeSynergies.map(syn => {
        const isHighlighted = highlightedTeam === syn.team;
        return (
          <div 
            key={syn.team} 
            onClick={() => onTeamClick(syn.team)}
            className={`
              cursor-pointer backdrop-blur-sm border text-white px-2 py-0.5 rounded-full 
              flex items-center gap-1 shadow-md transform scale-90 origin-top-left transition-all duration-300
              ${isHighlighted 
                ? 'bg-amber-500/90 border-amber-400 scale-100 ring-2 ring-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]' 
                : 'bg-emerald-500/80 border-emerald-400/50 hover:bg-emerald-400/90 hover:scale-95'
              }
            `}
          >
            <span className="text-[10px]">{isHighlighted ? '🔥' : '✨'}</span>
            <span className="text-[10px] font-bold">{syn.team.substring(0, 3).toUpperCase()}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${isHighlighted ? 'bg-amber-700/60' : 'bg-emerald-700/60'}`}>
              {syn.count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SynergyIndicator;
