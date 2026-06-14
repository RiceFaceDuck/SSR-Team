import React from 'react';
import { Info, Image as ImageIcon, User } from 'lucide-react';

const PlayerIdentityForm = ({ formData, handleChange, handleFullNameChange, isEdit }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Info size={16} /></div>
        <h3 className="font-semibold text-gray-700">ข้อมูลระบุตัวตน</h3>
      </div>
      
      {/* พรีวิวภาพนักเตะ */}
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl relative overflow-hidden group hover:border-blue-300 transition-colors">
        {formData.imageUrl ? (
            <img src={formData.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md bg-white z-10" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
        ) : null}
        <div className={`w-24 h-24 bg-gray-200 rounded-full border-4 border-white shadow-md items-center justify-center ${formData.imageUrl ? 'hidden' : 'flex'}`}>
          <User size={32} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
        </div>
        
        <div className="w-full mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ImageIcon size={14} className="text-gray-400" />
          </div>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="วางลิงก์รูปภาพนักเตะ (URL)"
            className="w-full pl-8 pr-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="flex justify-between items-end text-sm font-medium text-gray-700 mb-1">
          <span>SKU (รหัสอ้างอิง) <span className="text-red-500">*</span></span>
          {formData.sku && formData.sku.startsWith('API-') && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">API Synced</span>
          )}
          {formData.sku && formData.sku.startsWith('EXCEL-') && (
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Excel Import</span>
          )}
        </label>
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="เช่น PLY-001"
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50"
          required
          disabled={isEdit || (formData.sku && formData.sku.startsWith('API-'))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ชื่อเต็ม (Full Name) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleFullNameChange}
          placeholder="เช่น Bukayo Saka"
          className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อย่อ (หน้าเกม)</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        />
      </div>
    </div>
  );
};

export default PlayerIdentityForm;
