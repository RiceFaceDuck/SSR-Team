import React from 'react';
import { motion } from 'framer-motion';
import PlayerNode from './PlayerNode';
import { getFormationData } from '../../../utils/formationUtils';
import { useUserStore } from '../../../store/useUserStore';
import { toast } from '../../../utils/toast';
import { normalizePosition } from '../../../utils/squadValidator';
import FullscreenToggle from './FullscreenToggle';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
};

const Pitch = ({
  squad,
  formation,
  onSlotClick,
  onPlayerClick,
  selectedPlayerId,
  pendingPlacement,
  highlightedTeam,
}) => {
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
      const player = squad.find((p) => p.id === slotId);

      const isTargetValid =
        pendingPlacement &&
        normalizePosition(pendingPlacement.position) === normalizePosition(category);
      const highlightClass = isTargetValid
        ? 'ring-4 ring-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.8)] rounded-md animate-pulse z-30'
        : '';

      const isPlayerHighlighted = highlightedTeam && player?.team === highlightedTeam;
      const synergyGlowClass = isPlayerHighlighted
        ? 'ring-4 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.9)] rounded-md z-20 scale-105 transition-all duration-300'
        : '';

      slots.push(
        <motion.div
          key={slotId}
          variants={itemVariants}
          onClick={() => {
            if (!player) {
              if (onSlotClick) onSlotClick(slotId, category);
              else handleEmptySlotClick(category);
            } else {
              if (onPlayerClick) onPlayerClick(player);
            }
          }}
          className={`relative transition-all duration-300 cursor-pointer active:scale-95 ${selectedPlayerId === String(player?.playerId) ? 'scale-105 z-20' : ''} ${highlightClass} ${synergyGlowClass} ${!player ? 'hover:-translate-y-1' : ''}`}
        >
          {isTargetValid && (
            <div className="absolute inset-0 bg-[#fbbf24] bg-opacity-20 rounded-md pointer-events-none"></div>
          )}
          <PlayerNode
            player={player}
            expectedPosition={category}
            isSelected={selectedPlayerId === String(player?.playerId)}
            isSynergyHighlighted={isPlayerHighlighted}
          />
        </motion.div>
      );
    }

    return (
      <motion.div
        key={`row-${role}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex justify-evenly items-end w-full px-1 sm:px-4 py-0.5 sm:py-2"
      >
        {slots}
      </motion.div>
    );
  };

  // We want to render rows from FW down to GK
  const renderAllRows = () => {
    // formationUtils usually defines rows from FW -> MF -> DF
    // We keep that order and put GK at the very bottom.
    const allRows = [...currentFormation.rows, { role: 'GK', category: 'GK', count: 1 }];
    return allRows.map((row) => renderRow(row));
  };

  return (
    <div
      className="relative flex-1 w-full h-full flex flex-col justify-evenly overflow-hidden bg-[#228B22] sm:rounded-xl sm:m-1 sm:border-2 sm:border-[#3b82f6]/30 shadow-[inset_0_0_80px_rgba(0,0,0,0.6),0_10px_30px_rgba(0,0,0,0.3)] transition-all duration-300"
      style={{ background: 'radial-gradient(ellipse at center, #2e9f2e 0%, #1a5e1a 100%)' }}
    >
      <FullscreenToggle />
      {/* CSS Gradient Pitch Pattern (Underlay) - Horizontal Stripes */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
        style={{
          background:
            'repeating-linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.08) 10%, rgba(0,0,0,0.08) 10%, rgba(0,0,0,0.08) 20%)',
        }}
      />

      {/* Pitch Lines (Penalty box, half way line) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex flex-col items-center justify-between opacity-60">
        {/* Top Area */}
        <div className="w-[60%] h-[20%] flex flex-col items-center">
          {/* Penalty Box */}
          <div className="w-full h-[75%] border-b-2 border-x-2 border-white/70 relative flex justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            {/* 6-Yard Box */}
            <div className="absolute top-0 w-[40%] h-[40%] border-b-2 border-x-2 border-white/70"></div>
          </div>
          {/* Penalty Arc */}
          <div className="w-[30%] h-[25%] border-b-2 border-x-2 border-white/70 rounded-b-[100%] border-t-0 -mt-[2px] shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
        </div>

        {/* Halfway Line */}
        <div className="w-full border-t-2 border-white/70 relative flex justify-center items-center z-0 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          <div className="w-20 h-20 border-2 border-white/70 rounded-full absolute -top-10 bg-transparent shadow-[inset_0_0_10px_rgba(255,255,255,0.1),0_0_10px_rgba(255,255,255,0.2)]"></div>
          <div className="w-2 h-2 bg-white/80 rounded-full absolute"></div>
        </div>

        {/* Bottom Area */}
        <div className="w-[60%] h-[20%] flex flex-col items-center justify-end">
          {/* Penalty Arc */}
          <div className="w-[30%] h-[25%] border-t-2 border-x-2 border-white/70 rounded-t-[100%] border-b-0 -mb-[2px] shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
          {/* Penalty Box */}
          <div className="w-full h-[75%] border-t-2 border-x-2 border-white/70 relative flex justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            {/* 6-Yard Box */}
            <div className="absolute bottom-0 w-[40%] h-[40%] border-t-2 border-x-2 border-white/70"></div>
          </div>
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
