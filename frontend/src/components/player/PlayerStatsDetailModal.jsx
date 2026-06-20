import React from 'react';
import { X, Activity, TrendingUp, Shield, Target, Clock, AlertCircle } from 'lucide-react';

const PlayerStatsDetailModal = ({ isOpen, onClose, player }) => {
  if (!isOpen || !player) return null;

  const s = player.stats || {};
  const seasonPoints = player.totalPoints || 0;
  const lastGwPoints = player.lastGwPoints || player.gwPoints || 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center">
              <img 
                src={player.imageUrl || player.image || '/assets/default-avatar.png'} 
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/assets/default-avatar.png' }}
              />
            </div>
            <div>
              <h3 className="text-white font-bold leading-none">{player.name}</h3>
              <p className="text-xs text-slate-400 mt-1">Detailed Statistics</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="p-4 overflow-y-auto custom-scrollbar">
          
          {/* Fantasy Points Overview */}
          <div className="bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
              <Activity size={16} className="text-indigo-400" />
              Fantasy Overview
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Points</p>
                <p className="text-2xl font-black text-white">{seasonPoints}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Last GW</p>
                <p className="text-2xl font-black text-indigo-400">{lastGwPoints}</p>
              </div>
            </div>
          </div>

          {/* Attacking Stats */}
          <div className="bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
              <Target size={16} className="text-rose-400" />
              Attacking
            </h4>
            <div className="space-y-2">
              <StatRow label="Goals" value={s.goals || 0} highlight />
              <StatRow label="Assists" value={s.assists || 0} highlight />
              <StatRow label="Key Passes" value={s.keyPasses || 0} />
              <StatRow label="Successful Dribbles" value={s.dribbles || 0} />
            </div>
          </div>

          {/* Defending & Goalkeeping Stats */}
          <div className="bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
              <Shield size={16} className="text-emerald-400" />
              Defending
            </h4>
            <div className="space-y-2">
              <StatRow label="Clean Sheets" value={s.cleanSheets || 0} highlight />
              <StatRow label="Tackles" value={s.tackles || 0} />
              <StatRow label="Blocks" value={s.blocks || 0} />
              <StatRow label="Saves" value={s.saves || 0} />
            </div>
          </div>

          {/* Discipline & General */}
          <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
            <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-amber-400" />
              General
            </h4>
            <div className="space-y-2">
              <StatRow label="Matches Played" value={s.played || 0} />
              <StatRow label="Minutes Played" value={s.minutes || 0} />
              <StatRow label="Yellow Cards" value={s.yellowCards || 0} />
              <StatRow label="Red Cards" value={s.redCards || 0} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper component for rows
const StatRow = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0">
    <span className="text-sm text-slate-400">{label}</span>
    <span className={`text-sm font-bold ${highlight ? 'text-white' : 'text-slate-300'}`}>
      {value}
    </span>
  </div>
);

export default PlayerStatsDetailModal;
