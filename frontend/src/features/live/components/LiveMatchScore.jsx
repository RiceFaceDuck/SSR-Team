import React from 'react';

export default function LiveMatchScore({ match }) {
  if (!match) return null;

  const isLive = match.status === 'LIVE' || match.status === 'HT';

  return (
    <div className="flex justify-between items-center relative z-10 p-2 md:p-4">
      <div className="flex flex-col items-center w-28 shrink-0">
        {match.homeTeam?.logo ? (
          <img src={match.homeTeam.logo} alt={match.homeTeam.name} className="w-16 h-16 object-contain mb-2 drop-shadow-md" />
        ) : (
          <div className="w-16 h-16 bg-slate-100 rounded-full mb-2 flex items-center justify-center text-sm font-bold text-slate-400">{match.homeTeam?.code}</div>
        )}
        <span className="font-bold text-[13px] md:text-sm line-clamp-2 text-center leading-tight">{match.homeTeam?.name || 'Home'}</span>
      </div>
      
      <div className="flex flex-col items-center flex-1">
        {isLive ? (
          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-[11px] font-black animate-pulse mb-2 shadow-sm shadow-red-500/30">
            LIVE {match.minute}'
          </div>
        ) : (
          <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[11px] font-bold mb-2 border border-slate-200">
            {match.status === 'FT' ? 'จบการแข่งขัน' : match.status === 'upcoming' ? 'รอแข่งขัน' : match.status}
          </div>
        )}
        
        <div className="text-5xl md:text-6xl font-black mt-0 leading-none text-slate-800 tracking-tighter flex items-center justify-center gap-2">
          <span>{match.homeScore ?? '-'}</span>
          <span className="text-slate-300 text-4xl md:text-5xl font-light">-</span>
          <span>{match.awayScore ?? '-'}</span>
        </div>
      </div>

      <div className="flex flex-col items-center w-28 shrink-0">
        {match.awayTeam?.logo ? (
          <img src={match.awayTeam.logo} alt={match.awayTeam.name} className="w-16 h-16 object-contain mb-2 drop-shadow-md" />
        ) : (
          <div className="w-16 h-16 bg-slate-100 rounded-full mb-2 flex items-center justify-center text-sm font-bold text-slate-400">{match.awayTeam?.code}</div>
        )}
        <span className="font-bold text-[13px] md:text-sm line-clamp-2 text-center leading-tight">{match.awayTeam?.name || 'Away'}</span>
      </div>
    </div>
  );
}
