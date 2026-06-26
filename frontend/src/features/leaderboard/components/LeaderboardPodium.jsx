import React from 'react';
import { Crown, Medal } from 'lucide-react';

export default function LeaderboardPodium({ top3, user, activeTab }) {
  // top3 is an array of up to 3 players, ordered [1st, 2nd, 3rd]

  const getScore = (player) => {
    if (activeTab === 'weekly') return player.lastGameweekPoints || 0;
    if (activeTab === 'season') return player.userPoints || 0;
    if (activeTab === 'club') return player.clubSpentExp || 0;
    return 0;
  };

  const getScoreLabel = () => (activeTab === 'club' ? 'EXP' : 'Pts');

  // Order for display: 2nd, 1st, 3rd
  const displayOrder = [top3[1] || null, top3[0] || null, top3[2] || null];

  const heights = ['h-32', 'h-40', 'h-28'];
  const colors = [
    'from-slate-200 to-slate-300 border-slate-300 text-slate-800 shadow-slate-300/50', // 2nd
    'from-amber-300 to-amber-500 border-amber-200 text-amber-900 shadow-amber-400/50', // 1st
    'from-orange-200 to-orange-300 border-orange-300 text-orange-900 shadow-orange-300/50', // 3rd
  ];

  const medals = [
    <Medal size={26} className="text-slate-500 drop-shadow-sm" />,
    <Crown size={36} className="text-amber-100 drop-shadow-md animate-pulse" fill="#f59e0b" />,
    <Medal size={24} className="text-orange-700 drop-shadow-sm" />,
  ];

  return (
    <div className="flex items-end justify-center gap-1 sm:gap-2 pt-10 pb-4 px-2">
      {displayOrder.map((player, index) => {
        if (!player) return <div key={index} className="w-24 sm:w-28" />; // Empty slot placeholder

        const isCurrentUser = user && user.uid === player.id;
        const rank = index === 0 ? 2 : index === 1 ? 1 : 3;

        return (
          <div key={player.id} className="flex flex-col items-center group w-24 sm:w-28 relative">
            {/* Avatar & Medal */}
            <div className="relative mb-2 flex flex-col items-center transition-all duration-300 group-hover:-translate-y-3 z-20">
              <div className="absolute -top-7 z-30">{medals[index]}</div>
              <div
                className={`rounded-full border-4 shadow-xl overflow-hidden flex items-center justify-center bg-white relative ${
                  rank === 1
                    ? 'border-amber-300 w-16 h-16 sm:w-20 sm:h-20'
                    : rank === 2
                      ? 'border-slate-300 w-14 h-14 sm:w-16 sm:h-16'
                      : 'border-orange-300 w-14 h-14 sm:w-16 sm:h-16'
                }`}
              >
                {player.photoURL ? (
                  <img src={player.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-2xl text-slate-300">
                    {player.displayName?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              {isCurrentUser && (
                <div className="absolute -bottom-2 bg-indigo-600 text-white text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-black tracking-wider shadow-md z-30 ring-2 ring-white">
                  คุณ
                </div>
              )}
            </div>

            {/* Podium Block */}
            <div
              className={`w-full ${heights[index]} bg-gradient-to-b ${colors[index]} rounded-t-xl border-t border-l border-r flex flex-col items-center justify-start pt-3 shadow-xl relative overflow-hidden backdrop-blur-sm transition-all duration-300 group-hover:brightness-110`}
            >
              <div className="absolute inset-0 bg-white/20"></div>
              {/* Glass reflection */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>

              <span className="font-black text-3xl sm:text-4xl opacity-90 drop-shadow-sm relative z-10">
                {rank}
              </span>

              <div className="w-full px-1 text-center mt-auto mb-3 relative z-10">
                <div className="text-[10px] sm:text-xs font-bold truncate opacity-90 leading-tight">
                  {player.teamName || player.displayName || 'ปริศนา'}
                </div>
                <div className="text-xs sm:text-sm font-black mt-0.5">
                  {getScore(player).toLocaleString()}{' '}
                  <span className="text-[9px] opacity-75 font-bold">{getScoreLabel()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
