/**
 * @file PlayerRow.jsx
 * @description UI Component สำหรับแสดงแถวข้อมูลนักเตะ 1 คนในหน้าตลาดซื้อขาย
 * อัปเกรด (Phase 3 - Tap & Place): เปลี่ยนจากระบบลากวาง เป็นระบบแตะ (Tap) เพื่อเปิด Bottom Sheet
 */

import React from 'react';
import { useUserStore } from '../../store/useUserStore';
import PositionBadge from '../../components/player/PositionBadge';
import { formatPlayerName, formatTeamShortName } from '../../utils/formatters';

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
  const playerImageUrl = player.imageUrl || player.image || defaultSilhouette;


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
      // ฝัง Event รับการคลิก (Tap) ไว้ที่ตัวกรอบนอกสุดของการ์ด แทนระบบเซ็นเซอร์ลากเดิม
      onClick={handleRowClick}
      // เปลี่ยนจาก cursor-grab เป็น cursor-pointer และเพิ่ม active:scale-[0.98] ให้ปุ่มยุบตัวนิดนึงตอนกด
      className="bg-white p-3 rounded-lg shadow-[0_4px_12px_rgb(0,0,0,0.06)] border border-slate-300 hover:shadow-[0_8px_24px_rgb(0,0,0,0.12)] hover:border-indigo-400 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group select-none cursor-pointer active:scale-[0.98]"
    >
      
      {/* ฝั่งซ้าย: รูป, ชื่อ, ตำแหน่ง, ทีม */}
      <div className="flex items-center gap-4 overflow-hidden pointer-events-none">
        
        {/* รูปจำลองนักเตะ รองรับทั้งรูปภาพจริงและคาแรคเตอร์การ์ตูน */}
        <div className="relative w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-indigo-300 transition-colors shadow-sm overflow-hidden">
          <img 
            src={playerImageUrl} 
            alt={player.name} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = defaultSilhouette; }}
          />
        </div>
        
        <div className="min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
            {formatPlayerName(player.name)}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <PositionBadge position={player.position} />
            <p className="text-[10px] text-slate-500 font-bold truncate max-w-[100px] sm:max-w-[150px] uppercase">
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
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center leading-none ${player.priceDiff > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {player.priceDiff > 0 ? '▲' : '▼'}{Math.abs(player.priceDiff).toFixed(1)}
              </span>
            ) : null}
            <p className="font-black text-sm text-indigo-600 leading-none">
              {player.price?.toFixed(1) || '0.0'}m
            </p>
          </div>
          <div className="flex items-center gap-1">
            {player.formStatus === 'HOT' && <span title="ฟอร์มกำลังร้อนแรง" className="text-[10px]">🔥</span>}
            {player.formStatus === 'COLD' && <span title="ฟอร์มตก" className="text-[10px]">❄️</span>}
            <span className="text-[10px] font-bold text-slate-500 leading-none">
              {player.totalPoints || 0} Pts
            </span>
          </div>
        </div>
        
        {/* ปุ่ม ซื้อ/ขาย 
            ใส่ e.stopPropagation() ที่ทุก Event เพื่อป้องกันไม่ให้การกดปุ่มไปกระตุ้น handleRowClick (การเปิด Bottom Sheet)
        */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (onActionClick) onActionClick(player, isInSquad ? 'sell' : 'buy');
          }}
          className={`px-4 py-2 rounded-md text-xs font-bold transition-all active:scale-90 relative z-10 border
            ${isInSquad 
              ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-500 shadow-sm' 
              : 'bg-gradient-to-b from-[#3b82f6] to-[#2563eb] text-white hover:from-[#60a5fa] hover:to-[#3b82f6] border-[#1e40af] shadow-[0_2px_10px_rgba(59,130,246,0.3)]'
            }`}
        >
          {isInSquad ? 'ใช้งานอยู่' : 'เลือก'}
        </button>
      </div>

    </div>
  );
}