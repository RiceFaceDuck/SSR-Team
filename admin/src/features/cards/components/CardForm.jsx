import React from 'react';
import { X, Save, Zap } from 'lucide-react';
import { useCardFormLogic } from '../hooks/useCardFormLogic';
import CardBasicInfoFields from './CardBasicInfoFields';
import CardEffectConfigurator from './CardEffectConfigurator';

export default function CardForm({ initialData, onSave, onCancel }) {
  const { formData, handleChange, handleLogicChange, calculateSmartPrice, handleSubmit } =
    useCardFormLogic(initialData, onSave);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/50">
        <div className="flex justify-between items-center p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-800">
            <Zap className="text-purple-500" />
            {initialData ? 'แก้ไขการ์ด' : 'สร้างการ์ดใหม่'}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-white/50 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <CardBasicInfoFields formData={formData} handleChange={handleChange} />

          <CardEffectConfigurator
            formData={formData}
            handleLogicChange={handleLogicChange}
            calculateSmartPrice={calculateSmartPrice}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 shadow-sm"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-bold text-slate-700 cursor-pointer select-none"
            >
              เปิดใช้งานให้ผู้เล่นมองเห็น (Active)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 font-bold text-slate-500 bg-white/80 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95 shadow-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-purple-600/20 active:scale-95 flex items-center gap-2 transition-all"
            >
              <Save size={18} />
              บันทึกข้อมูล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
