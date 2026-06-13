import React, { useState, useEffect } from 'react';
import { apiFootballService } from '../../../services/api/apiFootballService';

export default function ApiSettingsPanel() {
  const [config, setConfig] = useState({ apiKey: '', leagueId: '', season: '' });
  const [autoMode, setAutoMode] = useState(false);

  useEffect(() => {
    const current = apiFootballService.getConfig();
    setConfig(current);
    const savedAutoMode = localStorage.getItem('autoSyncMode') === 'true';
    setAutoMode(savedAutoMode);
  }, []);

  const handleSave = () => {
    apiFootballService.setConfig(config.apiKey, config.leagueId, config.season);
    localStorage.setItem('autoSyncMode', autoMode);
    alert('บันทึกการตั้งค่า API และ Auto Mode เรียบร้อยแล้ว');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        ⚙️ ตั้งค่า API & Auto Mode
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">API Key (api-sports.io)</label>
          <input 
            type="password" 
            value={config.apiKey} 
            onChange={e => setConfig({...config, apiKey: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">League ID (ค่าเริ่มต้น 39 = พรีเมียร์ลีก)</label>
          <input 
            type="text" 
            value={config.leagueId} 
            onChange={e => setConfig({...config, leagueId: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Season (ฤดูกาล เช่น 2023)</label>
          <input 
            type="text" 
            value={config.season} 
            onChange={e => setConfig({...config, season: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <div className="w-full p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-indigo-900">ระบบ Auto-Sync สถิติ</p>
              <p className="text-xs text-indigo-700">ดึงข้อมูลอัตโนมัติทุกๆ 15 นาที (เมื่อเปิดหน้านี้ทิ้งไว้)</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={autoMode}
                onChange={e => setAutoMode(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900 transition-colors"
      >
        บันทึกการตั้งค่า
      </button>
    </div>
  );
}
