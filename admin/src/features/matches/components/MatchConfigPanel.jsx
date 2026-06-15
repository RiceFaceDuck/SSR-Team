import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export default function MatchConfigPanel({ match, onSave, isUpdating }) {
  const [formData, setFormData] = useState({
    homeTeamName: '',
    homeTeamCode: '',
    homeTeamLogo: '',
    awayTeamName: '',
    awayTeamCode: '',
    awayTeamLogo: '',
    minute: '0',
    status: 'upcoming'
  });

  // Sync form with match data when match loads or updates
  useEffect(() => {
    if (match) {
      setFormData({
        homeTeamName: match.homeTeam?.name || '',
        homeTeamCode: match.homeTeam?.code || '',
        homeTeamLogo: match.homeTeam?.logo || '',
        awayTeamName: match.awayTeam?.name || '',
        awayTeamCode: match.awayTeam?.code || '',
        awayTeamLogo: match.awayTeam?.logo || '',
        minute: match.minute || '0',
        status: match.status || 'upcoming'
      });
    }
  }, [match]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...match, // preserve scores
      ...formData
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon /> ตั้งค่าแมตช์พื้นฐาน
        </h3>
        {match?.status === 'LIVE' && (
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold animate-pulse">
            LIVE
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* ทีมเหย้า */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700 border-b pb-2">ทีมเหย้า (Home)</h4>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อทีม</label>
              <input type="text" name="homeTeamName" value={formData.homeTeamName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Manchester United" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">ตัวย่อ (3 ตัวอักษร)</label>
                <input type="text" name="homeTeamCode" value={formData.homeTeamCode} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg uppercase" placeholder="MUN" maxLength={3} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Logo URL</label>
                <input type="url" name="homeTeamLogo" value={formData.homeTeamLogo} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* ทีมเยือน */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-700 border-b pb-2">ทีมเยือน (Away)</h4>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">ชื่อทีม</label>
              <input type="text" name="awayTeamName" value={formData.awayTeamName} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Liverpool" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">ตัวย่อ (3 ตัวอักษร)</label>
                <input type="text" name="awayTeamCode" value={formData.awayTeamCode} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg uppercase" placeholder="LIV" maxLength={3} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Logo URL</label>
                <input type="url" name="awayTeamLogo" value={formData.awayTeamLogo} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        {/* สถานะและเวลา */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">สถานะการแข่งขัน</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="upcoming">รอแข่งขัน (Upcoming)</option>
              <option value="LIVE">กำลังแข่งขัน (LIVE)</option>
              <option value="HT">พักครึ่ง (HT)</option>
              <option value="FT">จบการแข่งขัน (FT)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">นาทีปัจจุบัน (ใส่ตัวเลข หรือ HT/FT)</label>
            <input type="text" name="minute" value={formData.minute} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 45+2" />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isUpdating}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isUpdating ? <span className="animate-spin text-xl">⏳</span> : <Save size={18} />}
            บันทึกการตั้งค่า
          </button>
        </div>
      </form>
    </div>
  );
}

// Inline Icon
function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  )
}
