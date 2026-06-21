import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';
import PowerCardHeader from './components/powerCard/PowerCardHeader';
import PowerCardList from './components/powerCard/PowerCardList';
import { formatPlayerName } from '../../utils/formatters';

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
        <PowerCardHeader 
          balls={balls}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
          playerName={formatPlayerName(player.name)}
        />

        {/* List Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#0a192f]">
          <PowerCardList 
            displayList={displayList}
            activeTab={activeTab}
            equippedCardId={equippedCardId}
            ownedCards={ownedCards}
            isProcessing={isProcessing}
            balls={balls}
            handleEquip={handleEquip}
            handleUnequip={handleUnequip}
            handleBuy={handleBuy}
          />
        </div>

      </div>
    </div>
  );
}