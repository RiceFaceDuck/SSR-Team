import React from 'react';
import { useLeagueRanking } from '../hooks/useLeagueRanking';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export default function LeagueLeaderboard({ loading, members, userData }) {
  const { rankedMembers } = useLeagueRanking(members, userData);

  if (loading) {
    return <div className="text-center py-10 text-slate-400 animate-pulse font-medium">กำลังโหลดอันดับ...</div>;
  }

  if (!rankedMembers || rankedMembers.length === 0) {
    return <div className="text-center py-10 text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-100">ยังไม่มีสมาชิกในลีก</div>;
  }

  return (
    <div className="space-y-2">
      {rankedMembers.map((m) => {
        const isMe = m.id === userData?.uid;
        
        // Render trend indicator
        let TrendIcon = Minus;
        let trendColor = "text-slate-300";
        if (m.trend === 'up') {
          TrendIcon = ArrowUp;
          trendColor = "text-green-500";
        } else if (m.trend === 'down') {
          TrendIcon = ArrowDown;
          trendColor = "text-red-500";
        }

        return (
          <div key={m.id} className={`flex items-center p-3 rounded-xl border transition-all hover:scale-[1.01] ${isMe ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <div className="w-10 flex flex-col items-center justify-center">
              <span className={`font-black text-lg leading-none ${m.rank <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>{m.rank}</span>
              <TrendIcon size={12} className={`mt-0.5 ${trendColor}`} strokeWidth={3} />
            </div>
            
            <div className="flex-1 px-3 flex items-center gap-3 overflow-hidden">
              <div className="relative">
                {m.photoURL ? (
                  <img src={m.photoURL} alt="" className="w-8 h-8 rounded-full shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs shadow-inner">
                    {m.displayName ? m.displayName.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                {isMe && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              
              <div className="flex flex-col overflow-hidden">
                <span className={`font-bold text-sm truncate ${isMe ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {m.teamName || m.displayName || 'ไม่มีชื่อทีม'}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  {m.displayName && m.teamName ? m.displayName : ''}
                </span>
              </div>
              {isMe && <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase ml-auto">You</span>}
            </div>
            
            <div className="text-right flex flex-col items-end pl-2 border-l border-slate-100/50">
              <span className={`font-black text-lg leading-none ${isMe ? 'text-indigo-600' : 'text-slate-700'}`}>{m.userPoints || 0}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase">Pts</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
