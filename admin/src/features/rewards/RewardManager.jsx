import React, { useState, useEffect, useMemo } from 'react';
import { useRewardStore } from '../../store/rewardStore';
import RewardFormModal from './RewardFormModal';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  PackageOpen, 
  Zap, 
  AlertTriangle,
  RefreshCw,
  Box,
  Image as ImageIcon
} from 'lucide-react';

// Component สำหรับยืนยันการลบ (แทนการใช้ window.confirm)
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500 w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">ยืนยันการลบ?</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            คุณแน่ใจหรือไม่ว่าต้องการลบ <span className="font-semibold text-slate-700 dark:text-slate-300">"{itemName}"</span>? <br/>การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {isDeleting ? 'กำลังลบ...' : 'ลบข้อมูล'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ไอเทม</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ราคา (Balls)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">สต็อกคงเหลือ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    {/* Column 1: Item Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                          {reward.imageUrl ? (
                            <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="text-slate-400" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            {reward.name}
                            {reward.type === 'gacha' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">GACHA</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            {reward.description || 'ไม่มีรายละเอียด'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Price */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono font-medium text-amber-600 dark:text-amber-400">
                        ⚽ {reward.price.toLocaleString()}
                      </div>
                    </td>

                    {/* Column 3: Stock */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        reward.stock > 10 
                          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                          : reward.stock > 0
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                      }`}>
                        {reward.stock > 0 ? `${reward.stock} ชิ้น` : 'Out of Stock'}
                      </div>
                    </td>

                    {/* Column 4: Status */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {/* Active Status */}
                        {reward.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            เปิดใช้งาน
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                            ซ่อนจากร้านค้า
                          </span>
                        )}

                        {/* Flash Sale Status */}
                        {reward.isFlashSale && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 w-fit">
                            <Zap size={10} /> Flash Sale
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Column 5: Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(reward)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(reward)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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