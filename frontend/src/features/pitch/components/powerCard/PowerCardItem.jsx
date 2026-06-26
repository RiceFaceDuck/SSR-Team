import React from 'react';
import { Lock } from 'lucide-react';

const PowerCardItem = ({
  card,
  activeTab,
  isEquipped,
  amountOwned,
  isProcessing,
  balls,
  handleEquip,
  handleUnequip,
  handleBuy,
  equippedCardId,
}) => {
  return (
    <div
      className={`border-2 p-3 rounded-xl flex flex-col gap-3 transition-colors ${
        isEquipped
          ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
          : 'bg-[#0f284e] border-[#1e3a8a]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl drop-shadow-md">{card.icon || '⚡'}</span>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className={`font-bold ${isEquipped ? 'text-purple-300' : 'text-white'}`}>
              {card.name}
            </h4>
            {activeTab === 'INVENTORY' && !isEquipped && (
              <span className="bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded text-xs font-bold border border-purple-500/50">
                มี {amountOwned} ใบ
              </span>
            )}
            {isEquipped && (
              <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
                สวมใส่อยู่
              </span>
            )}
          </div>
          <p
            className={`text-[11px] leading-relaxed mt-1 ${isEquipped ? 'text-purple-200/70' : 'text-slate-400'}`}
          >
            {card.description}
          </p>
        </div>
      </div>

      {/* Button Area depending on tab */}
      <div className="flex justify-end pt-1 border-t border-white/5">
        {activeTab === 'INVENTORY' ? (
          isEquipped ? (
            <button
              onClick={() => handleUnequip(card.id)}
              disabled={isProcessing}
              className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex justify-center items-center gap-2"
            >
              {isProcessing ? 'กำลังประมวลผล...' : 'ถอดการ์ดเก็บ'}
            </button>
          ) : (
            <button
              onClick={() => handleEquip(card)}
              disabled={isProcessing || amountOwned <= 0 || equippedCardId != null}
              className={`w-full sm:w-auto text-xs font-bold px-4 py-2 rounded-lg transition-colors flex justify-center items-center gap-2 ${
                amountOwned > 0 && !equippedCardId
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {equippedCardId ? 'นักเตะใส่การ์ดได้ใบเดียว' : 'ติดตั้งใช้งาน'}
            </button>
          )
        ) : (
          /* SHOP Tab Actions */
          <button
            onClick={() => handleBuy(card)}
            disabled={isProcessing || balls < (card.price || 0)}
            className={`w-full text-sm font-bold px-4 py-2 rounded-lg transition-colors flex justify-center items-center gap-2 ${
              balls >= (card.price || 0)
                ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {isProcessing ? (
              'กำลังซื้อ...'
            ) : balls >= (card.price || 0) ? (
              <>
                ซื้อการ์ด{' '}
                <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs ml-1">
                  🪙 {card.price || 0} Balls
                </span>
              </>
            ) : (
              <>
                <Lock size={14} /> Balls ไม่พอ ({card.price || 0})
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PowerCardItem;
