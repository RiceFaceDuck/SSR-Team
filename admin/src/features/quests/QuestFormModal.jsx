import React, { useState, useEffect, useRef } from 'react';
import { uploadImageToDrive } from '../../utils/googleDriveUploader';

export default function QuestFormModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: 0,
    imageUrl: '',
    actionUrl: '',
    isActive: true,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // เมื่อเปิด Modal หรือมีข้อมูล initialData (สำหรับการแก้ไข) ให้เซ็ตค่าเริ่มต้น
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // ค่าเริ่มต้นสำหรับสร้างใหม่
      setFormData({
        title: '',
        description: '',
        reward: 0,
        imageUrl: '',
        actionUrl: '',
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

  // 🚀 ฟังก์ชันจัดการการอัปโหลดไฟล์
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      // เรียกใช้ Utility Function จากขั้นตอนที่ 1
      const uploadedUrl = await uploadImageToDrive(file);
      
      setFormData((prev) => ({
        ...prev,
        imageUrl: uploadedUrl // นำ URL ที่ได้จาก Google Drive มาใส่ในฟอร์ม
      }));
    } catch (error) {
      setUploadError(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setIsUploading(false);
      // เคลียร์ค่า input file เพื่อให้เลือกไฟล์เดิมซ้ำได้ในกรณีที่ต้องการ
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // แปลง reward ให้เป็นตัวเลขก่อนส่ง
    onSubmit({
      ...formData,
      reward: Number(formData.reward)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
          <h2 className="text-xl font-bold text-white">
            {initialData ? '✏️ แก้ไขภารกิจ/สปอนเซอร์' : '✨ สร้างภารกิจ/สปอนเซอร์ใหม่'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* ชื่อภารกิจ */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">ชื่อภารกิจ (Title)</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น ดูวิดีโอสปอนเซอร์รับ 50 Coin"
            />
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">รายละเอียด (Description)</label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="รายละเอียดเงื่อนไขภารกิจ..."
            />
          </div>

          {/* 📸 ส่วนอัปโหลดรูปภาพ (อัปเกรดใหม่) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">รูปภาพป้ายโฆษณา/สปอนเซอร์</label>
            
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors relative">
              
              {/* กรณีอัปโหลดเสร็จแล้ว แสดงรูป */}
              {formData.imageUrl && !isUploading ? (
                <div className="relative w-full">
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-contain rounded-lg bg-black/50"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                    title="ลบรูปภาพ"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-center w-full">
                  {/* สถานะกำลังอัปโหลด */}
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-sm text-blue-400 font-medium">กำลังอัปโหลดไปยัง Google Drive...</p>
                    </div>
                  ) : (
                    <>
                      {/* สถานะรอเลือกไฟล์ */}
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-400 justify-center">
                        <label className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none">
                          <span>คลิกเพื่อเลือกไฟล์รูปภาพ</span>
                          <input 
                            ref={fileInputRef}
                            type="file" 
                            className="sr-only" 
                            accept="image/jpeg, image/png, image/gif, image/webp"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF สูงสุด 5MB</p>
                    </>
                  )}
                </div>
              )}
            </div>
            {uploadError && <p className="mt-2 text-sm text-red-500 flex items-center"><span className="mr-1">⚠️</span>{uploadError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* รางวัล */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">รางวัล (Coins)</label>
              <input
                type="number"
                name="reward"
                min="0"
                required
                value={formData.reward}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* สถานะเปิดใช้งาน */}
            <div className="flex flex-col justify-center items-start pt-6">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    className="sr-only"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-4' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-300">
                  {formData.isActive ? 'เปิดใช้งาน (Active)' : 'ปิดชั่วคราว (Inactive)'}
                </span>
              </label>
            </div>
          </div>

          {/* ลิงก์ปลายทาง (Action URL) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">ลิงก์ปลายทาง (Action URL - ถ้ามี)</label>
            <input
              type="url"
              name="actionUrl"
              value={formData.actionUrl}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://sponsor-website.com"
            />
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
              className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors flex items-center shadow-lg
                ${isUploading 
                  ? 'bg-blue-600/50 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'}`}
            >
              {isUploading ? 'รอก่อน...' : 'บันทึกข้อมูล'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}