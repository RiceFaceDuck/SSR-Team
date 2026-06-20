import React from 'react';
import { Medal } from 'lucide-react';

export default function LeaderboardItem({ player, isCurrentUser, activeTab }) {
  const getRankColor = (rank) => {
    if (rank === 1) return 'text-amber-500 bg-amber-50 border-amber-200';
    if (rank === 2) return 'text-slate-400 bg-slate-100 border-slate-300';
    if (rank === 3) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-slate-600 bg-slate-50 border-slate-100';
  };

  const rankColorClass = getRankColor(player.displayRank);
  
  // Determine what score to display based on tab
  let displayScore = 0;
  let scoreLabel = 'Pts';
  if (activeTab === 'weekly') displayScore = player.lastGameweekPoints || 0;
  else if (activeTab === 'season') displayScore = player.userPoints || 0;
  else if (activeTab === 'club') {
    displayScore = player.clubSpentExp || 0;
    scoreLabel = 'EXP';
  }

  return (
    <div 
      className={`flex items-center p-3 rounded-xl border transition-all ${
        isCurrentUser 
          ? 'border-indigo-400 bg-indigo-50 shadow-md shadow-indigo-100/50 scale-[1.02] z-10 relative' 
          : rankColorClass
      }`}
    >
      <div className="w-12 flex justify-center items-center">
        {player.displayRank <= 3 ? (
          <Medal size={24} className={
            player.displayRank === 1 ? 'text-amber-500' : 
            player.displayRank === 2 ? 'text-slate-400' : 'text-orange-700'
          } />
        ) : (
          <span className={`font-black text-lg ${isCurrentUser ? 'text-indigo-600' : 'text-slate-400'}`}>
            {player.displayRank}
          </span>
        )}
      </div>
      
      <div className="flex-1 px-3 overflow-hidden">
        <div className="flex items-center gap-2">
          {player.photoURL && (
            <img src={player.photoURL} alt="" className="w-6 h-6 rounded-full object-cover border border-white shadow-sm" />
          )}
          <span className={`font-bold text-sm truncate ${isCurrentUser ? 'text-indigo-900' : 'text-slate-800'}`}>
            {player.teamName || player.displayName || 'ผู้จัดการทีมปริศนา'}
          </span>
          {isCurrentUser && (
            <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 shrink-0">คุณ</span>
          )}
        </div>
      </div>

      <div className="text-right whitespace-nowrap">
        <span className={`font-black text-lg ${isCurrentUser ? 'text-indigo-600' : 'text-slate-700'}`}>
          {displayScore.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold text-slate-400 ml-1">{scoreLabel}</span>
      </div>
    </div>
  );
}
