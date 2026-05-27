import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, Loader2, CheckCircle, AlertCircle, Palette } from 'lucide-react';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// 🔗 URL ท่อส่งตรงไปยัง Google Apps Script ของลูกพี่
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw14VDK_0Peq-8-RJbGFpvMkMnsZWp0_99j6uzvo9EDIHFF9QG014HW6isdi2gDVom1/exec";

export default function ThemeController() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // เก็บลิงก์รูปปัจจุบันที่แสดงอยู่บนเว็บ
  const [currentTheme, setCurrentTheme] = useState({
    loginBackgroundUrl: '',
    floatingObjectUrl: ''
  });

  // เก็บไฟล์ที่แอดมินเพิ่งกดเลือกจากคอม
  const [selectedBgFile, setSelectedBgFile] = useState(null);
  const [selectedObjFile, setSelectedObjFile] = useState(null);

  // 1. ดึงข้อมูลธีมปัจจุบันจาก Firebase ทันทีที่เปิดหน้านี้
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

  // 2. ฟังก์ชันแปลงไฟล์เป็น Base64 (ข้อความ) เพื่อส่งผ่านเน็ต
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // 3. ฟังก์ชันอัปโหลดรูปไป Google Drive ผ่าน Apps Script
  const uploadToDrive = async (file) => {
    const base64Data = await convertToBase64(file);
    
    // โครงสร้างข้อมูลที่ Apps Script ของเรารอรับอยู่
    const payload = {
      base64: base64Data,
      filename: file.name,
      mimeType: file.type
    };

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.status === "success") {
      return result.url; // คืนค่า Direct Link กลับมา
    } else {
      throw new Error(result.message);
    }
  };

  // 4. ฟังก์ชันเมื่อแอดมินกดปุ่ม "บันทึกและอัปเดตระบบ"
  const handleSaveTheme = async () => {
    setIsUploading(true);
    setStatusMsg({ type: 'loading', text: 'กำลังส่งไฟล์ไปที่ Google Drive...' });
    
    try {
      let newBgUrl = currentTheme.loginBackgroundUrl;
      let newObjUrl = currentTheme.floatingObjectUrl;

      // ถ้ามีการเลือกไฟล์พื้นหลังใหม่ ให้อัปโหลด
      if (selectedBgFile) {
        newBgUrl = await uploadToDrive(selectedBgFile);
      }
      
      // ถ้ามีการเลือกไฟล์ Object ใหม่ ให้อัปโหลด
      if (selectedObjFile) {
        newObjUrl = await uploadToDrive(selectedObjFile);
      }

      const updatedTheme = {
        loginBackgroundUrl: newBgUrl,
        floatingObjectUrl: newObjUrl
      };

      setStatusMsg({ type: 'loading', text: 'กำลังบันทึกลิงก์ลงฐานข้อมูล Firebase...' });

      // บันทึกลง Firestore (หน้าบ้านจะอัปเดตอัตโนมัติ)
      const docRef = doc(db, 'public_data', 'system_config');
      await setDoc(docRef, { themeConfig: updatedTheme }, { merge: true });

      setCurrentTheme(updatedTheme);
      setSelectedBgFile(null);
      setSelectedObjFile(null);
      
      setStatusMsg({ type: 'success', text: 'อัปเดตธีมหน้าเกมเรียบร้อยแล้ว!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 5000); // ซ่อนข้อความหลัง 5 วิ

    } catch (error) {
      console.error(error);
      setStatusMsg({ type: 'error', text: 'เกิดข้อผิดพลาด: ' + error.message });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">กำลังโหลดข้อมูลธีม...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-1 flex items-center gap-2">
          <Palette className="text-indigo-600" /> จัดการธีม & รูปภาพ (Login Screen)
        </h2>
        <p className="text-sm text-slate-500">อัปโหลดภาพพื้นหลังและไอคอนลอยได้ ภาพจะถูกเก็บไว้ที่ Google Drive อัตโนมัติ</p>
      </div>

      {/* แจ้งเตือนสถานะ */}
      {statusMsg.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${
          statusMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' :
          statusMsg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
          'bg-blue-50 text-blue-600 border border-blue-200'
        }`}>
          {statusMsg.type === 'loading' ? <Loader2 className="animate-spin" size={20}/> : 
           statusMsg.type === 'success' ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. กล่องอัปโหลด Background */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ImageIcon size={18} className="text-slate-400"/> ภาพพื้นหลัง (Background)
          </h3>
          
          {/* พรีวิวภาพ */}
          <div className="w-full h-48 bg-slate-100 rounded-xl mb-4 overflow-hidden border-2 border-dashed border-slate-300 relative group flex items-center justify-center">
            {(selectedBgFile || currentTheme.loginBackgroundUrl) ? (
              <img 
                src={selectedBgFile ? URL.createObjectURL(selectedBgFile) : currentTheme.loginBackgroundUrl} 
                alt="BG Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-400 text-sm font-bold">ยังไม่มีรูปภาพ</span>
            )}
          </div>

          <label className="block w-full bg-slate-50 border border-slate-200 text-slate-600 text-center font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            เลือกไฟล์ใหม่ (JPG/PNG)
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedBgFile(e.target.files[0])} />
          </label>
        </div>

        {/* 2. กล่องอัปโหลด Object ลอยได้ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ImageIcon size={18} className="text-slate-400"/> ไอคอนลอยได้ (Floating Object)
          </h3>
          
          {/* พรีวิวภาพ */}
          <div className="w-full h-48 bg-slate-900 rounded-xl mb-4 overflow-hidden border-2 border-dashed border-slate-700 relative group flex items-center justify-center">
            {(selectedObjFile || currentTheme.floatingObjectUrl) ? (
              <img 
                src={selectedObjFile ? URL.createObjectURL(selectedObjFile) : currentTheme.floatingObjectUrl} 
                alt="Object Preview" 
                className="w-32 h-32 object-contain animate-[bounce_3s_ease-in-out_infinite]"
              />
            ) : (
              <span className="text-slate-500 text-sm font-bold">ยังไม่มีไอคอน</span>
            )}
          </div>

          <label className="block w-full bg-slate-50 border border-slate-200 text-slate-600 text-center font-bold py-2 px-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            เลือกไฟล์ใหม่ (PNG พื้นใส/GIF)
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedObjFile(e.target.files[0])} />
          </label>
        </div>

      </div>

      {/* ปุ่ม Save หลัก */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSaveTheme}
          disabled={isUploading || (!selectedBgFile && !selectedObjFile)}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isUploading ? 'กำลังอัปเดตระบบ...' : 'บันทึกและอัปเดตระบบ'}
        </button>
      </div>
    </div>
  );
}