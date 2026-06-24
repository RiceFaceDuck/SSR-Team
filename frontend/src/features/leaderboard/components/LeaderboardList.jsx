import React from 'react';
import LeaderboardItem from './LeaderboardItem';
import LeaderboardPodium from './LeaderboardPodium';

export default function LeaderboardList({ leaders, loading, user, activeTab }) {
  if (loading) {
    return (
      <div className="space-y-3 pt-4">
        <div className="flex justify-center items-end gap-2 h-48 animate-pulse mb-8">
           <div className="w-24 h-32 bg-slate-200 rounded-t-xl"></div>
           <div className="w-24 h-40 bg-slate-200 rounded-t-xl"></div>
           <div className="w-24 h-28 bg-slate-200 rounded-t-xl"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  if (!leaders || leaders.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-100 mt-4">
        <div className="text-5xl mb-3 opacity-50 drop-shadow-sm">🏆</div>
        <p className="font-bold text-lg text-slate-500">ระบบกำลังประมวลผลอันดับ</p>
        <p className="text-xs mt-1">โปรดรอสักครู่ หรือลองกลับมาดูใหม่ภายหลัง</p>
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const others = leaders.slice(3);

  return (
    <div className="flex flex-col">
      {top3.length > 0 && (
        <LeaderboardPodium top3={top3} user={user} activeTab={activeTab} />
      )}
      
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden mt-2">
        <div className="flex justify-between items-center border-b border-slate-100/80 px-4 py-3 bg-slate-50/50">
          <span className="text-[10px] sm:text-xs font-black text-slate-400 w-12 text-center uppercase tracking-wider">Rank</span>
          <span className="text-[10px] sm:text-xs font-black text-slate-400 flex-1 px-2 uppercase tracking-wider">Manager</span>
          <span className="text-[10px] sm:text-xs font-black text-slate-400 text-right uppercase tracking-wider">{activeTab === 'club' ? 'EXP' : 'Points'}</span>
        </div>

        <div className="space-y-1.5 max-h-[50vh] overflow-y-auto custom-scrollbar p-2">
          {others.map((player) => (
            <LeaderboardItem 
              key={player.id} 
              player={player} 
              isCurrentUser={user && user.uid === player.id} 
              activeTab={activeTab}
            />
          ))}
          {others.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm font-bold">ไม่มีข้อมูลผู้เล่นอันดับต่อไป</div>
          )}
        </div>
      </div>
    </div>
  );
}

