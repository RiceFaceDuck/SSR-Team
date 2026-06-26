import React from 'react';

export default function FloatingActionBar({
  pendingPlacement,
  selectedPlayer,
  cancelPlacement,
  setSelectedPlayer,
}) {
  if (!pendingPlacement && !selectedPlayer) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#0f284e]/95 backdrop-blur-md border border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.3)] rounded-full px-6 py-3 flex items-center justify-between min-w-[300px] z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#fbbf24] rounded-full flex items-center justify-center animate-pulse">
          <span className="text-[#0a192f] font-black text-lg">!</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white text-xs font-bold">
            {pendingPlacement ? 'กำลังจัดวางลงสนาม' : 'โหมดสลับตำแหน่ง'}
          </span>
          <span className="text-[#fbbf24] text-[10px] font-semibold">
            {pendingPlacement
              ? `แตะที่ตำแหน่งว่างเพื่อวาง ${pendingPlacement.name}`
              : 'แตะที่นักเตะอีกคน หรือตำแหน่งว่าง'}
          </span>
        </div>
      </div>
      <button
        onClick={() => {
          if (pendingPlacement) cancelPlacement();
          setSelectedPlayer(null);
        }}
        className="ml-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors border border-white/20"
      >
        ยกเลิก
      </button>
    </div>
  );
}
