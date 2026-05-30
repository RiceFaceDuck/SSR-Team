import React, { useRef, useState } from 'react';
import { 
  Users, 
  ArrowRightLeft, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag,
  SlidersHorizontal
} from 'lucide-react';
import PlayerSlot from './PlayerSlot';
import { useUserStore } from '../../store/useUserStore';

export default function BenchArea({ selectedPlayerId, onSelectPlayer }) {
  const { mySquad } = useUserStore();
  const scrollRef = useRef(null);
  const [positionFilter, setPositionFilter] = useState('ALL');

  const getNormalizedPosGroup = (pos) => {
    if (!pos) return 'MF';
    const p = pos.toUpperCase();
    if (['GK', 'GOALKEEPER'].includes(p)) return 'GK';
    if (['DF', 'CB', 'LB', 'RB', 'RWB', 'LWB', 'DEFENDER'].includes(p)) return 'DF';
    if (['MF', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'MIDFIELDER'].includes(p)) return 'MF';
    if (['FW', 'ST', 'CF', 'LW', 'RW', 'FORWARD', 'STRIKER'].includes(p)) return 'FW';
    return 'MF';
  };

  const benchPlayers = mySquad.filter(p => !p.isStarting);
  const filteredBenchPlayers = benchPlayers.filter(p => {
    if (positionFilter === 'ALL') return true;
    return getNormalizedPosGroup(p.position) === positionFilter;
  });

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  const navigateToMarket = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(30);
    }
    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
  };

  return (
    <div className="relative w-full bg-slate-900 border-t-4 border-slate-950 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] overflow-hidden select-none">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-slate-800 via-slate-400 to-slate-800 opacity-70"></div>

      <div className="max-w-md mx-auto flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-950 z-20 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border-2 border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 pointer-events-none"></div>
               <Users size={20} className="text-slate-300 drop-shadow-md" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-sm uppercase tracking-widest drop-shadow-sm">Substitutes</span>
              <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                {benchPlayers.length} Available
              </span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {benchPlayers.length > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/90 border-b border-slate-950/50 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="text-slate-500 mr-1 flex items-center">
              <SlidersHorizontal size={12} className="opacity-60" />
            </div>
            {['ALL', 'GK', 'DF', 'MF', 'FW'].map((pos) => {
              const isActive = positionFilter === pos;
              return (
                <button
                  key={`filter-${pos}`}
                  onClick={() => {
                    setPositionFilter(pos);
                    if (typeof window !== 'undefined' && window.navigator?.vibrate) window.navigator.vibrate(10);
                  }}
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border transition-all duration-200 shrink-0
                    ${isActive 
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.4)] font-extrabold'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                    }`}
                >
                  {pos}
                </button>
              );
            })}
          </div>
        )}

        {/* Players Track */}
        <div className="relative w-full bg-[#05070a] min-h-[140px] border-b-4 border-slate-950 flex flex-col justify-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] group/track">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#05070a] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#05070a] to-transparent z-10 pointer-events-none"></div>

          {filteredBenchPlayers.length > 2 && (
            <>
              <button onClick={() => handleScroll('left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center opacity-0 group-hover/track:opacity-100 hidden md:flex shadow-lg">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => handleScroll('right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500 hover:scale-110 active:scale-95 transition-all flex items-center justify-center opacity-0 group-hover/track:opacity-100 hidden md:flex shadow-lg">
                <ChevronRight size={16} />
              </button>
            </>
          )}

          <div ref={scrollRef} className="flex items-center gap-6 px-8 py-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth relative z-20">
            {benchPlayers.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-4 text-slate-700">
                <ShieldAlert size={28} className="mb-1.5 opacity-40 drop-shadow-md text-slate-500" />
                <span className="text-xs font-black uppercase tracking-[0.15em] drop-shadow-sm mb-3">Bench is Empty</span>
                <button
                  onClick={navigateToMarket}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs uppercase tracking-wide border-b-2 border-slate-950 active:border-b-0 active:translate-y-0.5 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                >
                  <ShoppingBag size={13} />
                  <span>Go to Transfer Market</span>
                </button>
              </div>
            ) : filteredBenchPlayers.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-6 text-slate-500">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">No {positionFilter} Players on Bench</span>
                <button onClick={() => setPositionFilter('ALL')} className="mt-2 text-[10px] text-emerald-400 underline font-black uppercase tracking-wider">Show All</button>
              </div>
            ) : (
              filteredBenchPlayers.map((player) => {
                const isSelected = selectedPlayerId === String(player.playerId);
                return (
                  <div key={`bench-${player.playerId}`} className="snap-center relative shrink-0">
                    <PlayerSlot
                      player={player}
                      expectedPosition={player.position}
                      onClick={() => onSelectPlayer(String(player.playerId))}
                      isSelected={isSelected}
                    />
                    {isSelected && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] z-30">
                        <ArrowRightLeft size={18} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}