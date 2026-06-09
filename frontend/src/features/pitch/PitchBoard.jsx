import React, { useEffect } from 'react';
import PlayerSlot from './PlayerSlot'; 
import PitchFieldUI from './PitchFieldUI';
import { useUserStore } from '../../store/useUserStore';
import { useMarketStore } from '../../store/useMarketStore';
import { getFormationData } from '../../utils/formationUtils';
import { normalizePosition } from '../../utils/squadValidator';
import { toast } from '../../utils/toast';

export default function PitchBoard({ onSlotClick }) {
  const { 
    mySquad, 
    formation, 
    pendingPlacement, 
    confirmPlacement,
    setMarketFilterPos 
  } = useUserStore();

  const { players: marketPlayers, fetchMarketPlayers, isDataFetched } = useMarketStore();

  useEffect(() => {
    if (!isDataFetched) {
      fetchMarketPlayers();
    }
  }, [isDataFetched, fetchMarketPlayers]);

  const currentFormation = getFormationData(formation);

  const enrichPlayerData = (squadPlayer) => {
    if (!squadPlayer) return null;
    const fullData = marketPlayers.find(p => String(p.sku) === String(squadPlayer.playerId));
    return {
      ...squadPlayer,
      sku: fullData?.sku || squadPlayer.playerId,
      name: fullData?.name || fullData?.fullName || 'Unknown',
      imageUrl: fullData?.imageUrl || fullData?.image || fullData?.photoURL || null,
      price: fullData?.price || 0,
      stats: fullData?.stats || {}
    };
  };

  const handleSlotClick = (slotId, categoryCode, existingPlayer) => {
    if (pendingPlacement) {
      const targetPos = categoryCode; 
      const pendingPos = normalizePosition(pendingPlacement.position); 

      if (targetPos !== pendingPos) {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([50, 100, 50]);
        }
        toast.error(`วางไม่ได้! ${pendingPlacement.name} เล่นในตำแหน่ง ${pendingPos} เท่านั้น`);
        return;
      }

      const result = confirmPlacement(slotId);
      if (result && result.success) {
        toast.success(result.message);
      } else if (result) {
        toast.error(result.message);
      }

    } else {
      if (existingPlayer) {
        if (onSlotClick) {
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(15);
          }
          onSlotClick(categoryCode, existingPlayer);
        }
      } else {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([20, 30, 20]); 
        }
        setMarketFilterPos(categoryCode);
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
        const posNames = { FW: 'กองหน้า', MF: 'กองกลาง', DF: 'กองหลัง', GK: 'ผู้รักษาประตู' };
        toast.info(`กำลังพาไปยังตลาดเพื่อหา ${posNames[categoryCode] || categoryCode}...`);
      }
    }
  };

  const usedPlayerIds = new Set();

  const renderRow = (rowConfig) => {
    const { role, category, count } = rowConfig;
    const slots = [];
    
    const isDroppableRow = pendingPlacement && normalizePosition(pendingPlacement.position) === category;
    
    for (let i = 0; i < count; i++) {
      const slotId = `${role}-${i}`;
      
      let assignedMember = mySquad.find(p => p.isStarting && p.slotIndex === slotId);

      if (!assignedMember) {
        assignedMember = mySquad.find(p => 
          p.isStarting && 
          normalizePosition(p.position) === category &&
          !p.slotIndex &&
          !usedPlayerIds.has(p.playerId)
        );
      }

      if (assignedMember) {
        usedPlayerIds.add(assignedMember.playerId);
      }

      const enrichedPlayer = enrichPlayerData(assignedMember);
      
      const isDroppableSlot = isDroppableRow;
      const slotWrapperClasses = `relative transition-all duration-500 ease-out flex-shrink-0
        ${pendingPlacement ? 'cursor-pointer' : 'cursor-pointer hover:scale-105 active:scale-95'}
        ${isDroppableSlot 
            ? 'scale-110 z-20 animate-[pulse_1.5s_ease-in-out_infinite]' 
            : 'ring-0'
        }
        ${pendingPlacement && !isDroppableSlot 
            ? 'opacity-40 grayscale-[0.8] scale-90 pointer-events-none' 
            : 'opacity-100 grayscale-0'
        }
      `;

      slots.push(
        <div 
          key={slotId}
          onClick={() => handleSlotClick(slotId, category, enrichedPlayer)}
          className={slotWrapperClasses}
        >
          <PlayerSlot 
            player={enrichedPlayer}
            expectedPosition={category}
            isGhost={!enrichedPlayer}
          />
        </div>
      );
    }

    return (
      <div key={`row-${role}`} className="flex justify-evenly items-center w-full z-10 px-1 sm:px-2 min-h-[75px] sm:min-h-[85px]">
        {slots}
      </div>
    );
  };

  return (
    <PitchFieldUI>
      {currentFormation.rows.map(row => renderRow(row))}
      <div>
         {renderRow({ role: 'GK', category: 'GK', count: 1 })}
      </div>
    </PitchFieldUI>
  );
}