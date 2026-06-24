/**
 * @file PlayerRow.jsx
 * @description UI Component สำหรับแสดงแถวข้อมูลนักเตะ 1 คนในหน้าตลาดซื้อขาย
 * อัปเกรด (Phase 3 - Tap & Place): เปลี่ยนจากระบบลากวาง เป็นระบบแตะ (Tap) เพื่อเปิด Bottom Sheet
 */

import React from 'react';
import { useUserStore } from '../../../store/useUserStore';
import PositionBadge from '../../../components/player/PositionBadge';
import { formatPlayerName, formatTeamShortName, getOptimizedImageUrl } from '../../../utils/formatters';

export default function PlayerRow({ player, onActionClick, onClick }) {
  // ดึงรายชื่อนักเตะในทีมปัจจุบัน (mySquad) มาเพื่อตรวจสอบสถานะ
  const mySquad = useUserStore((state) => state.mySquad);

  // If player data is missing, render a Skeleton loader instead of dummy data
  if (!player || !player.sku) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
          <div>
            <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
            <div className="h-3 w-16 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-4 w-12 bg-slate-200 rounded"></div>
          <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  // เช็คว่านักเตะคนนี้ (SKU นี้) มีอยู่ในทีมของเราแล้วหรือยัง?
  const isInSquad = mySquad.some(p => p.playerId === String(player.sku));

  // รูปจำลองนักเตะแบบ Professional Silhouette
  const defaultSilhouette = "https://cdn.discordapp.com/attachments/1182283993883832360/1218206584284577832/player-silhouette.png?ex=65e1dd91&is=65cf6891&hm=4a70b20cb374a24c2ed55c2f37e174eb";
  const playerImageUrl = getOptimizedImageUrl(player.imageUrl || player.image) || defaultSilhouette;


  // ฟังก์ชันรองรับการกด (Tap) ที่ตัวแถวเพื่อส่งข้อมูลไปเปิด Bottom Sheet
  const handleRowClick = () => {
    // 📳 Haptic Feedback: สั่นเบาๆ ให้ความรู้สึกตอบสนองเวลาจิ้มนักเตะ (รองรับบนมือถือ)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
    // ส่งข้อมูลนักเตะกลับไปยัง Component แม่เพื่อเอาไปใช้ต่อ
    if (onClick) {
      onClick(player);
    }
  };

  return (
    <div 
      onClick={handleRowClick}
      className="group relative p-3 rounded-xl overflow-hidden cursor-pointer select-none transition-all duration-300
                 bg-white/80 backdrop-blur-md border border-slate-200/50 
                 shadow-[0_4px_16px_rgb(0,0,0,0.04)]
                 hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)] 
                 hover:border-indigo-300/50 hover:-translate-y-1 active:scale-[0.98]"
    >
      {/* 🌟 Subtle Gradient Glow Effect (Premium Touch) */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/0 via-indigo-50/0 to-indigo-100/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between">
        {/* ฝั่งซ้าย: รูป, ชื่อ, ตำแหน่ง, ทีม */}
        <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
          
          {/* รูปจำลองนักเตะ */}
          <div className="relative w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                          bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/60 
                          group-hover:border-indigo-300 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.2)] 
                          transition-all duration-300 overflow-hidden">
            <img 
              src={playerImageUrl} 
              alt={player.name} 
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { e.target.src = defaultSilhouette; }}
            />
          </div>
          
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-800 text-sm truncate group-hover:text-indigo-700 transition-colors duration-300 tracking-tight">
              {formatPlayerName(player.name)}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <PositionBadge position={player.position} />
              <p className="text-[10px] text-slate-500 font-semibold truncate max-w-[100px] sm:max-w-[150px] uppercase tracking-wider">
                {formatTeamShortName(player.team || player.club || 'UNK')}
              </p>
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: ราคา, คะแนน, ปุ่ม Action */}
        <div className="text-right flex items-center gap-3 shrink-0 pl-2">
          
          <div className="flex flex-col items-end pointer-events-none">
            <div className="flex items-center gap-1.5 mb-1">
              {player.priceDiff && player.priceDiff !== 0 ? (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center leading-none tracking-widest ${player.priceDiff > 0 ? 'bg-emerald-100/80 text-emerald-700' : 'bg-red-100/80 text-red-700'}`}>
                  {player.priceDiff > 0 ? '▲' : '▼'}{Math.abs(player.priceDiff).toFixed(1)}
                </span>
              ) : null}
              <p className="font-black text-[15px] text-indigo-600 leading-none">
                {player.price?.toFixed(1) || '0.0'}<span className="text-xs font-bold text-indigo-400">m</span>
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {player.formStatus === 'HOT' && <span title="ฟอร์มกำลังร้อนแรง" className="text-[10px] animate-pulse">🔥</span>}
              {player.formStatus === 'COLD' && <span title="ฟอร์มตก" className="text-[10px]">❄️</span>}
              <span className="text-[11px] font-bold text-slate-500 leading-none bg-slate-100 px-1.5 py-0.5 rounded">
                {player.totalPoints || 0} Pts
              </span>
            </div>
          </div>
          
          {/* ปุ่ม ซื้อ/ขาย */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (onActionClick) onActionClick(player, isInSquad ? 'sell' : 'buy');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 active:scale-90 relative z-10 
              ${isInSquad 
                ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-[0_2px_8px_rgba(51,65,85,0.3)] border border-slate-600' 
                : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-[0_4px_12px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.4)] border border-indigo-500/50'
              }`}
          >
            {isInSquad ? 'ใช้งานอยู่' : 'เลือก'}
          </button>
        </div>
      </div>
    </div>
  );
}