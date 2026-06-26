import React from 'react';
import { Eye, Activity } from 'lucide-react';

export default function LivePreviewBoard({ match }) {
  if (!match) return null;

  return (
    <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col relative border-4 border-slate-800">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>

      {/* Phone Header Mock */}
      <div className="relative z-10 bg-black/40 px-4 py-2 flex items-center justify-between backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-blue-400" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Live Preview
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-red-500">Online</span>
        </div>
      </div>

      <div className="relative z-10 flex-1 p-6 flex flex-col items-center justify-center">
        {/* Score Board Match */}
        <div className="w-full bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between text-white">
            <div className="flex flex-col items-center flex-1">
              {match.homeTeam?.logo ? (
                <img
                  src={match.homeTeam.logo}
                  alt="Home"
                  className="w-10 h-10 object-contain mb-1 drop-shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-white/10 rounded-full mb-1"></div>
              )}
              <span className="text-[10px] font-bold uppercase truncate max-w-full">
                {match.homeTeam?.code || 'HOME'}
              </span>
            </div>

            <div className="flex flex-col items-center shrink-0 px-4">
              <div className="text-[10px] text-red-400 font-bold mb-1 tracking-widest bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                {match.status === 'LIVE' ? 'LIVE' : match.status}
              </div>
              <div className="flex items-baseline gap-2 text-3xl font-black tabular-nums tracking-tighter">
                <span>{match.homeScore || 0}</span>
                <span className="text-white/30 text-xl">-</span>
                <span>{match.awayScore || 0}</span>
              </div>
              <div className="text-[10px] text-white/50 font-medium mt-1">{match.minute}'</div>
            </div>

            <div className="flex flex-col items-center flex-1">
              {match.awayTeam?.logo ? (
                <img
                  src={match.awayTeam.logo}
                  alt="Away"
                  className="w-10 h-10 object-contain mb-1 drop-shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-white/10 rounded-full mb-1"></div>
              )}
              <span className="text-[10px] font-bold uppercase truncate max-w-full">
                {match.awayTeam?.code || 'AWAY'}
              </span>
            </div>
          </div>
        </div>

        {/* Latest Event Banner */}
        {match.latestEvent && match.latestEvent.primaryDetail && (
          <div className="mt-4 w-full bg-gradient-to-r from-red-600 to-rose-500 rounded-xl p-3 shadow-lg border border-red-400/50 flex items-center gap-3 transform translate-y-0 opacity-100 transition-all">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Activity size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-white">
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-0.5">
                Latest Event • {match.minute}'
              </div>
              <div className="text-sm font-bold truncate">{match.latestEvent.primaryDetail}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
