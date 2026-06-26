import React, { useState, useEffect } from 'react';
import { useAdsStore } from '../../../store/adsStore';
import { Code, Settings } from 'lucide-react';

export default function AdSenseTab() {
  const { googleAdsense, updateGoogleAdsense, isLoading } = useAdsStore();
  const [localConfig, setLocalConfig] = useState({ clientId: '', slotId: '', isActive: false });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (googleAdsense) {
      setLocalConfig(googleAdsense);
    }
  }, [googleAdsense]);

  const handleChange = (field, value) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateGoogleAdsense(localConfig);
      if (res.success) {
        alert('บันทึกข้อมูล Google AdSense เรียบร้อย');
      } else {
        alert('เกิดข้อผิดพลาด: ' + res.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">จัดการ Google AdSense</h2>
          <p className="text-sm text-slate-500">ตั้งค่ารหัสโฆษณา Google AdSense เพื่อแสดงผลในเกม</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="p-3 bg-white text-indigo-600 rounded-lg shadow-sm">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">สถานะการใช้งาน Google AdSense</h3>
              <p className="text-sm text-slate-500">
                หากเปิดใช้งาน ระบบจะพยายามโหลดโฆษณาจาก Google แทน Custom Ads
              </p>
            </div>
            <div className="ml-auto">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={localConfig.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors ${localConfig.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${localConfig.isActive ? 'transform translate-x-6' : ''}`}
                  ></div>
                </div>
                <div className="ml-3 text-sm font-bold text-slate-700">
                  {localConfig.isActive ? 'เปิดใช้งานอยู่' : 'ปิดใช้งาน'}
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Data Client ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Code size={16} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. ca-pub-1234567890123456"
                  value={localConfig.clientId}
                  onChange={(e) => handleChange('clientId', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">รหัสผู้โฆษณา (data-ad-client)</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Data Slot ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Code size={16} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={localConfig.slotId}
                  onChange={(e) => handleChange('slotId', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">รหัสช่องโฆษณา (data-ad-slot)</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
            <h4 className="text-amber-800 font-bold text-sm mb-1">หมายเหตุ</h4>
            <p className="text-amber-700 text-xs leading-relaxed">
              การแสดงผล Google AdSense จะทำงานได้จริงบน Domain ที่ได้รับการอนุมัติจาก Google
              แล้วเท่านั้น ในการทดสอบแบบ Localhost โฆษณาอาจแสดงเป็นพื้นที่ว่าง
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold shadow-sm shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า AdSense'}
          </button>
        </div>
      </div>
    </div>
  );
}
