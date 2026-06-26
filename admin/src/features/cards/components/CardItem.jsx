import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function CardItem({ card, onEdit, onDelete }) {
  const rarity = card.rarity || 'COMMON';

  const getRarityStyles = () => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'border-amber-300 hover:border-amber-500 hover:shadow-amber-200/50 hover:shadow-lg bg-gradient-to-br from-white to-amber-50/40 ring-1 ring-amber-100/50';
      case 'EPIC':
        return 'border-purple-300 hover:border-purple-500 hover:shadow-purple-200/50 hover:shadow-lg bg-gradient-to-br from-white to-purple-50/40';
      case 'RARE':
        return 'border-blue-300 hover:border-blue-500 hover:shadow-blue-200/50 hover:shadow-md bg-gradient-to-br from-white to-blue-50/30';
      case 'COMMON':
      default:
        return 'border-slate-200 hover:border-slate-400 hover:shadow-md bg-white';
    }
  };

  const getRarityBadge = () => {
    switch (rarity) {
      case 'LEGENDARY':
        return 'bg-amber-500 text-white shadow-sm shadow-amber-500/30';
      case 'EPIC':
        return 'bg-purple-500 text-white shadow-sm shadow-purple-500/30';
      case 'RARE':
        return 'bg-blue-500 text-white shadow-sm shadow-blue-500/30';
      case 'COMMON':
      default:
        return 'bg-slate-200 text-slate-600';
    }
  };

  return (
    <div
      className={`border rounded-2xl p-5 transition-all duration-300 group flex flex-col h-full relative overflow-hidden ${getRarityStyles()}`}
    >
      {/* Rarity Glow Effect */}
      {rarity === 'LEGENDARY' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 blur-2xl rounded-full pointer-events-none -mr-10 -mt-10"></div>
      )}

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="w-12 h-12 bg-slate-100/80 backdrop-blur-sm border border-slate-200/50 text-2xl flex items-center justify-center rounded-xl shadow-sm">
          {card.icon || '⚡'}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-2 py-0.5 text-[9px] font-black tracking-wider rounded-md uppercase ${getRarityBadge()}`}
          >
            {rarity}
          </span>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${card.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
          >
            {card.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="text-lg font-black text-slate-800 pr-2 leading-tight">{card.name}</h3>
        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold whitespace-nowrap shadow-sm">
          🪙 {card.price || 0}
        </span>
      </div>

      <p className="text-sm text-slate-500 mb-4 flex-1 relative z-10 leading-relaxed">
        {card.description}
      </p>

      <div className="bg-slate-50/80 backdrop-blur-sm p-2.5 rounded-lg border border-slate-200/80 mb-4 text-xs font-mono text-slate-600 relative z-10">
        <span className="font-bold text-slate-400 mr-2">LOGIC:</span>
        {card.effectLogic?.type}
        {card.effectLogic?.value ? ` (${card.effectLogic.value})` : ''}
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100/80 opacity-0 group-hover:opacity-100 transition-opacity relative z-10 mt-auto">
        <button
          onClick={() => onEdit(card)}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors"
        >
          <Edit2 size={16} /> แก้ไข
        </button>
        <button
          onClick={() => onDelete(card.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-bold transition-colors"
        >
          <Trash2 size={16} /> ลบ
        </button>
      </div>
    </div>
  );
}
