import React, { useRef, useState } from 'react';
import { 
  Users, 
  ArrowRightLeft, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag,
  SlidersHorizontal,
  SearchX
} from 'lucide-react';
import PlayerSlot from './PlayerSlot'; // อัปเดต Path ให้ชี้ไปที่โฟลเดอร์เดียวกัน
import { useUserStore } from '../../store/useUserStore';

export default function BenchArea({ selectedPlayerId, onSelectPlayer }) {
  const { mySquad } = useUserStore();
  const scrollRef = useRef(null);
  const [positionFilter, setPositionFilter] = useState('ALL');

  // ฟังก์ชันแยกหมวดหมู่ตำแหน่ง
  const getNormalizedPosGroup = (pos) => {
    if (!pos) return 'MF';
    const p = pos.toUpperCase();
    if (['GK', 'GOALKEEPER'].includes(p)) return 'GK';
    if (['DF', 'CB', 'LB', 'RB', 'RWB', 'LWB', 'DEFENDER'].includes(p)) return 'DF';
    if (['MF', 'CM', 'CDM', 'CAM', 'LM', 'RM', 'MIDFIELDER'].includes(p)) return 'MF';
    if (['FW', 'ST', 'CF', 'LW', 'RW', 'FORWARD', 'STRIKER'].includes(p)) return 'FW';
    return 'MF';
  };

  // คัดกรองนักเตะสำหรับม้านั่ง
  const benchPlayers = mySquad.filter(p => !p.isStarting);
  const filteredBenchPlayers = benchPlayers.filter(p => {
    if (positionFilter === 'ALL') return true;
    return getNormalizedPosGroup(p.position) === positionFilter;
  });

  // ฟังก์ชันจัดการการเลื่อนแนวนอน
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  // นำทางไปหน้าตลาด
  const navigateToMarket = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(30);
    }
    window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
  };

  return (
    <div className="relative w-full bg-[#0a0f16] border-t-4 border-[#05070a] shadow-[0_-15px_30px_rgba(0,0,0,0.6)] overflow-hidden select-none">
      {/* เส้นไฟนีออนขอบบน (Neon Accent Line) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-900 via-emerald-400 to-emerald-900 opacity-60"></div>

      <div className="max-w-md mx-auto flex flex-col">
        
        {/* Header ม้านั่งสำรอง */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border-b border-[#05070a] z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700/50 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 pointer-events-none"></div>
               <Users size={20} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-200 font-black text-sm uppercase tracking-widest drop-shadow-sm">Substitutes</span>
              <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span>
                {benchPlayers.length} Available
              </span>
            </div>
          </div>
        </div>

        {/* Filters Section (HUD Style) */}
        {benchPlayers.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0f16] border-b border-[#05070a] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="text-slate-600 mr-1 flex items-center">
              <SlidersHorizontal size={14} />
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
                  className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 shrink-0
                    ${isActive 
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-800/40 border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600 hover:bg-slate-800/80'
                    }`}
                >
                  {pos}
                </button>
              );
            })}
          </div>
        )}

        {/* Players Display Area */}
        <div className="relative w-full bg-[#030507] min-h-[170px] flex items-center justify-center border-b-[6px] border-slate-950 shadow-[inset_0_15px_30px_rgba(0,0,0,0.9)] group/track overflow-hidden">
          
          {/* ลวดลายตกแต่งพื้นหลัง */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#34d399 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#030507] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#030507] to-transparent z-10 pointer-events-none"></div>

          {/* เงื่อนไขที่ 1: ม้านั่งว่างเปล่าโดยสมบูรณ์ */}
          {benchPlayers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-in fade-in duration-500">
              <div className="relative mb-3 flex items-center justify-center">
                 <div className="absolute w-12 h-12 bg-emerald-500/10 blur-xl rounded-full animate-pulse"></div>
                 <ShieldAlert size={36} className="relative opacity-40 drop-shadow-md text-slate-400" />
              </div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600 text-center">
                ม้านั่งสำรองว่างเปล่า
              </span>
              <button
                onClick={navigateToMarket}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 text-emerald-400 font-bold text-[11px] sm:text-xs uppercase tracking-wider border border-emerald-900/50 hover:border-emerald-500/80 active:scale-95 transition-all shadow-[0_5px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] group"
              >
                <ShoppingBag size={16} className="group-hover:animate-bounce" />
                <span>ไปช้อปปิ้งนักเตะใหม่</span>
              </button>
            </div>
          )}

          {/* เงื่อนไขที่ 2: มีนักเตะ แต่ฟิลเตอร์แล้วไม่เจอ */}
          {benchPlayers.length > 0 && filteredBenchPlayers.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 animate-in fade-in duration-500">
              <SearchX size={32} className="mb-3 text-slate-700 drop-shadow-md" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4 text-center">
                ไม่พบนักเตะตำแหน่ง <span className="text-emerald-500/80">{positionFilter}</span> บนม้านั่ง
              </span>
              <button 
                onClick={() => {
                  setPositionFilter('ALL');
                  if (typeof window !== 'undefined' && window.navigator?.vibrate) window.navigator.vibrate(10);
                }} 
                className="px-5 py-2 rounded-full bg-slate-800/50 text-[10px] sm:text-[11px] text-emerald-500 font-black uppercase tracking-wider hover:bg-slate-800 hover:text-emerald-400 transition-all border border-slate-700/50 hover:border-emerald-500/50 active:scale-95"
              >
                ล้างการกรองตำแหน่ง
              </button>
            </div>
          )}

          {/* เงื่อนไขที่ 3: มีนักเตะ และแสดงผลบนรางสไลด์ */}
          {benchPlayers.length > 0 && filteredBenchPlayers.length > 0 && (
            <>
              {/* ปุ่มควบคุมการเลื่อนซ้าย-ขวา */}
              {filteredBenchPlayers.length > 3 && (
                <>
                  <button onClick={() => handleScroll('left')} className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-900/95 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500 hover:scale-110 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] active:scale-95 transition-all flex items-center justify-center opacity-0 group-hover/track:opacity-100 hidden sm:flex">
                    <ChevronLeft size={16} strokeWidth={3} />
                  </button>
                  <button onClick={() => handleScroll('right')} className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-slate-900/95 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500 hover:scale-110 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] active:scale-95 transition-all flex items-center justify-center opacity-0 group-hover/track:opacity-100 hidden sm:flex">
                    <ChevronRight size={16} strokeWidth={3} />
                  </button>
                </>
              )}

              {/* รางนักเตะ (Scroll Track) */}
              <div ref={scrollRef} className="w-full flex items-center gap-5 sm:gap-6 px-6 sm:px-8 py-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth relative z-20">
                {filteredBenchPlayers.map((player) => {
                  const isSelected = selectedPlayerId === String(player.playerId);
                  return (
                    <div key={`bench-${player.playerId}`} className="snap-center relative shrink-0">
                      <PlayerSlot
                        player={player}
                        expectedPosition={player.position}
                        onClick={() => onSelectPlayer(String(player.playerId))}
                        isSelected={isSelected}
                      />
                      
                      {/* อนิเมชันกระพริบตอนถูกเลือกเตรียมสลับตัว */}
                      {isSelected && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] z-30">
                          <ArrowRightLeft size={18} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}