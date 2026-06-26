import React from 'react';
import { useManagerFormLogic } from '../hooks/useManagerFormLogic';
import { User, Wand2 } from 'lucide-react';

export default function ManagerForm({ initialData, onClose, onSaved }) {
  const {
    formData,
    isSubmitting,
    error,
    isEditing,
    handleChange,
    calculateSmartPrice,
    handleSubmit,
  } = useManagerFormLogic(initialData, onSaved);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-white/50">
        <div className="flex justify-between items-center p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-800">
            <User className="text-blue-500" />
            {isEditing ? 'แก้ไขข้อมูลผู้จัดการทีม' : 'สร้างผู้จัดการทีมใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-white/50 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 active:scale-95"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                ID (Unique)
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                disabled={isEditing}
                required
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100/50 transition-all bg-white/50 backdrop-blur-sm shadow-sm"
                placeholder="e.g. MGR_A"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                ชื่อผู้จัดการทีม
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                ลิงก์รูปภาพ (Avatar URL)
              </label>
              <input
                type="text"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                ราคา (Balls)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-bold">
                  🪙
                </span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full pl-8 border border-slate-200 rounded-lg p-2 text-amber-600 font-black focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              คำอธิบายความสามารถ
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
            />
          </div>

          <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 shadow-inner">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                ตรรกะผลลัพธ์ Effect Logic (JSON)
              </label>
              <button
                type="button"
                onClick={calculateSmartPrice}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] sm:text-xs font-bold rounded-lg shadow-sm hover:shadow-md hover:from-blue-600 hover:to-cyan-600 active:scale-95 transition-all"
                title="วิเคราะห์และคำนวณราคาเหมาะสมจาก JSON Logic"
              >
                <Wand2 size={12} />
                ประเมินราคาอัจฉริยะ
              </button>
            </div>
            <textarea
              name="effectLogic"
              value={formData.effectLogic}
              onChange={handleChange}
              rows={5}
              className="w-full border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm bg-white/80 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center pt-2 gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActiveMgr"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded shadow-sm"
            />
            <label
              htmlFor="isActiveMgr"
              className="text-sm font-bold text-slate-700 cursor-pointer select-none"
            >
              เปิดใช้งานให้ผู้เล่นมองเห็น (Active)
            </label>
          </div>
        </form>

        <div className="p-6 border-t border-slate-200/50 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 font-bold bg-white/80 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95 shadow-sm"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all font-bold shadow-sm active:scale-95 flex items-center gap-2"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </div>
  );
}
