import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function MatchScoreController({ match, onIncrement, isUpdating }) {
  if (!match) return null;

  const handleIncrement = (team, amount) => {
    onIncrement(team, amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">แผงควบคุมคะแนน (Quick Score)</h3>
      </div>

      <div className="p-6 grid grid-cols-2 gap-8">
        {/* ทีมเหย้า */}
        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Home
          </span>
          <span className="font-black text-xl text-slate-700 truncate w-full text-center mb-4">
            {match.homeTeam?.code || 'HOME'}
          </span>

          <div className="flex items-center gap-6">
            <button
              onClick={() => handleIncrement('home', -1)}
              disabled={isUpdating || match.homeScore <= 0}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm"
            >
              <Minus size={24} />
            </button>

            <div className="text-5xl font-black text-slate-800 w-16 text-center tabular-nums">
              {match.homeScore || 0}
            </div>

            <button
              onClick={() => handleIncrement('home', 1)}
              disabled={isUpdating}
              className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* ทีมเยือน */}
        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            Away
          </span>
          <span className="font-black text-xl text-slate-700 truncate w-full text-center mb-4">
            {match.awayTeam?.code || 'AWAY'}
          </span>

          <div className="flex items-center gap-6">
            <button
              onClick={() => handleIncrement('away', -1)}
              disabled={isUpdating || match.awayScore <= 0}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-red-500 flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm"
            >
              <Minus size={24} />
            </button>

            <div className="text-5xl font-black text-slate-800 w-16 text-center tabular-nums">
              {match.awayScore || 0}
            </div>

            <button
              onClick={() => handleIncrement('away', 1)}
              disabled={isUpdating}
              className="w-12 h-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md shadow-rose-500/30 disabled:opacity-50"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
