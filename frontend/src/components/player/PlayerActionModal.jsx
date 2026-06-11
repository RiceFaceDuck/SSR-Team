/**
 * @file PlayerActionModal.jsx
 * @description UI Component สำหรับป๊อปอัปยืนยันการซื้อ-ขายนักเตะ
 * สไตล์ Glassmorphism โทนสว่าง เน้นความพรีเมียม และป้องกันผู้เล่นกดปุ่มพลาด
 */

import React from 'react';
import { X, ShoppingCart, Tag, Coins, Star, ShieldAlert } from 'lucide-react';
import PositionBadge from './PositionBadge';

/**
 * @param {boolean} isOpen - สถานะการเปิด/ปิด Modal
 * @param {Function} onClose - ฟังก์ชันเมื่อกดยกเลิก หรือ ปิด
 * @param {Object} player - ข้อมูลนักเตะที่ถูกเลือก
 * @param {string} actionType - ประเภทการกระทำ ('buy' หรือ 'sell')
 * @param {Function} onConfirm - ฟังก์ชันเมื่อกดยืนยันการทำรายการ
 */
export default function PlayerActionModal({ isOpen, onClose, player, actionType = 'buy', onConfirm }) {
  if (!isOpen || !player) return null;

  const isBuy = actionType === 'buy';
  
  // กำหนดสไตล์ตามประเภทการทำรายการ (ซื้อ = โทนน้ำเงิน/คราม, ขาย = โทนแดง/ส้ม)
  const theme = {
    color: isBuy ? 'text-indigo-600' : 'text-rose-600',
    bgLight: isBuy ? 'bg-indigo-50' : 'bg-rose-50',
    btnPrimary: isBuy 
      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-indigo-500/30' 
      : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/30',
    icon: isBuy ? <ShoppingCart size={20} /> : <Tag size={20} />,
    title: isBuy ? 'CONFIRM SIGN' : 'CONFIRM RELEASE',
    actionText: isBuy ? 'SIGN' : 'RELEASE'
  };

  return (
    // Backdrop (พื้นหลังเบลอ)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-sm rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className={`relative p-6 pb-8 ${theme.bgLight} border-b border-white/50`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full text-slate-500 transition-colors shadow-sm"
          >
            <X size={16} strokeWidth={3} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className={`p-3 bg-white rounded-2xl shadow-sm ${theme.color}`}>
              {theme.icon}
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${theme.color}`}>
                {theme.title}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {isBuy ? 'หักงบประมาณสโมสรเพื่อเซ็นสัญญานักเตะ' : 'รับงบประมาณคืนจากการปล่อยตัวนักเตะ'}
              </p>
            </div>
          </div>
        </div>

        {/* Player Info Card (ซ้อนทับ Header ลงมานิดหน่อยให้ดูมีมิติ) */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 flex items-center gap-4">
            {/* รูปจำลองนักเตะ */}
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200 shrink-0">
              <span className="text-lg font-black text-slate-300">{player.name.charAt(0)}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-800 text-base truncate">{player.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <PositionBadge position={player.position} />
                <span className="text-xs font-medium text-slate-500 truncate">{player.team}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Price Section */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-green-500 shadow-sm"><Coins size={16}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ราคา</p>
                <p className="text-sm font-black text-slate-700">£{player.price?.toFixed(1) || '0.0'}m</p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl text-blue-500 shadow-sm"><Star size={16}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">คะแนนรวม</p>
                <p className="text-sm font-black text-slate-700">{player.totalPoints || 0} Pts</p>
              </div>
            </div>
          </div>

          {/* Action Warning */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <p className="text-xs font-medium">
              {isBuy 
                ? 'โปรดตรวจสอบงบประมาณของสโมสรให้แน่ใจก่อนทำการเซ็นสัญญา' 
                : 'เมื่อปล่อยตัวแล้ว คุณสามารถเซ็นสัญญากลับมาใหม่ได้ในราคาปัจจุบัน'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
          >
            CANCEL
          </button>
          <button 
            onClick={() => {
              onConfirm(player);
              onClose();
            }}
            className={`flex-1 py-3.5 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg ${theme.btnPrimary}`}
          >
            {theme.actionText}
          </button>
        </div>

      </div>
    </div>
  );
}