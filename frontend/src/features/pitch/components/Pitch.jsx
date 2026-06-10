import React from 'react';
import PlayerNode from './PlayerNode';
import { getFormationData } from '../../../utils/formationUtils';
import { useUserStore } from '../../../store/useUserStore';
import { toast } from '../../../utils/toast';

const Pitch = ({ squad, formation }) => {
  const { setMarketFilterPos } = useUserStore();
  const currentFormation = getFormationData(formation);

  const handleEmptySlotClick = (categoryCode) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 30, 20]); 
    }
    setMarketFilterPos(categoryCode);
    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
    const posNames = { FW: 'กองหน้า', MF: 'กองกลาง', DF: 'กองหลัง', GK: 'ผู้รักษาประตู' };
    toast.info(`กำลังพาไปยังตลาดเพื่อหา ${posNames[categoryCode] || categoryCode}...`);
  };

  const renderRow = (rowConfig) => {
    const { role, category, count } = rowConfig;
    const slots = [];
    
    for (let i = 0; i < count; i++) {
      const slotId = `${role}-${i}`;
      const player = squad.find(p => p.id === slotId);

      slots.push(
        <div 
          key={slotId} 
          onClick={!player ? () => handleEmptySlotClick(category) : undefined}
          className={`relative transition-transform duration-300 ${!player ? 'cursor-pointer hover:scale-110 active:scale-95 opacity-60' : 'cursor-pointer'}`}
        >
          <PlayerNode player={player} expectedPosition={category} />
        </div>
      );
    }

    return (
      <div key={`row-${role}`} className="flex justify-center gap-2 sm:gap-6 w-full px-2 py-2">
        {slots}
      </div>
    );
  };

  // We want to render rows from GK down to FW
  const renderAllRows = () => {
    // formationUtils usually defines rows from FW -> MF -> DF
    // We reverse it and put GK at the top.
    const rows = [...currentFormation.rows].reverse();
    const allRows = [{ role: 'GK', category: 'GK', count: 1 }, ...rows];
    return allRows.map(row => renderRow(row));
  };

  return (
    <div className="relative flex-1 w-full h-full flex flex-col justify-evenly overflow-hidden bg-[#228B22] shadow-[inset_0_0_80px_rgba(0,0,0,0.4)]">
      
      {/* CSS Gradient Pitch Pattern (Underlay) - Horizontal Stripes */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 10%, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.05) 20%)'
        }}
      />
      
      {/* Pitch Lines (Penalty box, half way line) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col items-center justify-between opacity-50">
        {/* Top Penalty Box */}
        <div className="w-[60%] h-[15%] border-b-2 border-x-2 border-white/60 mt-0 flex justify-center items-end pb-2">
           <div className="w-1/3 h-1/2 border-t-2 border-x-2 border-white/60 rounded-t-full"></div>
        </div>
        
        {/* Halfway Line */}
        <div className="w-full border-t-2 border-white/60 relative flex justify-center items-center">
           <div className="w-20 h-20 border-2 border-white/60 rounded-full absolute -top-10 bg-transparent"></div>
        </div>
        
        {/* Bottom Penalty Box */}
        <div className="w-[60%] h-[15%] border-t-2 border-x-2 border-white/60 mb-0 flex justify-center items-start pt-2">
           <div className="w-1/3 h-1/2 border-b-2 border-x-2 border-white/60 rounded-b-full"></div>
        </div>
      </div>

      {/* Player Rows (Overlay) */}
      <div className="relative z-10 flex-1 flex flex-col justify-evenly py-2">
        {renderAllRows()}
      </div>
      
    </div>
  );
};

export default Pitch;
