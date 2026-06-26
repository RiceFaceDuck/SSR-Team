import React from 'react';

export default function LeaderboardItem({ player, isCurrentUser, activeTab }) {
  // Since Top 3 is handled by Podium, this component handles rank 4+

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
      className={`flex items-center px-3 py-2.5 rounded-xl border transition-all duration-200 group ${
        isCurrentUser
          ? 'border-indigo-400 bg-indigo-50/80 shadow-md shadow-indigo-100/50 z-10 relative ring-1 ring-indigo-200 hover:bg-indigo-100'
          : 'border-transparent bg-transparent hover:bg-slate-50 hover:border-slate-200'
      }`}
    >
      <div className="w-12 flex justify-center items-center">
        <span
          className={`font-black text-base sm:text-lg tabular-nums ${
            isCurrentUser ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
          }`}
        >
          {player.displayRank}
        </span>
      </div>

      <div className="flex-1 px-2 overflow-hidden">
        <div className="flex items-center gap-2.5">
          {player.photoURL ? (
            <img
              src={player.photoURL}
              alt=""
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
            />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
              <span className="font-bold text-xs text-slate-400">
                {player.displayName?.charAt(0) || '?'}
              </span>
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <span
              className={`font-bold text-sm truncate ${isCurrentUser ? 'text-indigo-900' : 'text-slate-700 group-hover:text-slate-900'}`}
            >
              {player.teamName || player.displayName || 'ผู้จัดการทีมปริศนา'}
            </span>
          </div>

          {isCurrentUser && (
            <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 shadow-sm ml-auto sm:ml-2">
              คุณ
            </span>
          )}
        </div>
      </div>

      <div className="text-right whitespace-nowrap pl-2">
        <span
          className={`font-black text-base sm:text-lg tabular-nums ${isCurrentUser ? 'text-indigo-600' : 'text-slate-600 group-hover:text-slate-800'}`}
        >
          {displayScore.toLocaleString()}
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 ml-1 uppercase">
          {scoreLabel}
        </span>
      </div>
    </div>
  );
}
