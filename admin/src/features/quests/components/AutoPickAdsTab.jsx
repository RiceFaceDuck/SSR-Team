import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Save, AlertCircle, Hand } from 'lucide-react';

const AVAILABLE_BUTTONS = [
  { id: 'autoPick', label: 'ปุ่มสุ่มทีมอัตโนมัติ (Auto Pick)' },
  { id: 'reset', label: 'ปุ่มล้างทีม (Reset)' },
  { id: 'saveTeam', label: 'ปุ่มบันทึกทีม (Save Team)' },
];

export default function AutoPickAdsTab() {
  const [config, setConfig] = useState({});
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
      if (docSnap.exists() && docSnap.data().buttonAdsConfig) {
        setConfig(docSnap.data().buttonAdsConfig);
      } else if (docSnap.exists() && docSnap.data().autoPickConfig) {
        // Migration from old schema
        setConfig({ autoPick: docSnap.data().autoPickConfig });
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลด: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      const docRef = doc(db, 'public_data', 'system_config');
      await updateDoc(docRef, { buttonAdsConfig: config });
      alert('บันทึกโฆษณาตามปุ่มเรียบร้อย');
    } catch (err) {
      setError('บันทึกผิดพลาด: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (btnId, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [btnId]: {
        ...(prev[btnId] || {}),
        [field]: value,
      },
    }));
  };

  if (isLoading) return <div className="p-4">กำลังโหลด...</div>;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Hand className="text-indigo-500" />
          ฝังโฆษณาตามปุ่ม (Button Ads)
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          ตั้งค่าลิงก์โฆษณาและระยะเวลารอ (Cooldown) สำหรับปุ่มที่มีในระบบ
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="space-y-4">
        {AVAILABLE_BUTTONS.map((btn) => {
          const btnConfig = config[btn.id] || { cooldownSeconds: 0, adLinkUrl: '' };
          return (
            <div
              key={btn.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-100"
            >
              <div className="md:col-span-4">
                <p className="font-bold text-slate-700">{btn.label}</p>
                <p className="text-xs text-slate-500">ID: {btn.id}</p>
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  Cooldown (วินาที)
                </label>
                <input
                  type="number"
                  value={btnConfig.cooldownSeconds !== undefined ? btnConfig.cooldownSeconds : 0}
                  onChange={(e) =>
                    handleChange(btn.id, 'cooldownSeconds', parseInt(e.target.value) || 0)
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="0 = ไม่ติดคูลดาวน์"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  ลิงก์โฆษณา (Ad URL)
                </label>
                <input
                  type="text"
                  value={btnConfig.adLinkUrl || ''}
                  onChange={(e) => handleChange(btn.id, 'adLinkUrl', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://..."
                />
              </div>
            </div>
          );
        })}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-6 flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าโฆษณา'}
        </button>
      </div>
    </div>
  );
}
