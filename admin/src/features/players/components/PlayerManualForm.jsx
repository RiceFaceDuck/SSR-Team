import React, { useState, useEffect } from 'react';
import { Save, X, Info, Activity, Image as ImageIcon, User } from 'lucide-react';
import { formatShortName } from '../utils/formatters';

/**
 * PlayerManualForm Component
 * ฟอร์มสำหรับเพิ่มหรือแก้ไขข้อมูลนักเตะแบบ Manual
 * @param {Function} onSubmit - ฟังก์ชันเมื่อกดบันทึกข้อมูล (ส่ง formData กลับไป)
 * @param {Function} onCancel - ฟังก์ชันเมื่อกดยกเลิก
 * @param {Object} initialData - ข้อมูลเริ่มต้น (ใช้กรณีแก้ไขข้อมูลนักเตะเดิม)
 * @param {boolean} isLoading - สถานะกำลังบันทึกข้อมูล
 */
const PlayerManualForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  // สร้าง State สำหรับเก็บข้อมูลฟอร์ม พร้อมรองรับฟิลด์ใหม่ๆ
  const [formData, setFormData] = useState({
    sku: '',
    fullName: '',
    name: '', 
    imageUrl: '', // ฟิลด์รูปรองรับ URL
    position: 'FW',
    team: '',
    price: 0.0,
    status: 'active',
    totalPoints: 0,
    // เพิ่ม Object Stats ให้ตรงกับ Database Schema
    stats: {
      pace: 0,
      shooting: 0,
      passing: 0,
      dribbling: 0,
      defending: 0,
      physical: 0
    }
  });

  // โหลดข้อมูลเดิมกรณีแก้ไข
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ 
        ...prev, 
        ...initialData,
        // ป้องกันกรณี initialData ไม่มี stats จะได้ไม่ error
        stats: { ...prev.stats, ...(initialData.stats || {}) }
      }));
    }
  }, [initialData]);

  // จัดการการพิมพ์ข้อมูลลงฟอร์ม
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ดักจับฟิลด์ที่เป็นส่วนหนึ่งของ Stats
    const statFields = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];
    
    if (statFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        stats: { ...prev.stats, [name]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // สร้างชื่อย่ออัตโนมัติ
  const handleFullNameChange = (e) => {
    const fullNameValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fullName: fullNameValue,
      name: formatShortName(fullNameValue)
    }));
  };

  // ฟังก์ชันตรวจสอบและจัดรูปแบบก่อนส่ง
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.fullName) {
      alert("กรุณากรอก SKU และ ชื่อเต็มของนักเตะ");
      return;
    }

    // ทำความสะอาดและแปลงชนิดข้อมูล (Data Sanitization)
    const formattedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      totalPoints: parseInt(formData.totalPoints, 10) || 0,
      stats: {
        pace: parseInt(formData.stats.pace, 10) || 0,
        shooting: parseInt(formData.stats.shooting, 10) || 0,
        passing: parseInt(formData.stats.passing, 10) || 0,
        dribbling: parseInt(formData.stats.dribbling, 10) || 0,
        defending: parseInt(formData.stats.defending, 10) || 0,
        physical: parseInt(formData.stats.physical, 10) || 0,
      },
      updatedAt: new Date().toISOString()
    };

    if (onSubmit) {
      onSubmit(formattedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10 pt-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {initialData ? <span className="w-2 h-2 rounded-full bg-blue-500"></span> : <span className="w-2 h-2 rounded-full bg-green-500"></span>}
            {initialData ? 'แก้ไขข้อมูลนักเตะ' : 'เพิ่มนักเตะใหม่ (Manual)'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">กรอกข้อมูลพื้นฐานและสถิติเพื่อเข้าสู่ระบบ Fantasy</p>
        </div>
        <button type="button" onClick={onCancel} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
           <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* --- คอลัมน์ซ้าย: ข้อมูลส่วนตัว (กินพื้นที่ 5 ส่วน) --- */}
        <div className="md:col-span-5 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Info size={16} /></div>
            <h3 className="font-semibold text-gray-700">ข้อมูลระบุตัวตน</h3>
          </div>
          
          {/* พรีวิวภาพนักเตะ */}
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border border-gray-200 border-dashed rounded-xl relative overflow-hidden group">
            {formData.imageUrl ? (
               <img src={formData.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-md bg-white z-10" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            ) : null}
            <div className={`w-24 h-24 bg-gray-200 rounded-full border-4 border-white shadow-md items-center justify-center ${formData.imageUrl ? 'hidden' : 'flex'}`}>
              <User size={32} className="text-gray-400" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU (รหัสอ้างอิง) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="เช่น PLY-001"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
              disabled={!!initialData}
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
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 focus:outline-none"
            />
          </div>
        </div>

        {/* --- คอลัมน์ขวา: ข้อมูลเกม & สถิติ (กินพื้นที่ 7 ส่วน) --- */}
        <div className="md:col-span-7 space-y-6">
          
          {/* ส่วนข้อมูลในเกม */}
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
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
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-green-700 font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">คะแนน (Pts)</label>
                <input
                  type="number"
                  name="totalPoints"
                  value={formData.totalPoints}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none text-blue-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
                >
                  <option value="active">พร้อมลงเล่น</option>
                  <option value="injured">บาดเจ็บ</option>
                  <option value="suspended">แบน</option>
                </select>
              </div>
            </div>
          </div>

          {/* ส่วนสถิติความสามารถ (New Update) */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              สถิติความสามารถ (Attributes) <span className="text-[10px] font-normal text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">0-99</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              {[
                { id: 'pace', label: 'ความเร็ว (PAC)', color: 'text-blue-600' },
                { id: 'shooting', label: 'การยิง (SHO)', color: 'text-rose-600' },
                { id: 'passing', label: 'การจ่าย (PAS)', color: 'text-amber-600' },
                { id: 'dribbling', label: 'เลี้ยงบอล (DRI)', color: 'text-purple-600' },
                { id: 'defending', label: 'เกมรับ (DEF)', color: 'text-emerald-600' },
                { id: 'physical', label: 'กายภาพ (PHY)', color: 'text-slate-600' }
              ].map((stat) => (
                <div key={stat.id}>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1">{stat.label}</label>
                  <input
                    type="number"
                    min="0" max="99"
                    name={stat.id}
                    value={formData.stats[stat.id]}
                    onChange={handleChange}
                    className={`w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono ${stat.color} font-bold text-center bg-white`}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end items-center gap-3 mt-8 pt-5 border-t border-gray-100 sticky bottom-0 bg-white">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-500/30 flex items-center"
        >
          {isLoading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลนักเตะ'}
        </button>
      </div>
    </form>
  );
};

export default PlayerManualForm;