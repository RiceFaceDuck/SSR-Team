import React from 'react';
import { Archive } from 'lucide-react';
import PowerCardItem from './PowerCardItem';

const PowerCardList = ({
  displayList,
  activeTab,
  equippedCardId,
  ownedCards,
  isProcessing,
  balls,
  handleEquip,
  handleUnequip,
  handleBuy,
}) => {
  if (displayList.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 flex flex-col items-center">
        <Archive size={40} className="mb-2 opacity-30" />
        {activeTab === 'INVENTORY'
          ? 'คุณยังไม่มีการ์ดในคลัง\nแวะไปร้านค้าสิ!'
          : 'กำลังโหลดข้อมูลการ์ด... หรือไม่มีการ์ดขายในขณะนี้'}
      </div>
    );
  }

  return (
    <>
      {displayList.map((card) => {
        const isEquipped = equippedCardId === card.id;
        const amountOwned = ownedCards[card.id] || 0;

        return (
          <PowerCardItem
            key={card.id}
            card={card}
            activeTab={activeTab}
            isEquipped={isEquipped}
            amountOwned={amountOwned}
            isProcessing={isProcessing}
            balls={balls}
            handleEquip={handleEquip}
            handleUnequip={handleUnequip}
            handleBuy={handleBuy}
            equippedCardId={equippedCardId}
          />
        );
      })}
    </>
  );
};

export default PowerCardList;
