import React from 'react';
import { Wand2 } from 'lucide-react';

export default function CardEffectConfigurator({
  formData,
  handleLogicChange,
  calculateSmartPrice,
}) {
  return (
    <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 shadow-inner">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          ตรรกะผลลัพธ์ (Effect Logic)
        </label>
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
  );
}
