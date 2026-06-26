import React from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useGameStore } from '../../../store/useGameStore';
import { useMyRank } from '../../../hooks/useMyRank';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const SquadHeader = ({ totalPoints }) => {
  const { userData, currentStreak, manager } = useUserStore();
  const { currentGameweek, isMarketOpen, totalJoinedTeams } = useGameStore();
  const { ranks, loading } = useMyRank();

  const teamName = userData?.displayName || 'My Dream Team';

  return (
    <div className="flex-shrink-0 w-full px-3 py-1.5 z-10 bg-slate-900/95 backdrop-blur-md border-b border-white/10 shadow-sm">
      {/* Row 1: Team Name | Rank | Points */}
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-baseline gap-2 overflow-hidden">
          <span className="font-black text-white text-base truncate drop-shadow-md tracking-wide max-w-[150px]">
            {teamName}
          </span>
          <span className="text-[10px] text-blue-300 font-semibold whitespace-nowrap">
            อันดับ{' '}
            <span className="text-white font-black drop-shadow-[0_0_2px_rgba(59,130,246,0.8)]">
              {loading ? '...' : (ranks.season?.toLocaleString() || '-')}
            </span>
          </span>
          {currentStreak > 0 && (
            <div className="flex items-center gap-0.5 ml-1 bg-orange-500/20 border border-orange-500/30 px-1.5 py-0.5 rounded-md">
              <span className="text-[10px]">🔥</span>
              <span className="text-[10px] text-orange-400 font-bold">{currentStreak}</span>
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 flex-shrink-0 relative">
          {manager?.effectLogic?.type === 'SCORE_MULTIPLIER' && (
            <div className="absolute -top-4 -right-1 flex items-center bg-fuchsia-600/90 border border-fuchsia-400 text-[8px] text-white px-1 py-0.5 rounded shadow-[0_0_5px_rgba(192,38,211,0.6)] animate-pulse">
              <span>👑 x{manager.effectLogic.value}</span>
            </div>
          )}
          <span className="text-[9px] text-amber-400/90 font-black tracking-widest">PTS</span>
          <span className="font-black text-2xl text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] tabular-nums leading-none">
            {totalPoints?.toLocaleString() || 0}
          </span>
        </div>
      </div>

      {/* Row 2: Gameweek | Joined | Market Status */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 leading-none">
            <span className="text-[9px] font-bold text-indigo-300 tracking-wider">
              {currentGameweek}
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-300 leading-none">
            เข้าร่วม{' '}
            <span className="text-white font-bold">{totalJoinedTeams?.toLocaleString() || 0}</span>{' '}
            ทีม
          </span>
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded border leading-none ${isMarketOpen ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
        >
          {isMarketOpen ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          <span className="text-[9px] font-bold tracking-wider">
            ตลาด{isMarketOpen ? 'เปิด' : 'ปิด'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SquadHeader;
