import React from 'react';
import { Zap, Clock } from 'lucide-react';

const RewardEconomy = ({ formData, handleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">มูลค่าและสต็อก (Economy)</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ราคา (Balls ⚽) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">จำนวนคงเหลือ (Stock) <span className="text-red-500">*</span></label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">การตั้งค่าพิเศษ (Gamification)</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ประเภทไอเทม</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all cursor-pointer"
          >
            <option value="normal">แลกเปลี่ยนปกติ (Normal)</option>
            <option value="gacha">กล่องสุ่ม (Mystery Gacha)</option>
          </select>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isFlashSale"
              checked={formData.isFlashSale}
              onChange={handleChange}
              className="w-5 h-5 text-amber-500 bg-white border-slate-300 rounded focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
            />
            <span className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
              <Zap size={16} /> เปิดโหมดจำกัดเวลา (Flash Sale)
            </span>
          </label>

          {formData.isFlashSale && (
            <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Clock size={12} /> สิ้นสุดวันที่และเวลา
              </label>
              <input
                type="datetime-local"
                name="flashSaleEndTime"
                value={formData.flashSaleEndTime}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700/50 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm"
              />
            </div>
          )}
        </div>

        {/* สถานะการมองเห็น */}
        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <div className="relative">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">เปิดใช้งาน (ให้ผู้เล่นเห็น)</span>
        </label>
      </div>
    </div>
  );
};

export default RewardEconomy;
