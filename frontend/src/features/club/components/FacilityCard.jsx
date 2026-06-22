import React from 'react';
import { ArrowUpCircle, Lock, CheckCircle } from 'lucide-react';

export default function FacilityCard({ 
  title, 
  icon: Icon, 
  level, 
  maxLevel = 10, 
  cost, 
  availableExp, 
  onUpgrade, 
  isUpgrading 
}) {
  const isMax = level >= maxLevel;
  const canAfford = availableExp >= cost;
  const progressPercent = Math.min(100, (level / maxLevel) * 100);

  return (
    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Decorative Background Icon */}
      <div className="absolute -right-6 -top-6 text-slate-100 opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
        <Icon size={120} />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        {/* Icon Container with subtle glow */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:shadow-[inset_0_2px_10px_rgba(99,102,241,0.15)] transition-all duration-300">
          <Icon size={26} strokeWidth={2.5} className="drop-shadow-sm" />
        </div>
        
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-slate-800 tracking-tight text-base">{title}</h4>
            <div className={`text-xs font-black px-2.5 py-1 rounded-lg shadow-sm border ${isMax ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
              Lv. {level}{isMax && ' (MAX)'}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-100/80 h-2 rounded-full overflow-hidden mb-3 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-1000 bg-[length:200%_auto] animate-gradient"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Action Area */}
          {!isMax && (
            <div className="flex items-center justify-between mt-1">
              <div className="text-xs font-semibold text-slate-500">
                Cost: <span className={canAfford ? 'text-indigo-600 font-bold ml-1' : 'text-rose-500 font-bold ml-1'}>{cost} EXP</span>
              </div>
              <button
                onClick={onUpgrade}
                disabled={isUpgrading || !canAfford}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all duration-300
                  ${!canAfford 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : isUpgrading 
                      ? 'bg-indigo-400 text-white cursor-wait'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-500 hover:to-blue-500 hover:shadow-[0_4px_15px_rgba(99,102,241,0.3)] active:scale-95'
                  }
                `}
              >
                {!canAfford ? <Lock size={14} className="opacity-70" /> : isUpgrading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowUpCircle size={14} className="drop-shadow-sm" />}
                {isUpgrading ? 'Upgrading...' : 'Upgrade'}
              </button>
            </div>
          )}
          {isMax && (
            <div className="mt-2 text-xs font-bold text-amber-600 flex items-center gap-1.5 bg-amber-50/50 w-fit px-2 py-1 rounded-md">
              <CheckCircle size={14} /> Reached Maximum Level
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
