import React from 'react';
import { Activity } from 'lucide-react';

const PlayerGameInfoForm = ({ formData, handleChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Activity size={16} /></div>
        <h3 className="font-semibold text-gray-700">ข้อมูลลีค (Fantasy)</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง (Position)</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer transition-all"
          >
            <option value="FW">กองหน้า (FW)</option>
            <option value="MF">กองกลาง (MF)</option>
            <option value="DF">กองหลัง (DF)</option>
            <option value="GK">ผู้รักษาประตู (GK)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">สโมสร (Team)</label>
          <input
            type="text"
            name="team"
            value={formData.team}
            onChange={handleChange}
            placeholder="เช่น Arsenal"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (£ m)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-green-700 font-bold transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">คะแนน (Pts)</label>
          <input
            type="number"
            name="totalPoints"
            value={formData.totalPoints}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-blue-600 font-bold transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer transition-all"
          >
            <option value="active">พร้อมลงเล่น</option>
            <option value="injured">บาดเจ็บ</option>
            <option value="suspended">แบน</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PlayerGameInfoForm;
