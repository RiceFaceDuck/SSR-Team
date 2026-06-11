import React, { useEffect } from 'react';
import { STYLES } from '../../config/theme';
import { useUserStore } from '../../store/useUserStore';

export default function PowerCardPopup({ isOpen, onClose, player }) {
  const { availableCards, fetchCards, equipCard, removeCard } = useUserStore();

  useEffect(() => {
    if (isOpen) {
      fetchCards();
    }
  }, [isOpen, fetchCards]);

  if (!isOpen || !player) return null;

  // ป็อปอัปที่จะเด้งขึ้นมาเมื่อกดที่ตัวนักเตะ เพื่อติดตั้งการ์ดเสริมพลัง
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className={`${STYLES.card} w-full max-w-sm max-h-[80vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg">ติดตั้งการ์ดพลัง</h3>
          <button onClick={onClose} className="text-slate-400 font-bold p-2">X</button>
        </div>
        <p className="text-xs text-slate-500 mb-4">เลือกการ์ด 1 ใบ เพื่อติดตั้งให้ผู้เล่นคนนี้</p>
        
        {/* รายการการ์ดจากระบบ */}
        <div className="space-y-3">
          {availableCards.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm bg-slate-50 rounded-xl">
              กำลังโหลดข้อมูลการ์ด... หรือยังไม่มีการ์ดในระบบ
            </div>
          ) : (
            <>
              {availableCards.map(card => {
                const isEquipped = player.appliedCardId === card.id;
                
                return (
                  <div key={card.id} className={`border-2 p-3 rounded-2xl flex items-center justify-between transition-colors ${isEquipped ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{card.icon || '⚡'}</span>
                      <div>
                        <h4 className={`font-bold text-sm ${isEquipped ? 'text-purple-700' : 'text-slate-700'}`}>{card.name}</h4>
                        <p className={`text-[10px] ${isEquipped ? 'text-purple-500' : 'text-slate-500'}`}>{card.description}</p>
                      </div>
                    </div>
                    {isEquipped ? (
                      <button 
                        onClick={() => { removeCard(player.playerId); onClose(); }}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors"
                      >
                        ถอดการ์ด
                      </button>
                    ) : (
                      <button 
                        onClick={() => { equipCard(player.playerId, card.id); onClose(); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors"
                      >
                        สวมใส่
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}