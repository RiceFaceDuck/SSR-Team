import React, { useState } from 'react';

const FormationSelector = ({ manager, formation, onChangeFormation }) => {
  const [isFormationOpen, setIsFormationOpen] = useState(false);

  const formationsList = manager?.effectLogic?.type === 'UNLOCK_FORMATION' && Array.isArray(manager.effectLogic.formations)
    ? ['4-3-3', '4-4-2', '3-5-2', '3-4-3', '4-5-1', '5-3-2', '5-4-1', ...manager.effectLogic.formations]
    : ['4-3-3', '4-4-2', '3-5-2', '3-4-3', '4-5-1', '5-3-2', '5-4-1'];

  return (
    <div className="absolute bottom-[125px] sm:bottom-[145px] lg:bottom-[160px] right-2 z-30">
      <button 
        onClick={() => setIsFormationOpen(!isFormationOpen)}
        className="bg-[#fbbf24] hover:bg-[#f59e0b] text-[#0a192f] transition-colors rounded-md px-2 py-0.5 flex flex-col items-center shadow-lg active:scale-95 cursor-pointer border border-[#b45309]/30"
      >
        <span className="text-[7px] font-bold tracking-wider opacity-80 leading-none mt-0.5">FORMATION</span>
        <span className="text-[10px] font-black flex items-center gap-1 leading-none mb-0.5">
          Currently: {formation || '4-4-2'}
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </span>
      </button>

      {isFormationOpen && (
        <div className="absolute bottom-full right-0 mb-1 bg-[#0f284e] border border-[#1e3a8a] rounded-md shadow-2xl overflow-hidden w-28 animate-in fade-in zoom-in-95 duration-150 z-40">
          {formationsList.map((f) => (
            <button
              key={f}
              onClick={() => {
                onChangeFormation(f);
                setIsFormationOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-[#1e3a8a] ${formation === f ? 'text-[#fbbf24] font-bold bg-[#14325e]' : 'text-white'}`}
            >
              {f} {formation === f && '✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormationSelector;
