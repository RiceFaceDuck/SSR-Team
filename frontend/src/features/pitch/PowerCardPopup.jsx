import React, { useEffect, useState } from 'react';
import { X, ShoppingCart, Archive, Lock } from 'lucide-react';
import { STYLES } from '../../config/theme';
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function PowerCardPopup({ isOpen, onClose, player }) {
  const { 
    userData, balls, availableCards, fetchCards, equipCard, removeCard, 
    ownedCards, isInventoryLoaded, loadInventory, buyCard, consumeCard, restoreCard
  } = useUserStore();
  const uid = userData?.uid;

  const [activeTab, setActiveTab] = useState('INVENTORY'); // INVENTORY | SHOP
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCards();
      if (uid && !isInventoryLoaded) {
        loadInventory(uid);
      }
    }
  }, [isOpen, fetchCards, uid, isInventoryLoaded, loadInventory]);

  if (!isOpen || !player) return null;

  const handleBuy = async (card) => {
    if (!uid) {
      toast.error('กรุณาล็อกอินก่อนซื้อการ์ด');
      return;
    }
    if (balls < (card.price || 0)) {
      toast.error('Balls ของคุณไม่เพียงพอ!');
      return;
    }
    
    setIsProcessing(true);
    const result = await buyCard(uid, card.id, card.price || 0);
    setIsProcessing(false);
    
    if (result.success) {
      toast.success(`ซื้อการ์ด ${card.name} สำเร็จ!`);
      setActiveTab('INVENTORY');
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาดในการซื้อ');
    }
  };

  const handleEquip = async (card) => {
    const amount = ownedCards[card.id] || 0;
    if (amount <= 0) {
      toast.error('คุณไม่มีการ์ดใบนี้ในคลัง');
      return;
    }
    setIsProcessing(true);
    const result = await consumeCard(uid, card.id);
    if (result.success) {
      equipCard(player.playerId, card.id);
      toast.success(`สวมใส่การ์ด ${card.name} สำเร็จ`);
      onClose();
    } else {
      toast.error(result.message || 'ไม่สามารถใช้งานการ์ดได้');
    }
    setIsProcessing(false);
  };

  const handleUnequip = async (cardId) => {
    setIsProcessing(true);
    const result = await restoreCard(uid, cardId);
    if (result.success) {
      removeCard(player.playerId);
      toast.success(`ถอดการ์ดและคืนเข้าคลังสำเร็จ`);
      onClose();
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาด');
    }
    setIsProcessing(false);
  };

  const equippedCardId = player.appliedCardId;

  // Filter lists
  // INVENTORY: show active cards that user owns at least 1, OR the currently equipped card
  const inventoryList = availableCards.filter(c => (ownedCards[c.id] || 0) > 0 || equippedCardId === c.id);
  // SHOP: show all active cards
  const shopList = availableCards;

  const displayList = activeTab === 'INVENTORY' ? inventoryList : shopList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040f1d]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a192f] border border-purple-500/30 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(168,85,247,0.4)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-purple-500/20 bg-[#160d2b]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-wider">
              <span className="text-purple-400">POWER</span> CARDS
            </h2>
            <div className="flex items-center gap-3">
              <div className="bg-[#040f1d] px-2 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5">
                <span className="text-amber-500 text-xs font-bold">🪙</span>
                <span className="text-amber-400 font-bold text-sm">{balls} Balls</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5">
                <X size={18} />
              </button>
            </div>
          </div>
          
          <p className="text-xs text-purple-300/60 mb-4 px-1">เลือกการ์ดเสริมพลังให้กับ <span className="font-bold text-white">{player.name || 'นักเตะ'}</span></p>
          
          {/* Tabs */}
          <div className="flex gap-2 bg-[#040f1d] p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('INVENTORY')}
              className={`flex-1 py-1.5 font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              <Archive size={16} /> คลังการ์ด
            </button>
            <button 
              onClick={() => setActiveTab('SHOP')}
              className={`flex-1 py-1.5 font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'SHOP' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              <ShoppingCart size={16} /> ร้านค้า
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#0a192f]">
          {displayList.length === 0 ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center">
              <Archive size={40} className="mb-2 opacity-30" />
              {activeTab === 'INVENTORY' ? 'คุณยังไม่มีการ์ดในคลัง\nแวะไปร้านค้าสิ!' : 'กำลังโหลดข้อมูลการ์ด... หรือไม่มีการ์ดขายในขณะนี้'}
            </div>
          ) : (
            displayList.map(card => {
              const isEquipped = equippedCardId === card.id;
              const amountOwned = ownedCards[card.id] || 0;
              
              return (
                <div key={card.id} className={`border-2 p-3 rounded-xl flex flex-col gap-3 transition-colors ${
                  isEquipped 
                    ? 'bg-purple-900/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                    : 'bg-[#0f284e] border-[#1e3a8a]'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl drop-shadow-md">{card.icon || '⚡'}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-bold ${isEquipped ? 'text-purple-300' : 'text-white'}`}>{card.name}</h4>
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
                      <p className={`text-[11px] leading-relaxed mt-1 ${isEquipped ? 'text-purple-200/70' : 'text-slate-400'}`}>
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
                        {isProcessing ? 'กำลังซื้อ...' : balls >= (card.price || 0) ? (
                           <>ซื้อการ์ด <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs ml-1">🪙 {card.price || 0} Balls</span></>
                        ) : (
                           <><Lock size={14}/> Balls ไม่พอ ({card.price || 0})</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}