import React from 'react';
import { Calculator, Settings2 } from 'lucide-react';

export default function PlayerValueFormulaConfig({ config, setConfig }) {
  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handlePosChange = (pos, value) => {
    setConfig(prev => ({
      ...prev,
      posModifiers: { ...prev.posModifiers, [pos]: Number(value) }
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4">
      <div className="flex items-center gap-3 mb-4 border-b pb-3">
        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
          <Settings2 size={20} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">ตั้งค่าตัวแปรในสูตร (Formula Config)</h2>
          <p className="text-xs text-slate-500">ปรับแต่งตัวแปรเพื่อหาสมดุลราคาที่ต้องการ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Modifiers */}
        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <h3 className="font-bold text-slate-700 text-sm mb-1 flex items-center gap-2">
            <Calculator size={14} /> ตัวแปรหลัก (Base & Multipliers)
          </h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Base Price (ราคาตั้งต้น)</label>
            <input 
              type="number" step="0.5"
              value={config.basePrice} 
              onChange={e => handleChange('basePrice', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">ราคาต่ำสุดที่นักเตะคนหนึ่งจะมีได้</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Stat Multiplier (สัดส่วนคะแนนพลัง)</label>
            <input 
              type="number" step="1"
              value={config.statMultiplier} 
              onChange={e => handleChange('statMultiplier', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Form Divisor (สัดส่วนผลงานรวม)</label>
            <input 
              type="number" step="1"
              value={config.formMultiplier} 
              onChange={e => handleChange('formMultiplier', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Position Modifiers */}
        <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col">
          <h3 className="font-bold text-slate-700 text-sm mb-1">ตัวคูณตามตำแหน่ง (Position Modifiers)</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {['FW', 'MF', 'DF', 'GK'].map(pos => (
              <div key={pos}>
                <label className="block text-xs font-semibold text-slate-500 mb-1">{pos} Multiplier</label>
                <input 
                  type="number" step="0.1"
                  value={config.posModifiers[pos]} 
                  onChange={e => handlePosChange(pos, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                />
              </div>
            ))}
          </div>
          <div className="mt-auto pt-2 bg-indigo-50 border border-indigo-100 p-2 rounded-lg">
            <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
              สูตรปัจจุบัน: (Base + (AvgStat/100 * StatMult) + (Points/FormDiv)) * PosMod
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
