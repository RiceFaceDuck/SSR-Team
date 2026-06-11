import React, { useState, useEffect } from 'react';
import { X, Save, Zap } from 'lucide-react';

export default function CardForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '⚡',
    effectLogic: { type: 'NONE', value: '' },
    isActive: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        effectLogic: initialData.effectLogic || { type: 'NONE', value: '' }
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogicChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      effectLogic: { ...prev.effectLogic, [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.effectLogic.type === 'CUSTOM') {
      payload.effectLogic.type = payload.effectLogic.customType || 'NONE';
      delete payload.effectLogic.customType;
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="text-purple-500" />
            {initialData ? 'แก้ไขการ์ด' : 'สร้างการ์ดใหม่'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">ไอคอน</label>
              <input 
                type="text" 
                name="icon" 
                value={formData.icon} 
                onChange={handleChange} 
                className="w-full text-center text-2xl p-2 border border-slate-200 rounded-lg"
                placeholder="⚡"
                maxLength={2}
                required
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อการ์ด</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full p-2 border border-slate-200 rounded-lg"
                placeholder="เช่น กัปตันจอมแบก"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">คำอธิบาย</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full p-2 border border-slate-200 rounded-lg"
              rows={2}
              placeholder="เช่น คูณ 3 คะแนนสัปดาห์นี้"
              required
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">ตรรกะผลลัพธ์ (Effect Logic)</label>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 block mb-1">ประเภท (Type)</span>
                <select 
                  value={formData.effectLogic.type} 
                  onChange={(e) => handleLogicChange('type', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="NONE">ไม่ระบุ</option>
                  <option value="TRIPLE_CAPTAIN">กัปตันคูณสาม (TRIPLE_CAPTAIN)</option>
                  <option value="BENCH_BOOST">สำรองรับทรัพย์ (BENCH_BOOST)</option>
                  <option value="IMMUNE_YELLOW">ป้องกันใบเหลือง (IMMUNE_YELLOW)</option>
                  <option value="PRICE_REDUCTION">ลดราคาค่าตัว (PRICE_REDUCTION)</option>
                  <option value="NOT_SUBBED_BONUS">โบนัสตัวจริง (NOT_SUBBED_BONUS)</option>
                  <option value="POINTS_MULTIPLIER">คูณคะแนน (POINTS_MULTIPLIER)</option>
                  <option value="CUSTOM">พิมพ์กำหนดเอง (Custom)</option>
                </select>
                {formData.effectLogic.type === 'CUSTOM' && (
                  <input
                    type="text"
                    value={formData.effectLogic.customType || ''}
                    onChange={(e) => handleLogicChange('customType', e.target.value.toUpperCase())}
                    className="w-full p-2 mt-2 border border-slate-200 rounded-lg text-sm bg-white"
                    placeholder="เช่น MY_CUSTOM_LOGIC"
                  />
                )}
              </div>
              
              {formData.effectLogic.type !== 'NONE' && (
                <div>
                  <span className="text-xs text-slate-500 block mb-1">มูลค่า/ค่าตัวแปร (Value)</span>
                  <input 
                    type="number" 
                    value={formData.effectLogic.value} 
                    onChange={(e) => handleLogicChange('value', parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="เช่น 0.5 (ลด 0.5m)"
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
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">
              เปิดใช้งาน (Active)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onCancel}
              className="px-4 py-2 font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
