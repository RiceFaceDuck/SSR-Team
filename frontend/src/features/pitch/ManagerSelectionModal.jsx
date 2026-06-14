import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../store/useUserStore';
import { managerService } from '../../services/firebase/managerService';
import { toast } from '../../utils/toast';
import ManagerHeader from './components/manager/ManagerHeader';
import ManagerList from './components/manager/ManagerList';

export default function ManagerSelectionModal({ isOpen, onClose }) {
  const [activeManagers, setActiveManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('INVENTORY'); // 'INVENTORY' | 'SHOP'
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { userData, balls, manager, setManager, ownedManagers, isInventoryLoaded, loadInventory, buyManager } = useUserStore();
  const uid = userData?.uid;

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      setIsLoading(true);
      if (uid && !isInventoryLoaded) {
        await loadInventory(uid);
      }
      const data = await managerService.fetchActiveManagers();
      setActiveManagers(data);
      setIsLoading(false);
    };
    fetchData();
  }, [isOpen, uid, isInventoryLoaded, loadInventory]);

  if (!isOpen) return null;

  const handleSelect = (managerObj) => {
    setManager(managerObj);
    toast.success('แต่งตั้งผู้จัดการทีมเรียบร้อย!');
    onClose();
  };

  const handleBuy = async (managerObj) => {
    if (!uid) {
      toast.error('กรุณาล็อกอินก่อนซื้อผู้จัดการทีม');
      return;
    }
    if (balls < (managerObj.price || 0)) {
      toast.error('Balls ของคุณไม่เพียงพอ!');
      return;
    }
    
    setIsProcessing(true);
    const result = await buyManager(uid, managerObj.id, managerObj.price || 0);
    setIsProcessing(false);
    
    if (result.success) {
      toast.success(`ซื้อ ${managerObj.name} เข้าคลังสำเร็จ!`);
      // Optionally switch to INVENTORY tab
      setActiveTab('INVENTORY');
    } else {
      toast.error(result.message || 'เกิดข้อผิดพลาดในการซื้อ');
    }
  };

  const ownedMList = activeManagers.filter(m => ownedManagers.includes(m.id));
  const shopMList = activeManagers.filter(m => !ownedManagers.includes(m.id));

  const displayList = activeTab === 'INVENTORY' ? ownedMList : shopMList;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040f1d]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a192f] border border-[#1e3a8a] rounded-2xl w-full max-w-2xl shadow-[0_0_40px_rgba(30,58,138,0.5)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <ManagerHeader 
          balls={balls}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
          ownedCount={ownedMList.length}
        />

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0a192f]">
          <ManagerList 
            isLoading={isLoading}
            displayList={displayList}
            activeTab={activeTab}
            managerId={manager?.id}
            balls={balls}
            isProcessing={isProcessing}
            handleSelect={handleSelect}
            handleBuy={handleBuy}
          />
        </div>

      </div>
    </div>
  );
}
