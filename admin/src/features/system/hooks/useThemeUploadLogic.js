import { useState } from 'react';
import { uploadImageToDrive } from '../../../utils/googleDriveUploader';

export const useThemeUploadLogic = (config, handleThemeChange) => {
  const [uploadingKey, setUploadingKey] = useState(null);
  
  const getDirectLink = (url) => {
    if (!url) return '';
    const driveRegex = /(?:drive\.google\.com\/.*?(?:id=|\/d\/)|drive\.google\.com\/file\/d\/)([\w-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const handleSelectHistory = async (key, url) => {
    handleThemeChange(key, url);
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../../config/firebase');
      const docRef = doc(db, 'public_data', 'system_config');
      await updateDoc(docRef, {
        [`themeConfig.${key}`]: url
      });
    } catch (e) {
      console.error("Failed to auto-save history selection", e);
    }
  };

  const handleFileUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingKey(key);
    try {
      const uploadedUrl = await uploadImageToDrive(file);
      const directImageUrl = getDirectLink(uploadedUrl);
      
      const historyKey = `${key}History`;
      const existingHistory = config?.themeConfig?.[historyKey] || [];
      const newHistory = [directImageUrl, ...existingHistory.filter(url => url !== directImageUrl)].slice(0, 5);
      
      handleThemeChange(key, directImageUrl);
      handleThemeChange(historyKey, newHistory);

      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../../config/firebase');
      const docRef = doc(db, 'public_data', 'system_config');
      
      await updateDoc(docRef, {
        [`themeConfig.${key}`]: directImageUrl,
        [`themeConfig.${historyKey}`]: newHistory
      });

    } catch (error) {
      alert(error.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  };

  return {
    uploadingKey,
    handleSelectHistory,
    handleFileUpload
  };
};
