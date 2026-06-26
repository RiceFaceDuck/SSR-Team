import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2 } from 'lucide-react';

/**
 * Dropzone Component (Reusable)
 * พื้นที่สำหรับอัปโหลดไฟล์ รองรับทั้งการลากวาง (Drag & Drop) และคลิกเพื่อเลือกไฟล์
 * @param {Function} onFileSelected - ฟังก์ชันที่จะถูกเรียกเมื่อเลือกไฟล์สำเร็จ โดยส่ง file object กลับไป
 * @param {string} accept - ประเภทไฟล์ที่อนุญาต เช่น ".xlsx, .xls, .csv"
 * @param {boolean} isLoading - สถานะกำลังประมวลผลไฟล์ ปิดการใช้งานปุ่มถ้าเป็น true
 */
const Dropzone = ({ onFileSelected, accept = '.xlsx, .xls, .csv', isLoading = false }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const fileInputRef = useRef(null);

  // ป้องกัน Default Behavior เพื่อให้สามารถลากวางได้
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isLoading) setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
      e.dataTransfer.clearData();
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  // ฟังก์ชันจัดการไฟล์กลาง
  const handleFile = (file) => {
    setSelectedFileName(file.name);
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  const handleClick = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative w-full p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}
          ${isLoading ? 'opacity-70 pointer-events-none cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileInput}
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center text-blue-500">
            <Loader2 className="w-12 h-12 mb-4 animate-spin" />
            <p className="text-sm font-medium">กำลังประมวลผลไฟล์...</p>
          </div>
        ) : (
          <>
            {selectedFileName ? (
              <div className="flex flex-col items-center text-green-600">
                <FileSpreadsheet className="w-12 h-12 mb-4" />
                <p className="text-base font-semibold text-gray-800">{selectedFileName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  คลิกหรือลากไฟล์ใหม่มาวางเพื่อเปลี่ยนไฟล์
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <UploadCloud className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-base font-medium text-gray-700 mb-1">
                  คลิกเพื่ออัปโหลด{' '}
                  <span className="font-normal text-gray-500">หรือลากไฟล์มาวางที่นี่</span>
                </p>
                <p className="text-xs text-gray-400">รองรับไฟล์ {accept}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dropzone;
