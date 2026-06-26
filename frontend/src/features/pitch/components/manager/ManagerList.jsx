import React from 'react';
import { User } from 'lucide-react';
import ManagerCard from './ManagerCard';

const ManagerList = ({
  isLoading,
  displayList,
  activeTab,
  managerId,
  balls,
  isProcessing,
  handleSelect,
  handleBuy,
}) => {
  if (isLoading) {
    return (
      <div className="col-span-full text-center text-gray-400 py-10 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
        กำลังดึงข้อมูล...
      </div>
    );
  }

  if (displayList.length === 0) {
    return (
      <div className="col-span-full text-center text-gray-500 py-12 flex flex-col items-center">
        <User size={48} className="mb-2 opacity-50" />
        {activeTab === 'INVENTORY'
          ? 'คุณยังไม่มีผู้จัดการทีมในคลัง\nกรุณาไปที่ "ร้านค้า" เพื่อซื้อ'
          : 'ไม่มีผู้จัดการทีมใหม่ให้ซื้อแล้ว'}
      </div>
    );
  }

  return (
    <>
      {displayList.map((m) => (
        <ManagerCard
          key={m.id}
          m={m}
          isSelected={managerId === m.id}
          activeTab={activeTab}
          balls={balls}
          isProcessing={isProcessing}
          handleSelect={handleSelect}
          handleBuy={handleBuy}
        />
      ))}
    </>
  );
};

export default ManagerList;
