import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { formatShortName } from '../utils/formatters';

// นำเข้า Forms ที่แยกส่วนแล้ว
import PlayerIdentityForm from './forms/PlayerIdentityForm';
import PlayerGameInfoForm from './forms/PlayerGameInfoForm';
import PlayerStatsForm from './forms/PlayerStatsForm';

/**
 * PlayerManualForm Component (Refactored Container)
 * ฟอร์มสำหรับเพิ่มหรือแก้ไขข้อมูลนักเตะแบบ Manual
 */
const PlayerManualForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    sku: '',
    fullName: '',
    name: '',
    imageUrl: '',
    position: 'FW',
    team: '',
    price: 0.0,
    status: 'active',
    totalPoints: 0,
    stats: {
      pace: 0,
      shooting: 0,
      passing: 0,
      dribbling: 0,
      defending: 0,
      physical: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        stats: { ...prev.stats, ...(initialData.stats || {}) },
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const statFields = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];

    if (statFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        stats: { ...prev.stats, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFullNameChange = (e) => {
    const fullNameValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fullName: fullNameValue,
      name: formatShortName(fullNameValue),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sku || !formData.fullName) {
      alert('กรุณากรอก SKU และ ชื่อเต็มของนักเตะ');
      return;
    }

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
      updatedAt: new Date().toISOString(),
    };

    if (onSubmit) onSubmit(formattedData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10 pt-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {initialData ? (
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
            {initialData ? 'แก้ไขข้อมูลนักเตะ' : 'เพิ่มนักเตะใหม่ (Manual)'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            กรอกข้อมูลพื้นฐานและสถิติเพื่อเข้าสู่ระบบ Fantasy
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* คอลัมน์ซ้าย: ข้อมูลส่วนตัว (5 ส่วน) */}
        <div className="md:col-span-5">
          <PlayerIdentityForm
            formData={formData}
            handleChange={handleChange}
            handleFullNameChange={handleFullNameChange}
            isEdit={!!initialData}
          />
        </div>

        {/* คอลัมน์ขวา: ข้อมูลเกม & สถิติ (7 ส่วน) */}
        <div className="md:col-span-7 space-y-6">
          <PlayerGameInfoForm formData={formData} handleChange={handleChange} />
          <PlayerStatsForm stats={formData.stats} handleChange={handleChange} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end items-center gap-3 mt-8 pt-5 border-t border-gray-100 sticky bottom-0 bg-white z-10">
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
