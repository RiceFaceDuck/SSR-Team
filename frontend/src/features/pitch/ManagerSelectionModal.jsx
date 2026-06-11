import React, { useEffect, useState } from 'react';
import { X, CheckCircle, Shield, Coins, LayoutGrid } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { managerService } from '../../services/firebase/managerService';
import { toast } from '../../utils/toast';

const mockManagers = [
  { id: 'A', name: 'Arthur Shield', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A', effectLogic: { type: 'DEF_CLEAN_SHEET_BONUS', value: 2 }, description: 'กองหลังได้รับ +2 คะแนน เมื่อทำคลีนชีตสำเร็จ' },
  { id: 'B', name: 'Victor Wealth', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B', effectLogic: { type: 'BUDGET_BONUS', value: 25 }, description: 'เพิ่มงบประมาณสโมสรในการซื้อนักเตะ +25M' },
  { id: 'C', name: 'Prof. Tacticus', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C', effectLogic: { type: 'UNLOCK_FORMATION' }, description: 'ปลดล็อกแผนการเล่นพิเศษเพื่อใช้จัดทีม' },
  { id: 'D', name: 'Max Firepower', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=D', effectLogic: { type: 'FW_GOAL_FEST_BONUS', value: 2 }, description: 'กองหน้าได้รับ +2 คะแนน เมื่อทีมยิงได้ 3 ประตูขึ้นไป' },
  { id: 'E', name: 'Simon Synergy', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=E', effectLogic: { type: 'CLUB_SYNERGY_BONUS', value: 1 }, description: 'นักเตะที่มาจากสโมสรเดียวกัน 3 คนขึ้นไป ได้รับโบนัสคนละ +1 คะแนน' },
  { id: 'F', name: 'Nigel Negotiator', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=F', effectLogic: { type: 'MARKET_DISCOUNT', value: 10 }, description: 'ลดราคานักเตะในตลาดซื้อขายลง 10%' },
  { id: 'G', name: 'Master Commander', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=G', effectLogic: { type: 'CAPTAIN_TRIPLE_BONUS' }, description: 'กัปตันทีมจะได้รับโบนัสคะแนนคูณ 3 (จากเดิมคูณ 2)' },
];

export default function ManagerSelectionModal({ isOpen, onClose }) {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { manager, setManager } = useUserStore();

  useEffect(() => {
    if (!isOpen) return;
    const fetchM = async () => {
      setIsLoading(true);
      const data = await managerService.fetchActiveManagers();
      if (data.length > 0) {
        setManagers(data);
      } else {
        setManagers(mockManagers); // fallback for preview
      }
      setIsLoading(false);
    };
    fetchM();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (managerObj) => {
    setManager(managerObj);
    toast.success('แต่งตั้งผู้จัดการทีมเรียบร้อย!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040f1d]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a192f] border border-[#1e3a8a] rounded-2xl w-full max-w-2xl shadow-[0_0_40px_rgba(30,58,138,0.5)] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1e3a8a] flex justify-between items-center bg-[#0f284e]">
          <h2 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
            <span className="text-[#3b82f6]">SELECT</span> MANAGER
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-1.5">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center text-gray-400 py-10">กำลังดึงข้อมูลผู้จัดการ...</div>
          ) : (
            managers.map(m => {
              const isSelected = manager?.id === m.id;
              
              // Icon Helper
              const getIcon = (type) => {
                if (type?.includes('DEF')) return <Shield className="text-[#3b82f6]" size={20} />;
                if (type?.includes('BUDGET')) return <Coins className="text-[#fbbf24]" size={20} />;
                if (type?.includes('FORMATION')) return <LayoutGrid className="text-[#10b981]" size={20} />;
                return <CheckCircle className="text-gray-400" size={20} />;
              };

              return (
                <div 
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                    isSelected 
                      ? 'border-[#3b82f6] bg-[#3b82f6]/10 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                      : 'border-[#1e3a8a] bg-[#0f284e] hover:border-[#3b82f6]/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#3b82f6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-in zoom-in">
                      SELECTED
                    </div>
                  )}

                  <div className="flex items-start gap-4">
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
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#3b82f6] transition-colors">{m.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{m.description}</p>
                      
                      <div className="mt-3 flex items-center gap-2 bg-[#040f1d] rounded-md p-2 border border-white/5">
                        {getIcon(m.effectLogic?.type)}
                        <span className="text-[10px] text-gray-300 font-medium truncate" title={m.effectLogic?.type}>
                          {m.effectLogic?.type || 'UNKNOWN EFFECT'}
                        </span>
                      </div>
                    </div>
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
