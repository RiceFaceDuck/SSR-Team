import React, { useRef } from 'react';
import { uploadImageToDrive } from '../../../utils/googleDriveUploader';

export default function QuestImageUploader({
  imageUrl,
  isUploading,
  setIsUploading,
  setFormData,
  setUploadError,
  uploadError,
}) {
  const fileInputRef = useRef(null);

  const getDirectLink = (url) => {
    if (!url) return '';
    const driveRegex =
      /(?:drive\.google\.com\/.*?(?:id=|\/d\/)|drive\.google\.com\/file\/d\/)([\w-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const uploadedUrl = await uploadImageToDrive(file);
      const directImageUrl = getDirectLink(uploadedUrl);
      setFormData((prev) => ({ ...prev, imageUrl: directImageUrl }));
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

  return (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-300 mb-1">
        รูปภาพแบนเนอร์โฆษณา (อัปโหลดไฟล์)
      </label>
      <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors relative">
        {imageUrl && !isUploading ? (
          <div className="relative w-full">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-40 object-contain rounded-lg bg-black/50"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image';
              }}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
              title="ลบรูปภาพ"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-2 text-center w-full">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-4">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500 mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm text-blue-400 font-medium">
                  กำลังโยนไฟล์ขึ้น Google Drive...
                </p>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                <p className="text-xs text-gray-500">ขนาดไฟล์แนะนำ ไม่เกิน 5MB</p>
              </>
            )}
          </div>
        )}
      </div>
      {uploadError && <p className="mt-2 text-sm text-red-500">⚠️ {uploadError}</p>}
    </div>
  );
}
