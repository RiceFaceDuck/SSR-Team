import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Settings, Save, AlertCircle } from 'lucide-react';
import GameSettings from '../components/GameSettings';
import ThemeSettings from '../components/ThemeSettings';

export default function SystemSettings() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'public_data', 'system_config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      } else {
        setError('ไม่พบข้อมูล System Config');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const docRef = doc(db, 'public_data', 'system_config');
      await updateDoc(docRef, config);
      alert('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleThemeChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      themeConfig: {
        ...(prev.themeConfig || {}),
        [field]: value,
      },
    }));
  };

  const handleSetDefaultTheme = () => {
    setConfig((prev) => ({
      ...prev,
      themeConfig: {
        ...(prev.themeConfig || {}),
        loginBackgroundUrl:
          'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000',
        marketBackgroundUrl:
          'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000',
        floatingObjectUrl: '',
      },
    }));
    alert('โหลดค่า Default Theme เรียบร้อย กรุณากดปุ่มบันทึก');
  };

  if (isLoading) return <div className="p-8">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">ตั้งค่าระบบ (System Settings)</h1>
            <p className="text-slate-500 font-medium">จัดการสถานะเกมและการออกแบบหน้าตา</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {config && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GameSettings config={config} handleInputChange={handleInputChange} />
          <ThemeSettings
            config={config}
            handleThemeChange={handleThemeChange}
            handleSetDefaultTheme={handleSetDefaultTheme}
          />
        </div>
      )}
    </div>
  );
}
