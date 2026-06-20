import React from 'react';
import LeaderboardItem from './LeaderboardItem';

export default function LeaderboardList({ leaders, loading, user, activeTab }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="text-4xl mb-3 opacity-50">🏆</div>
        <p className="font-bold">ยังไม่มีข้อมูลในโหมดนี้</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1 pb-4">
      {leaders.map((player) => (
        <LeaderboardItem 
          key={player.id} 
          player={player} 
          isCurrentUser={user && user.uid === player.id} 
          activeTab={activeTab}
        />
      ))}
    </div>
  );
}
