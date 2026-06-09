import React, { useRef, useState } from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import PlayerSlot from './PlayerSlot'; 
import { useUserStore } from '../../store/useUserStore';
import { useMarketStore } from '../../store/useMarketStore';

export default function BenchArea({ selectedPlayerId, onSelectPlayer }) {
  const { mySquad } = useUserStore();
  const { players: marketPlayers } = useMarketStore(); 
  const scrollRef = useRef(null);

  // นักเตะที่ไม่ได้ลงสนาม
  const benchPlayers = mySquad.filter(p => !p.isStarting);

  const enrichPlayerData = (squadPlayer) => {
    const fullData = marketPlayers.find(p => String(p.sku) === String(squadPlayer.playerId));
    return {
      ...squadPlayer,
      name: fullData?.name || fullData?.fullName || 'Unknown',
      imageUrl: fullData?.imageUrl || fullData?.image || fullData?.photoURL || null,
      price: fullData?.price || 0,
      stats: fullData?.stats || {}
    };
  };

  return (
    <div className="w-full bg-[#e5e7eb] relative border-t border-slate-300">
      
      {/* 🌟 พื้นที่แสดงตัวสำรอง */}
      <div className="flex w-full bg-white border-b border-slate-200">
        <div className="py-2 px-3 text-xs font-bold text-[#5B8D2F]">
          นักเตะสำรอง ({benchPlayers.length})
        </div>
      </div>

      <div className="relative w-full h-[88px] flex items-center justify-center overflow-hidden">
        
        <div className="w-full max-w-2xl relative h-full">
          {benchPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center text-slate-500">
              <ShoppingBag size={24} className="mb-2 opacity-50" />
              <p className="text-xs font-bold mb-2">ม้านั่งสำรองว่างเปล่า</p>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }))}
                className="px-4 py-1.5 bg-[#5B8D2F] text-white rounded-full text-xs font-bold hover:bg-[#4a7326] active:scale-95 transition-transform"
              >
                + ซื้อผู้เล่นเพิ่ม
              </button>
            </div>
          ) : (
            <>
              {/* รางนักเตะ (Scroll Track) */}
              <div 
                ref={scrollRef} 
                className="w-full h-full flex items-center gap-2 sm:gap-4 px-4 py-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth relative z-20"
              >
                {benchPlayers.map((player) => {
                  const isSelected = selectedPlayerId === String(player.playerId);
                  const enrichedPlayer = enrichPlayerData(player);

                  return (
                    <div key={`bench-${player.playerId}`} className="snap-center relative shrink-0">
                      <PlayerSlot
                        player={enrichedPlayer}
                        expectedPosition={player.position}
                        onClick={() => onSelectPlayer(String(player.playerId))}
                        isSelected={isSelected}
                      />
                    </div>
                  );
                })}
                {benchPlayers.length > 3 && (
                   <div className="shrink-0 flex items-center justify-center pl-2 pr-4 text-slate-400">
                      <ChevronRight size={32} />
                   </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}