import React from 'react';
import { X, Save, Zap, Wand2 } from 'lucide-react';
import { useCardFormLogic } from '../hooks/useCardFormLogic';

export default function CardForm({ initialData, onSave, onCancel }) {
  const {
    formData,
    handleChange,
    handleLogicChange,
    calculateSmartPrice,
    handleSubmit
  } = useCardFormLogic(initialData, onSave);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/50">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-800">
            <Zap className="text-purple-500" />
            {initialData ? 'แก้ไขการ์ด' : 'สร้างการ์ดใหม่'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors bg-white/50 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 active:scale-95">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ไอคอน</label>
              <input 
                type="text" 
                name="icon" 
                value={formData.icon} 
                onChange={handleChange} 
                className="w-full text-center text-xl p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
                placeholder="⚡"
                maxLength={2}
                required
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ชื่อการ์ด</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
                placeholder="เช่น กัปตันจอมแบก"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ระดับหายาก</label>
              <select 
                name="rarity" 
                value={formData.rarity} 
                onChange={handleChange} 
                className={`w-full p-2 border rounded-lg outline-none transition-all font-bold text-sm shadow-sm backdrop-blur-sm
                  ${formData.rarity === 'COMMON' ? 'bg-slate-50/80 text-slate-600 border-slate-200' : ''}
                  ${formData.rarity === 'RARE' ? 'bg-blue-50/80 text-blue-700 border-blue-200' : ''}
                  ${formData.rarity === 'EPIC' ? 'bg-purple-50/80 text-purple-700 border-purple-200' : ''}
                  ${formData.rarity === 'LEGENDARY' ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-300' : ''}
                `}
              >
                <option value="COMMON">COMMON (หาง่าย)</option>
                <option value="RARE">RARE (หายาก)</option>
                <option value="EPIC">EPIC (อีปิค)</option>
                <option value="LEGENDARY">LEGENDARY (ตำนาน)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">คำอธิบาย</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
                rows={2}
                placeholder="เช่น คูณ 3 คะแนนสัปดาห์นี้"
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ราคา (Balls)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 font-bold">🪙</span>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange}
                  min="0"
                  className="w-full p-2 pl-8 border border-slate-200 rounded-lg text-amber-600 font-black focus:ring-2 focus:ring-amber-500 outline-none transition-all bg-white/50 backdrop-blur-sm shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">ตรรกะผลลัพธ์ (Effect Logic)</label>
              <button 
                type="button" 
                onClick={calculateSmartPrice}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] sm:text-xs font-bold rounded-lg shadow-sm hover:shadow-md hover:from-purple-600 hover:to-indigo-600 active:scale-95 transition-all"
                title="คำนวณราคาเหมาะสมจากความหายากและตรรกะของการ์ด"
              >
                <Wand2 size={12} />
                ประเมินราคาอัจฉริยะ
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <select 
                  value={formData.effectLogic.type} 
                  onChange={(e) => handleLogicChange('type', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white/80 font-mono focus:ring-2 focus:ring-slate-300 outline-none shadow-sm"
                >
                  <option value="NONE">-- ไม่ระบุ Logic --</option>
                  <option value="TRIPLE_CAPTAIN">TRIPLE_CAPTAIN (กัปตัน x3)</option>
                  <option value="BENCH_BOOST">BENCH_BOOST (สำรองรับทรัพย์)</option>
                  <option value="IMMUNE_YELLOW">IMMUNE_YELLOW (กันใบเหลือง)</option>
                  <option value="PRICE_REDUCTION">PRICE_REDUCTION (ลดค่าตัว)</option>
                  <option value="NOT_SUBBED_BONUS">NOT_SUBBED_BONUS (โบนัสตัวจริง)</option>
                  <option value="POINTS_MULTIPLIER">POINTS_MULTIPLIER (คูณคะแนน)</option>
                  <option value="CUSTOM">CUSTOM (พิมพ์กำหนดเอง)</option>
                </select>
                {formData.effectLogic.type === 'CUSTOM' && (
                  <input
                    type="text"
                    value={formData.effectLogic.customType || ''}
                    onChange={(e) => handleLogicChange('customType', e.target.value.toUpperCase())}
                    className="w-full p-2 mt-2 border border-blue-200 bg-blue-50/50 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-400 outline-none shadow-inner"
                    placeholder="e.g., DOUBLE_CLEAN_SHEET"
                  />
                )}
              </div>
              
              {formData.effectLogic.type !== 'NONE' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono w-16">VALUE:</span>
                  <input 
                    type="number" 
                    value={formData.effectLogic.value} 
                    onChange={(e) => handleLogicChange('value', parseFloat(e.target.value))}
                    className="flex-1 p-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-slate-300 outline-none bg-white/80 shadow-sm"
                    placeholder="ค่าตัวแปร เช่น 0.5, 2, 3"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="isActive" 
              name="isActive" 
              checked={formData.isActive} 
              onChange={handleChange} 
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 shadow-sm"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
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
