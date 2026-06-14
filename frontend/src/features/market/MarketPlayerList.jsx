import React from 'react';
import PlayerRow from './PlayerRow';
import SkeletonLoader from '../../components/common/SkeletonLoader';

export default function MarketPlayerList({ 
  isLoading, 
  displayPlayers, 
  mySquad, 
  onRowClick, 
  onActionClick 
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 pb-4">
        <SkeletonLoader type="row" count={5} />
      </div>
    );
  }

  if (displayPlayers.length === 0) {
    return (
      <div className="space-y-2 pb-4">
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-slate-500 font-bold text-sm">ไม่พบรายชื่อนักเตะ</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-4">
      {displayPlayers.map((player, index) => {
        // เช็คว่านักเตะคนนี้มีอยู่ในทีมแล้วหรือยัง เพื่อส่งให้ PlayerRow เปลี่ยนปุ่มเป็น "ขาย"
        const isOwned = mySquad.some(sq => String(sq.playerId) === String(player.sku));
        
        return (
          <div 
            key={player.sku}
            className="animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-both"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PlayerRow 
              player={player} 
              isOwned={isOwned} 
              onClick={onRowClick}      
              onActionClick={onActionClick} 
            />
          </div>
        );
      })}
    </div>
  );
}
