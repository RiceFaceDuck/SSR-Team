import { useState, useEffect } from 'react';
import { db } from '../../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw14VDK_0Peq-8-RJbGFpvMkMnsZWp0_99j6uzvo9EDIHFF9QG014HW6isdi2gDVom1/exec";

export const useThemeUploadLogic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [currentTheme, setCurrentTheme] = useState({ loginBackgroundUrl: '', floatingObjectUrl: '' });
  const [selectedBgFile, setSelectedBgFile] = useState(null);
  const [selectedObjFile, setSelectedObjFile] = useState(null);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const docRef = doc(db, 'public_data', 'system_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().themeConfig) {
          setCurrentTheme(docSnap.data().themeConfig);
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTheme();
  }, []);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadToDrive = async (file) => {
    const base64Data = await convertToBase64(file);
    const payload = { base64: base64Data, filename: file.name, mimeType: file.type };
    const response = await fetch(SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
    const result = await response.json();
    if (result.status === "success") return result.url;
    throw new Error(result.message);
  };

  const handleSaveTheme = async () => {
    setIsUploading(true);
    setStatusMsg({ type: 'loading', text: 'กำลังส่งไฟล์ไปที่ Google Drive...' });
    
    try {
      let newBgUrl = currentTheme.loginBackgroundUrl;
      let newObjUrl = currentTheme.floatingObjectUrl;

      if (selectedBgFile) newBgUrl = await uploadToDrive(selectedBgFile);
      if (selectedObjFile) newObjUrl = await uploadToDrive(selectedObjFile);

      const updatedTheme = { loginBackgroundUrl: newBgUrl, floatingObjectUrl: newObjUrl };
      setStatusMsg({ type: 'loading', text: 'กำลังบันทึกลิงก์ลงฐานข้อมูล Firebase...' });

      const docRef = doc(db, 'public_data', 'system_config');
      await setDoc(docRef, { themeConfig: updatedTheme }, { merge: true });

      setCurrentTheme(updatedTheme);
      setSelectedBgFile(null);
      setSelectedObjFile(null);
      
      setStatusMsg({ type: 'success', text: 'อัปเดตธีมหน้าเกมเรียบร้อยแล้ว!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000);
    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'เกิดข้อผิดพลาด: ' + error.message });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isLoading,
    isUploading,
    statusMsg,
    currentTheme,
    selectedBgFile,
    setSelectedBgFile,
    selectedObjFile,
    setSelectedObjFile,
    handleSaveTheme
  };
};
