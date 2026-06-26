import React, { useState, useEffect, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import PlayerRow from './PlayerRow';
import SkeletonLoader from '../../../components/common/SkeletonLoader';

export default function MarketPlayerList({
  isLoading,
  displayPlayers,
  mySquad,
  budgetLeft,
  watchlist = [],
  onToggleWatchlist,
  onRowClick,
  onActionClick,
}) {
  const [scrollParent, setScrollParent] = useState(null);

  useEffect(() => {
    // 🌟 ค้นหา Scroll Container ของ MobileLayout เพื่อให้ Virtuoso ทำงานได้ถูกต้อง
    const container = document.getElementById('main-scroll-container');
    if (container) {
      setScrollParent(container);
    }
  }, []);

  // 🌟 O(1) Lookup sets for high performance rendering
  const ownedIds = useMemo(() => {
    return new Set(mySquad.map((sq) => String(sq.playerId)));
  }, [mySquad]);

  const watchlistSet = useMemo(() => {
    return new Set(watchlist.map(String));
  }, [watchlist]);

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
    <div className="pb-4">
      <Virtuoso
        customScrollParent={scrollParent}
        data={displayPlayers}
        itemContent={(index, player) => {
          // เช็คว่านักเตะคนนี้มีอยู่ในทีมแล้วหรือยัง เพื่อส่งให้ PlayerRow เปลี่ยนปุ่มเป็น "ขาย" (O(1) Optimized)
          const isOwned = ownedIds.has(String(player.sku));
          const isWatchlisted = watchlistSet.has(String(player.sku));

          return (
            <div className="py-1">
              <div
                className="animate-in fade-in slide-in-from-bottom-4 duration-300 fill-mode-both"
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
              >
                <PlayerRow
                  player={player}
                  isOwned={isOwned}
                  budgetLeft={budgetLeft}
                  isWatchlisted={isWatchlisted}
                  onToggleWatchlist={onToggleWatchlist}
                  onClick={onRowClick}
                  onActionClick={onActionClick}
                />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
