import React from 'react';
import { ArrowUpCircle, Lock } from 'lucide-react';

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

  // Calculate visual progress (0-100%)
  const progressPercent = Math.min(100, (level / maxLevel) * 100);

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      {/* Background Decor */}
      <div className="absolute -right-6 -top-6 text-slate-50 opacity-50 group-hover:scale-110 transition-transform duration-500">
        <Icon size={120} />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0 shadow-inner">
          <Icon size={28} strokeWidth={2} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-slate-800">{title}</h4>
            <span className="text-xs font-black px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
              Lv. {level}{isMax && ' (MAX)'}
            </span>
          </div>
          
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {!isMax && (
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs font-medium text-slate-500">
                Cost: <span className={canAfford ? 'text-indigo-600 font-bold' : 'text-red-500 font-bold'}>{cost} EXP</span>
              </div>
              <button
                onClick={onUpgrade}
                disabled={isUpgrading || !canAfford}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all
                  ${!canAfford 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-500 text-white hover:bg-indigo-600 active:scale-95 shadow-sm shadow-indigo-200'}
                `}
              >
                {!canAfford ? <Lock size={14} /> : <ArrowUpCircle size={14} />}
                Upgrade
              </button>
            </div>
          )}
          {isMax && (
            <div className="mt-3 text-xs font-bold text-amber-500 flex items-center gap-1">
              🎉 Reached Maximum Level
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
