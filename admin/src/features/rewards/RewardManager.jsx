import React, { useState, useEffect, useMemo } from 'react';
import { useRewardStore } from '../../store/rewardStore';
import RewardFormModal from './RewardFormModal';
import RewardTable from './components/RewardTable';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { 
  Plus, 
  Search, 
  PackageOpen, 
  RefreshCw,
  Box
} from 'lucide-react';

const RewardManager = () => {
  // ดึง State และ Action จาก Zustand Store
  const { rewards, isLoading, error, fetchRewards, deleteReward } = useRewardStore();

  // Local States
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [rewardToEdit, setRewardToEdit] = useState(null);
  
  // State สำหรับ Delete Modal
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // โหลดข้อมูลเมื่อ Component ถูก Mount
  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  // กรองข้อมูลตามคำค้นหา (Search)
  const filteredRewards = useMemo(() => {
    if (!searchQuery) return rewards;
    return rewards.filter(reward => 
      reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rewards, searchQuery]);

  const handleAddNew = () => {
    setRewardToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (reward) => {
    setRewardToEdit(reward);
    setIsFormModalOpen(true);
  };

  const handleDeleteRequest = (reward) => {
    setItemToDelete(reward);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteReward(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error("Failed to delete", err);
      // ในระบบจริงอาจจะโชว์ Toast error ตรงนี้
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PackageOpen className="text-blue-500" />
            จัดการของรางวัล (Store Manager)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            เพิ่ม ลบ แก้ไข และจัดการสต็อกของรางวัลในระบบ
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
        >
          <Plus size={18} />
          เพิ่มของรางวัลใหม่
        </button>
      </div>

      {/* Control Bar (Search & Filter) */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-slate-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="ค้นหาชื่อของรางวัล หรือประเภท..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-white text-sm"
          />
        </div>
        
        <div className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          พบของรางวัลทั้งหมด <span className="font-bold text-slate-800 dark:text-white">{filteredRewards.length}</span> รายการ
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        {/* Loading State */}
        {isLoading && rewards.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="animate-spin mb-4" size={32} />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10">
            <p>เกิดข้อผิดพลาด: {error}</p>
            <button onClick={fetchRewards} className="mt-4 underline hover:text-red-600">ลองใหม่อีกครั้ง</button>
          </div>
        ) : filteredRewards.length === 0 ? (
          /* Empty State */
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 text-center">
            <Box size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">ไม่พบข้อมูลของรางวัล</p>
            <p className="text-sm mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มของรางวัลใหม่</p>
          </div>
        ) : (
          /* Table Content */
          <RewardTable 
            filteredRewards={filteredRewards} 
            handleEdit={handleEdit} 
            handleDeleteRequest={handleDeleteRequest} 
          />
        )}
      </div>

      {/* Modals */}
      <RewardFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        rewardToEdit={rewardToEdit}
      />

      <DeleteConfirmModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name}
        isDeleting={isDeleting}
      />

    </div>
  );
};

export default RewardManager;