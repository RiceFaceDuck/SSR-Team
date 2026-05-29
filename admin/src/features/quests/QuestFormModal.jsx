import React, { useState, useEffect, useRef } from 'react';
import { uploadImageToDrive } from '../../utils/googleDriveUploader';

export default function QuestFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  // 🎯 อัปเดต State ให้รองรับ Field ใหม่ทั้งหมดตามโครงสร้าง Database
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rewardBalls: 20, // เปลี่ยนจาก reward เป็น rewardBalls ให้ตรงกับ DB
    imageUrl: '',
    targetUrl: '', // ลิงก์ปลายทาง (เปลี่ยนจาก actionUrl)
    platform: 'Website', // แพลตฟอร์มเริ่มต้น
    maxClaimsPerUser: 1, // โควต้ารับสูงสุดต่อคนต่อวัน
    cooldownHours: 24, // เวลารอรับครั้งต่อไป (ชั่วโมง)
    isVerified: false, // ป้ายสปอนเซอร์ปลอดภัย
    isActive: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const uploadedUrl = await uploadImageToDrive(file);
      setFormData((prev) => ({ ...prev, imageUrl: uploadedUrl }));
    } catch (error) {
      setUploadError(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
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
            {/* ชื่อโฆษณา */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">หัวข้อโปรโมชั่น (Title)</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น สมัครสมาชิกใหม่ รับฟรี 50 เหรียญ!"
              />
            </div>

            {/* รายละเอียด */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">รายละเอียดเงื่อนไข (Description)</label>
              <textarea
                name="description"
                rows="2"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="อธิบายเงื่อนไขที่ผู้เล่นต้องทำ..."
              />
            </div>

            {/* 📸 ส่วนอัปโหลดรูปภาพ */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">รูปภาพแบนเนอร์โฆษณา</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors relative">
                {formData.imageUrl && !isUploading ? (
                  <div className="relative w-full">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-40 object-contain rounded-lg bg-black/50"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                      title="ลบรูปภาพ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 text-center w-full">
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-4">
                        <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-sm text-blue-400 font-medium">กำลังโยนไฟล์ขึ้น Google Drive...</p>
                      </div>
                    ) : (
                      <>
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-400 justify-center">
                          <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none">
                            <span>คลิกเพื่อเลือกไฟล์รูปภาพ</span>
                            <input 
                              ref={fileInputRef} type="file" className="sr-only" 
                              accept="image/jpeg, image/png, image/gif, image/webp"
                              onChange={handleFileUpload} disabled={isUploading}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">ขนาดไฟล์แนะนำ ไม่เกิน 5MB</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              {uploadError && <p className="mt-2 text-sm text-red-500">⚠️ {uploadError}</p>}
            </div>

            {/* แพลตฟอร์ม & ลิงก์ปลายทาง */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ป้ายกำกับที่มา (Platform)</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Website">🌐 Website</option>
                <option value="Facebook">📘 Facebook</option>
                <option value="YouTube">📺 YouTube</option>
                <option value="TikTok">🎵 TikTok</option>
                <option value="Line">💬 LINE</option>
                <option value="Other">🏷️ Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ลิงก์ปลายทาง (Target URL)</label>
              <input
                type="url"
                name="targetUrl"
                required
                value={formData.targetUrl}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://sponsor.com/..."
              />
            </div>

            {/* โควต้า & Cooldown */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">รับได้สูงสุด (ครั้ง / วัน)</label>
              <input
                type="number"
                name="maxClaimsPerUser"
                min="1"
                value={formData.maxClaimsPerUser}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">ระยะเวลารอกดซ้ำ (ชั่วโมง)</label>
              <input
                type="number"
                name="cooldownHours"
                min="0"
                step="0.5"
                value={formData.cooldownHours}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* รางวัล & สวิตช์เปิดปิด */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5 p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
              <div>
                <label className="block text-sm font-medium text-yellow-500 mb-1 flex items-center gap-1">
                  💰 แจกรางวัล (Coins)
                </label>
                <input
                  type="number"
                  name="rewardBalls"
                  min="0"
                  required
                  value={formData.rewardBalls}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="flex flex-col justify-center">
                <label className="flex items-center cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 bg-gray-700"
                  />
                  <span className="ml-2 text-sm font-medium text-green-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Verified สปอนเซอร์
                  </span>
                </label>
              </div>

              <div className="flex flex-col justify-center">
                <label className="flex items-center cursor-pointer mt-5">
                  <div className="relative">
                    <input type="checkbox" name="isActive" className="sr-only" checked={formData.isActive} onChange={handleChange} />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-300">
                    {formData.isActive ? 'สถานะ: เปิดใช้งาน' : 'สถานะ: ซ่อน'}
                  </span>
                </label>
              </div>
            </div>

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