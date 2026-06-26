import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

export default function AchievementForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    iconType: 'Star',
    rarity: 'common',
    conditionType: 'none',
    conditionValue: 0,
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อฉายา (EN/TH)</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
            placeholder="เช่น ROOKIE"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">ไอคอน (Icon Type)</label>
          <select
            name="iconType"
            value={formData.iconType}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="Star">Star (ดาว)</option>
            <option value="Shield">Shield (โล่)</option>
            <option value="Trophy">Trophy (ถ้วย)</option>
            <option value="Award">Award (เหรียญ)</option>
            <option value="Flame">Flame (ไฟ)</option>
            <option value="Crown">Crown (มงกุฎ)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">คำอธิบาย</label>
        <input
          type="text"
          name="desc"
          value={formData.desc}
          onChange={handleChange}
          className="w-full border rounded-lg p-2"
          required
          placeholder="เงื่อนไขการได้ฉายา"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">ระดับความหายาก</label>
          <select
            name="rarity"
            value={formData.rarity}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="common">Common (ทั่วไป)</option>
            <option value="rare">Rare (หายาก)</option>
            <option value="epic">Epic (ระดับสูง)</option>
            <option value="legendary">Legendary (ตำนาน)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            เงื่อนไขการตรวจสอบ (Condition)
          </label>
          <select
            name="conditionType"
            value={formData.conditionType}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="none">None (ปลดล็อคให้ทุกคน)</option>
            <option value="userPoints">คะแนนรวม (User Points)</option>
            <option value="lastGameweekPoints">คะแนนสัปดาห์ล่าสุด</option>
            <option value="balls">ยอดเงิน Balls</option>
            <option value="clubSpentExp">ลงทุนกับสโมสร (EXP)</option>
            <option value="stadiumLevel">เลเวลสนามแข่ง</option>
            <option value="streak">ส่งทีมต่อเนื่อง (Streak)</option>
            <option value="admin">เป็นแอดมิน (Role)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            ค่าเป้าหมาย (Target Value)
          </label>
          <input
            type="number"
            name="conditionValue"
            value={formData.conditionValue}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            disabled={formData.conditionType === 'none' || formData.conditionType === 'admin'}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          name="isActive"
          id="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="w-4 h-4 rounded text-blue-600"
        />
        <label htmlFor="isActive" className="text-sm font-bold text-slate-700">
          เปิดใช้งาน (Active)
        </label>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-bold flex items-center gap-2"
        >
          <X size={16} /> ยกเลิก
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold flex items-center gap-2"
        >
          <Save size={16} /> บันทึก
        </button>
      </div>
    </form>
  );
}
