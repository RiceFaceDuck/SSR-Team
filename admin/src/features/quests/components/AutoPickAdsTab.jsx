import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Save, AlertCircle, Zap } from 'lucide-react';

export default function AutoPickAdsTab() {
  const [config, setConfig] = useState({ cooldownSeconds: 15, adLinkUrl: '' });
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
      if (docSnap.exists() && docSnap.data().autoPickConfig) {
        setConfig(docSnap.data().autoPickConfig);
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
      await updateDoc(docRef, { autoPickConfig: config });
      alert('บันทึกโฆษณา Auto Pick เรียบร้อย');
    } catch (err) {
      setError('บันทึกผิดพลาด: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-4">กำลังโหลด...</div>;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Zap className="text-amber-500" />
          โฆษณาสำหรับ Auto Pick
        </h2>
        <p className="text-sm text-slate-500 mt-1">ตั้งค่าลิงก์ที่จะไปแสดงเมื่อผู้เล่นกดจัดทีมอัตโนมัติในช่วงติด Cooldown</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">ระยะเวลารอ (Cooldown วินาที)</label>
          <input
            type="number"
            value={config.cooldownSeconds !== undefined ? config.cooldownSeconds : 15}
            onChange={(e) => setConfig({ ...config, cooldownSeconds: parseInt(e.target.value) || 0 })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">ลิงก์โฆษณา (Ad URL)</label>
          <input
            type="text"
            value={config.adLinkUrl || ''}
            onChange={(e) => setConfig({ ...config, adLinkUrl: e.target.value })}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="https://example.com/ad"
          />
        </div>

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
