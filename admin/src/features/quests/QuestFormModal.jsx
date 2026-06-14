import React, { useState, useEffect } from 'react';
import QuestImageUploader from './components/QuestImageUploader';
import QuestBasicInputs from './components/QuestBasicInputs';
import QuestSettingsInputs from './components/QuestSettingsInputs';

export default function QuestFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  // 🎯 อัปเดต State ให้รองรับ Field ใหม่ทั้งหมดตามโครงสร้าง Database
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardBalls: 20,
    imageUrl: '',
    targetUrl: '',
    platform: 'Website',
    maxClaimsPerUser: 1,
    cooldownHours: 24,
    isVerified: false,
    isActive: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        rewardBalls: initialData.rewardBalls || 20,
        imageUrl: initialData.imageUrl || '',
        targetUrl: initialData.targetUrl || '',
        platform: initialData.platform || 'Website',
        maxClaimsPerUser: initialData.maxClaimsPerUser || 1,
        cooldownHours: initialData.cooldownHours || 24,
        isVerified: initialData.isVerified || false,
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        rewardBalls: 20,
        imageUrl: '',
        targetUrl: '',
        platform: 'Website',
        maxClaimsPerUser: 1,
        cooldownHours: 24,
        isVerified: false,
        isActive: true,
      });
    }
    setUploadError('');
    setIsUploading(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      rewardBalls: Number(formData.rewardBalls),
      maxClaimsPerUser: Number(formData.maxClaimsPerUser),
      cooldownHours: Number(formData.cooldownHours),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50 sticky top-0 rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {initialData ? '✏️ แก้ไขสปอนเซอร์' : '✨ สร้างสปอนเซอร์ใหม่'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <QuestBasicInputs formData={formData} handleChange={handleChange} />
            <QuestImageUploader 
              imageUrl={formData.imageUrl}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              setFormData={setFormData}
              uploadError={uploadError}
              setUploadError={setUploadError}
            />
            <QuestSettingsInputs formData={formData} handleChange={handleChange} />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all flex items-center shadow-lg
                ${isUploading ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}
            >
              {isUploading ? 'กรุณารอสักครู่...' : 'บันทึกข้อมูลสปอนเซอร์'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}