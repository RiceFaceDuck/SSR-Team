import React from 'react';
import { Trash2, Database, FileSpreadsheet } from 'lucide-react';

const OverlapPlayerItem = ({ player, onDelete, disabled }) => {
  const isApi = player.sku?.startsWith('API-');

  return (
    <div className={`p-4 rounded-xl border shadow-sm flex flex-col transition-colors ${
      isApi ? 'bg-emerald-50/30 border-emerald-200' : 'bg-white border-rose-100 hover:border-rose-300'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={player.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
            alt={player.name} 
            className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200" 
          />
          <div>
            <p className="font-bold text-gray-900 text-sm flex items-center gap-1">
              {player.name}
              {isApi ? (
                <Database className="w-3 h-3 text-emerald-600 ml-1" title="ข้อมูลจาก API" />
              ) : (
                <FileSpreadsheet className="w-3 h-3 text-amber-600 ml-1" title="ข้อมูลจาก Excel" />
              )}
            </p>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{player.fullName}</p>
          </div>
        </div>
      </div>
      <div className="space-y-1 mb-4 flex-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">SKU:</span>
          <span className={`font-mono font-bold ${isApi ? 'text-emerald-700' : 'text-gray-700'}`}>
            {player.sku}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">ทีม/ตำแหน่ง:</span>
          <span className="font-medium text-gray-700">{player.team} - {player.position}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Document ID:</span>
          <span className="font-mono text-gray-400 text-[10px] truncate max-w-[100px]">{player.id}</span>
        </div>
      </div>
      <button 
        onClick={() => onDelete(player.id)} 
        disabled={disabled}
        className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Trash2 className="w-4 h-4" /> ลบรายการนี้
      </button>
    </div>
  );
};

export default OverlapPlayerItem;
