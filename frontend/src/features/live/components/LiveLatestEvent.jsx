import React from 'react';

export default function LiveLatestEvent({ match }) {
  if (!match || !match.latestEvent || !match.latestEvent.primaryDetail) {
    return (
      <div className="mt-4 text-sm text-slate-400 text-center italic border-t border-slate-100 pt-4">
        ยังไม่มีเหตุการณ์สำคัญ
      </div>
    );
  }

  const { latestEvent } = match;

  return (
    <div className="mt-4 border-t border-slate-200 pt-4 px-2 pb-2">
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shadow-inner relative overflow-hidden">
        {/* Subtle glow effect for 'newest' feeling */}
        <div className="absolute inset-0 bg-blue-500 opacity-[0.02] mix-blend-overlay"></div>

        <div className="text-sm font-bold text-slate-700 tracking-wider flex justify-center items-center gap-3 mb-2">
          <span>{match.homeTeam?.code || 'HOME'}</span>
          <span className="text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md text-xs border border-blue-200/50 shadow-sm">
            {match.homeScore} - {match.awayScore}
          </span>
          <span>{match.awayTeam?.code || 'AWAY'}</span>
          <span className="text-red-500 animate-pulse ml-2 font-black text-lg">
            {match.minute}'
          </span>
        </div>

        <div className="text-xl md:text-2xl font-black text-slate-900 mt-2 tracking-tight">
          {latestEvent.primaryDetail}
        </div>

        {latestEvent.secondaryDetail && (
          <div className="text-sm md:text-base font-medium text-slate-500 mt-1">
            {latestEvent.secondaryDetail}
          </div>
        )}
      </div>
    </div>
  );
}
