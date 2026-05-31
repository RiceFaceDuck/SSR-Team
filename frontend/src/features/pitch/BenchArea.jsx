import React, { useRef, useState } from 'react';
import { 
  Users, 
  ArrowRightLeft, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingBag,
  SlidersHorizontal,
  SearchX
} from 'lucide-react';
import PlayerSlot from './PlayerSlot'; 
import { useUserStore } from '../../store/useUserStore';

// 🌟 NEW: นำเข้า MarketStore เพื่อดึงข้อมูลภาพและชื่อนักเตะ
import { useMarketStore } from '../../store/useMarketStore';

export default function BenchArea({ selectedPlayerId, onSelectPlayer }) {
  const { mySquad } = useUserStore();
  // 🌟 NEW: ดึงรายชื่อนักเตะทั้งหมดจากตลาดมาเตรียมไว้แมปข้อมูล
  const { players: marketPlayers } = useMarketStore(); 
  
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

  // คัดกรองตัวสำรอง (isStarting = false)
  const benchPlayers = mySquad.filter(p => !p.isStarting);

  // กรองตามตำแหน่งที่เลือก
  const filteredBenchPlayers = benchPlayers.filter(p => {
    if (positionFilter === 'ALL') return true;
    return getNormalizedPosGroup(p.position) === positionFilter;
  });

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

  // 🌟 NEW: ฟังก์ชันประกอบร่างข้อมูล ID กับข้อมูลภาพ (Data Enrichment)
  const enrichPlayerData = (squadPlayer) => {
    const fullData = marketPlayers.find(p => String(p.sku) === String(squadPlayer.playerId));
    return {
      ...squadPlayer,
      name: fullData?.name || fullData?.fullName || 'Unknown',
      imageUrl: fullData?.imageUrl || fullData?.image || fullData?.photoURL || null,
      price: fullData?.price || 0,
      stats: fullData?.stats || {}
    };
  };

  return (
    <div className="w-full bg-slate-900 border-t-2 border-slate-700/50 relative shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      
      {/* 🌟 HUD Header (แถบฟิลเตอร์) */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/50 sticky top-0 z-30">
        <div className="flex items-center gap-2 text-slate-300">
          <Users size={16} className="text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider">ม้านั่งสำรอง <span className="text-emerald-400">({benchPlayers.length})</span></span>
        </div>
        
        {/* แถบกรองตำแหน่ง */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700/50">
          <SlidersHorizontal size={12} className="text-slate-500 ml-1" />
          {['ALL', 'FW', 'MF', 'DF', 'GK'].map(pos => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-3 py-1 rounded-md text-[10px] font-black tracking-wider transition-all
                ${positionFilter === pos 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* 🌟 พื้นที่แสดงตัวสำรอง */}
      <div className="relative w-full h-[140px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900">
        
        {/* ลวดลายพื้นหลัง */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        <div className="w-full max-w-2xl relative">
          
          {benchPlayers.length === 0 ? (
            // ❌ กรณีไม่มีตัวสำรองเลย
            <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-in fade-in duration-500">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 shadow-inner border border-slate-700">
                <ShoppingBag size={20} className="text-slate-500" />
              </div>
              <p className="text-slate-400 text-xs font-medium mb-1">ม้านั่งสำรองของคุณว่างเปล่า</p>
              <p className="text-slate-600 text-[10px]">ไปที่ตลาดเพื่อดึงตัวนักเตะเข้าทีม</p>
            </div>
          ) : filteredBenchPlayers.length === 0 ? (
            // ❌ กรณีมีตัวสำรอง แต่กรองแล้วไม่เจอ
            <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-in fade-in duration-300">
              <SearchX size={24} className="text-slate-600 mb-2" />
              <p className="text-slate-400 text-xs font-medium">ไม่มีนักเตะตำแหน่ง <span className="text-emerald-400 font-bold">{positionFilter}</span> บนม้านั่งสำรอง</p>
            </div>
          ) : (
            // ✅ แสดงรายชื่อตัวสำรอง
            <>
              {/* ปุ่มเลื่อนซ้ายขวา (แสดงเฉพาะจอที่เลื่อนได้) */}
              {filteredBenchPlayers.length > 4 && (
                <>
                  <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 bg-gradient-to-r from-slate-900 to-transparent flex items-center justify-start text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={24} />
                  </button>
                  <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-16 bg-gradient-to-l from-slate-900 to-transparent flex items-center justify-end text-slate-400 hover:text-white transition-colors">
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* รางนักเตะ (Scroll Track) */}
              <div ref={scrollRef} className="w-full flex items-center gap-5 sm:gap-6 px-6 sm:px-8 py-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory scroll-smooth relative z-20">
                {filteredBenchPlayers.map((player) => {
                  const isSelected = selectedPlayerId === String(player.playerId);
                  // 🌟 NEW: ประกอบร่างข้อมูลนักเตะแบบเต็มก่อนส่งไป PlayerSlot
                  const enrichedPlayer = enrichPlayerData(player);

                  return (
                    <div key={`bench-${player.playerId}`} className="snap-center relative shrink-0">
                      <PlayerSlot
                        player={enrichedPlayer}
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