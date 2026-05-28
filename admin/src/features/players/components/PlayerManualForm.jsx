import React, { useState, useEffect } from 'react';
import { Save, X, Info } from 'lucide-react';
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
  // สร้าง State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    sku: '',
    fullName: '',
    name: '', // ชื่อย่อ (จะถูกสร้างอัตโนมัติ)
    position: 'FW',
    team: '',
    price: 0.0,
    status: 'active',
    totalPoints: 0
  });

  // ถ้ามี initialData (โหมดแก้ไข) ให้ดึงข้อมูลมาใส่ฟอร์ม
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // ฟังก์ชันจัดการการเปลี่ยนแปลงของ Input ทั่วไป
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันพิเศษสำหรับจัดการเวลาพิมพ์ "ชื่อเต็ม" 
  // Requirement: บังคับแปลงเป็นชื่อย่อเสมอ จึงทำ Auto-fill ให้เลย
  const handleFullNameChange = (e) => {
    const fullNameValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fullName: fullNameValue,
      name: formatShortName(fullNameValue) // แปลงชื่อย่ออัตโนมัติ
    }));
  };

  // ฟังก์ชันตรวจสอบและส่งข้อมูล
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ตรวจสอบข้อมูลเบื้องต้น
    if (!formData.sku || !formData.fullName) {
      alert("กรุณากรอก SKU และ ชื่อเต็มของนักเตะ");
      return;
    }

    // จัดรูปแบบข้อมูลให้พร้อมบันทึก (แปลงตัวเลขให้ถูกต้อง)
    const formattedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      totalPoints: parseInt(formData.totalPoints, 10) || 0,
      updatedAt: new Date().toISOString()
    };

    if (onSubmit) {
      onSubmit(formattedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {initialData ? 'แก้ไขข้อมูลนักเตะ' : 'เพิ่มนักเตะใหม่ (Manual)'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">กรอกข้อมูลพื้นฐานของนักเตะเพื่อเข้าสู่ระบบ Fantasy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* คอลัมน์ 1: ข้อมูลระบุตัวตน */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md inline-flex items-center">
            <Info className="w-4 h-4 mr-2" /> ข้อมูลส่วนตัว
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU (อ้างอิง API) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="เช่น 12345 หรือ API-ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
              disabled={!!initialData} // ถ้าเป็นการแก้ไข ไม่ควรให้เปลี่ยน SKU
            />
            {initialData && <p className="text-xs text-gray-400 mt-1">SKU ไม่สามารถแก้ไขได้</p>}
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
              placeholder="เช่น Jude Bellingham"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อย่อ (แสดงผลหน้าบ้าน)
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="ระบบจะสร้างให้อัตโนมัติ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">สร้างอัตโนมัติจากชื่อเต็ม แต่สามารถแก้ไขเองได้</p>
          </div>
        </div>

        {/* คอลัมน์ 2: ข้อมูลในเกม Fantasy */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-md inline-flex items-center">
            <Info className="w-4 h-4 mr-2" /> ข้อมูลในเกม (Fantasy)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="FW">กองหน้า (FW)</option>
                <option value="MF">กองกลาง (MF)</option>
                <option value="DF">กองหลัง (DF)</option>
                <option value="GK">ผู้รักษาประตู (GK)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สถานะ</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="active">พร้อมลงเล่น</option>
                <option value="injured">บาดเจ็บ</option>
                <option value="suspended">ติดโทษแบน</option>
                <option value="inactive">ไม่มีชื่อ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">สโมสรต้นสังกัด (Team)</label>
            <input
              type="text"
              name="team"
              value={formData.team}
              onChange={handleChange}
              placeholder="เช่น Real Madrid"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ราคา (m)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="เช่น 5.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">คะแนนเริ่มต้น</label>
              <input
                type="number"
                name="totalPoints"
                value={formData.totalPoints}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ปุ่มจัดการ */}
      <div className="flex justify-end items-center gap-3 mt-8 pt-5 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center">
            <X className="w-4 h-4 mr-2" />
            ยกเลิก
          </div>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
        >
          <div className="flex items-center">
            {isLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </div>
        </button>
      </div>
    </form>
  );
};

export default PlayerManualForm;