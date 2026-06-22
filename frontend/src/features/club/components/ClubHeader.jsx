import React from 'react';
import { X, Sparkles, Trophy, GraduationCap } from 'lucide-react';

export default function ClubHeader({ 
  totalLevels, 
  availableExp, 
  onClose 
}) {
  // Decide visual tier based on total levels (Max is 50)
  let tierName = "Local Club";
  let clubImage = "https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000";
  let tierColor = "from-slate-400 to-slate-600";
  let glowColor = "shadow-slate-500/50";
  
  if (totalLevels >= 45) {
    tierName = "World Class Franchise";
    clubImage = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=1000";
    tierColor = "from-amber-400 via-orange-500 to-red-500";
    glowColor = "shadow-amber-500/50";
  } else if (totalLevels >= 30) {
    tierName = "Elite Football Club";
    clubImage = "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&q=80&w=1000";
    tierColor = "from-fuchsia-500 via-purple-500 to-indigo-600";
    glowColor = "shadow-purple-500/50";
  } else if (totalLevels >= 15) {
    tierName = "Professional Team";
    clubImage = "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=1000";
    tierColor = "from-cyan-400 via-blue-500 to-indigo-600";
    glowColor = "shadow-blue-500/50";
  }

  return (
    <div className="flex-shrink-0 flex flex-col">
      {/* Image Banner */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <img 
            src={clubImage} 
            alt="Club Tier" 
            className="w-full h-full object-cover opacity-80 mix-blend-overlay transition-all duration-1000 scale-105 hover:scale-110" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#0f172a] pointer-events-none" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white/90 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 z-10"
        >
          <X size={20} />
        </button>

        <div className="absolute bottom-6 left-6 right-6">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${tierColor} text-white text-[10px] font-black uppercase tracking-widest mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${glowColor}`}>
            <Sparkles size={12} className="animate-pulse" />
            {tierName}
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-white italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-tight">MY CLUB</h3>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-slate-200 text-sm font-medium flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 shadow-inner">
              <Trophy size={16} className="text-amber-400 drop-shadow-sm" />
              Total Lvl: <span className="text-white font-bold text-base">{totalLevels}</span><span className="opacity-70">/50</span>
            </div>
          </div>
        </div>
      </div>

      {/* EXP Tracker Bar */}
      <div className="bg-[#0f172a] px-6 py-5 border-b border-white/5 flex items-center justify-between shadow-lg z-20 relative -mt-2 rounded-t-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-t-3xl" />
        <div className="relative z-10">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available EXP</div>
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight flex items-baseline gap-1.5 drop-shadow-sm">
            {availableExp.toLocaleString()} <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">EXP</span>
          </div>
        </div>
        <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]">
          <GraduationCap size={24} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}
