import React, { useState, useEffect } from 'react';
import { X, Save, Settings as SettingsIcon, Database, Clock, ShieldAlert } from 'lucide-react';

const ApiSettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    season: '2023',
    leagueId: '39', // 39 = Premier League
    autoSyncInterval: 'never',
    overridePrice: false,
    overrideStats: true,
  });

  // Load initial from localStorage
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('apiFootballSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('apiFootballSettings', JSON.stringify(settings));
    alert('บันทึกการตั้งค่า API เรียบร้อยแล้ว');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">API-Football Settings</h2>
              <p className="text-xs text-gray-500">จัดการการดึงข้อมูลกีฬาฟุตบอล</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Main Config */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4" /> แหล่งข้อมูลหลัก
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">League ID</label>
                <input 
                  type="text" 
                  value={settings.leagueId}
                  onChange={e => setSettings({...settings, leagueId: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="เช่น 39 (พรีเมียร์ลีก)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                <input 
                  type="text" 
                  value={settings.season}
                  onChange={e => setSettings({...settings, season: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                  placeholder="เช่น 2023"
                />
              </div>
            </div>
          </div>

          {/* Sync Rules */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> กฎการอัปเดต (Overrides)
            </h3>
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className="flex items-start cursor-pointer group">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.overrideStats}
                    onChange={e => setSettings({...settings, overrideStats: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded transition-colors"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">อนุญาตให้อัปเดตสถิติ (Stats)</span>
                  <p className="text-gray-500 text-xs mt-0.5">เช่น Goals, Assists, Clean Sheets จะถูกแทนที่ด้วยข้อมูลจาก API ล่าสุด</p>
                </div>
              </label>

              <label className="flex items-start cursor-pointer group">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={settings.overridePrice}
                    onChange={e => setSettings({...settings, overridePrice: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded transition-colors"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">อนุญาตให้อัปเดตราคา (Price) อัตโนมัติ</span>
                  <p className="text-gray-500 text-xs mt-0.5">ระวัง: หากเปิดใช้งาน ราคาที่คุณตั้งไว้ด้วยมือจะถูกเขียนทับด้วยสูตรคำนวณจาก API ทันที</p>
                </div>
              </label>
            </div>
          </div>

          {/* Automations */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" /> ระบบอัตโนมัติ (Automation)
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ความถี่ในการดึงข้อมูลเบื้องหลัง (Background Sync)</label>
              <select
                value={settings.autoSyncInterval}
                onChange={e => setSettings({...settings, autoSyncInterval: e.target.value})}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="never">ปิดการใช้งาน (Manual เท่านั้น)</option>
                <option value="1h">ทุกๆ 1 ชั่วโมง</option>
                <option value="12h">ทุกๆ 12 ชั่วโมง</option>
                <option value="24h">ทุกๆ 24 ชั่วโมง (แนะนำ)</option>
              </select>
              <p className="mt-2 text-xs text-rose-500 font-medium">
                * ระวัง: การตั้งค่านี้อาจส่งผลต่อ API Quota ของคุณ (API-Sports ให้โควต้าฟรี 100 requests/วัน)
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-lg transition-colors">
            ยกเลิก
          </button>
          <button onClick={handleSave} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiSettingsModal;
