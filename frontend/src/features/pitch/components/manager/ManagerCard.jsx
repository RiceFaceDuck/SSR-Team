import React from 'react';
import { CheckCircle, Shield, Coins, LayoutGrid, Lock } from 'lucide-react';

const ManagerCard = ({ m, isSelected, activeTab, balls, isProcessing, handleSelect, handleBuy }) => {
  const getIcon = (type) => {
    if (type?.includes('DEF')) return <Shield className="text-[#3b82f6]" size={16} />;
    if (type?.includes('BUDGET')) return <Coins className="text-[#fbbf24]" size={16} />;
    if (type?.includes('FORMATION')) return <LayoutGrid className="text-[#10b981]" size={16} />;
    return <CheckCircle className="text-gray-400" size={16} />;
  };

  return (
    <div 
      className={`relative flex flex-col rounded-xl border-2 transition-all duration-300 ${
        isSelected 
          ? 'border-[#3b82f6] bg-[#3b82f6]/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
          : 'border-[#1e3a8a] bg-[#0f284e]'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-[#3b82f6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
          SELECTED
        </div>
      )}

      <div className="p-4 flex items-start gap-4 flex-1">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-tr from-[#1e3a8a] to-[#3b82f6] p-0.5 shrink-0 shadow-lg">
          <div className="w-full h-full bg-[#0a192f] rounded-full overflow-hidden flex items-center justify-center">
            {m.avatarUrl ? (
              <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-white">{m.name?.charAt(0)}</span>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-base font-bold text-white mb-1">{m.name}</h3>
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{m.description}</p>
          
          <div className="mt-2 flex items-center gap-1.5 bg-[#040f1d] rounded-md p-1.5 border border-white/5">
            {getIcon(m.effectLogic?.type)}
            <span className="text-[10px] text-gray-300 font-medium truncate" title={m.effectLogic?.type}>
              {m.effectLogic?.type || 'UNKNOWN EFFECT'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 mt-auto">
        {activeTab === 'INVENTORY' ? (
          <button 
            onClick={() => handleSelect(m)}
            disabled={isSelected}
            className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
              isSelected 
                ? 'bg-[#3b82f6]/20 text-[#3b82f6] cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
            }`}
          >
            {isSelected ? 'ใช้งานอยู่' : 'เลือกใช้งาน'}
          </button>
        ) : (
          <button 
            onClick={() => handleBuy(m)}
            disabled={isProcessing || balls < (m.price || 0)}
            className={`w-full py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              balls >= (m.price || 0)
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span className="animate-pulse">กำลังซื้อ...</span>
            ) : balls >= (m.price || 0) ? (
              <><span>ซื้อ</span> <span className="bg-black/20 px-2 py-0.5 rounded text-xs">🪙 {m.price || 0} Balls</span></>
            ) : (
              <><Lock size={14}/> <span>Balls ไม่พอ ({m.price || 0})</span></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ManagerCard;
