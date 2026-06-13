import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Shield, Coins, LayoutGrid, ShoppingCart, User, Lock } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { managerService } from '../../services/firebase/managerService';
import { toast } from '../../utils/toast';

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
        <div className="p-4 border-b border-[#1e3a8a] bg-[#0f284e]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
              <span className="text-[#3b82f6]">MANAGER</span> CENTER
            </h2>
            <div className="flex items-center gap-4">
              <div className="bg-[#040f1d] px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-2">
                <span className="text-amber-500 text-xs font-bold">🪙</span>
                <span className="text-amber-400 font-bold">{balls} Balls</span>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5">
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 bg-[#040f1d] p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('INVENTORY')}
              className={`flex-1 py-2 font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              <User size={16} /> คลังของคุณ ({ownedMList.length})
            </button>
            <button 
              onClick={() => setActiveTab('SHOP')}
              className={`flex-1 py-2 font-bold text-sm rounded-md transition-colors flex items-center justify-center gap-2 ${activeTab === 'SHOP' ? 'bg-[#3b82f6] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              <ShoppingCart size={16} /> ร้านค้าผู้จัดการทีม
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0a192f]">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-400 py-10 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
              กำลังดึงข้อมูล...
            </div>
          ) : displayList.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-12 flex flex-col items-center">
               <User size={48} className="mb-2 opacity-50" />
               {activeTab === 'INVENTORY' ? 'คุณยังไม่มีผู้จัดการทีมในคลัง\nกรุณาไปที่ "ร้านค้า" เพื่อซื้อ' : 'ไม่มีผู้จัดการทีมใหม่ให้ซื้อแล้ว'}
            </div>
          ) : (
            displayList.map(m => {
              const isSelected = manager?.id === m.id;
              
              // Icon Helper
              const getIcon = (type) => {
                if (type?.includes('DEF')) return <Shield className="text-[#3b82f6]" size={16} />;
                if (type?.includes('BUDGET')) return <Coins className="text-[#fbbf24]" size={16} />;
                if (type?.includes('FORMATION')) return <LayoutGrid className="text-[#10b981]" size={16} />;
                return <CheckCircle className="text-gray-400" size={16} />;
              };

              return (
                <div 
                  key={m.id}
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
            })
          )}
        </div>

      </div>
    </div>
  );
}
