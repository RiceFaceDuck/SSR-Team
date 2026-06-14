import React from 'react';
import { Trash2, Edit2, Zap, Image as ImageIcon } from 'lucide-react';

export default function RewardTable({ filteredRewards, handleEdit, handleDeleteRequest }) {
  return (
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
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 font-mono font-medium text-amber-600 dark:text-amber-400">
                  ⚽ {reward.price.toLocaleString()}
                </div>
              </td>
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
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2">
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
                  {reward.isFlashSale && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 w-fit">
                      <Zap size={10} /> Flash Sale
                    </span>
                  )}
                </div>
              </td>
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
  );
}
