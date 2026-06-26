import React, { useState } from 'react';
import { liveMatchAdminService } from '../../../services/firebase/liveMatchAdminService';

export default function LiveMatchController() {
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState({
    homeTeamName: '',
    homeTeamCode: '',
    homeTeamLogo: '',
    awayTeamName: '',
    awayTeamCode: '',
    awayTeamLogo: '',
    status: 'upcoming',
  });

  const [eventData, setEventData] = useState({
    homeScore: 0,
    awayScore: 0,
    minute: '',
    primaryDetail: '',
    secondaryDetail: '',
  });

  const handleUpdateMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await liveMatchAdminService.updateLiveMatchSettings(matchData);
      alert('บันทึกการตั้งค่าแมตช์สำเร็จ');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishEvent = async (e) => {
    e.preventDefault();
    if (!eventData.minute || !eventData.primaryDetail) {
      alert('กรุณากรอกนาที และเหตุการณ์หลัก');
      return;
    }
    setLoading(true);
    try {
      await liveMatchAdminService.publishEvent(eventData);
      alert('ยิงสดเหตุการณ์สำเร็จ!');
      // Reset details after publish
      setEventData((prev) => ({ ...prev, primaryDetail: '', secondaryDetail: '' }));
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          ตั้งค่าคู่แข่งขัน (Match Setup)
        </h2>
        <form onSubmit={handleUpdateMatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <h3 className="font-semibold text-slate-700">ทีมเย้า (Home)</h3>
              <input
                placeholder="ชื่อทีมเต็ม (เช่น Manchester Utd)"
                className="w-full p-2 text-sm border rounded"
                value={matchData.homeTeamName}
                onChange={(e) => setMatchData({ ...matchData, homeTeamName: e.target.value })}
              />
              <input
                placeholder="ชื่อย่อ (เช่น MUN)"
                className="w-full p-2 text-sm border rounded"
                value={matchData.homeTeamCode}
                onChange={(e) => setMatchData({ ...matchData, homeTeamCode: e.target.value })}
              />
              <input
                placeholder="URL โลโก้ทีม"
                className="w-full p-2 text-sm border rounded"
                value={matchData.homeTeamLogo}
                onChange={(e) => setMatchData({ ...matchData, homeTeamLogo: e.target.value })}
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
              <h3 className="font-semibold text-slate-700">ทีมเยือน (Away)</h3>
              <input
                placeholder="ชื่อทีมเต็ม (เช่น Liverpool)"
                className="w-full p-2 text-sm border rounded"
                value={matchData.awayTeamName}
                onChange={(e) => setMatchData({ ...matchData, awayTeamName: e.target.value })}
              />
              <input
                placeholder="ชื่อย่อ (เช่น LIV)"
                className="w-full p-2 text-sm border rounded"
                value={matchData.awayTeamCode}
                onChange={(e) => setMatchData({ ...matchData, awayTeamCode: e.target.value })}
              />
              <input
                placeholder="URL โลโก้ทีม"
                className="w-full p-2 text-sm border rounded"
                value={matchData.awayTeamLogo}
                onChange={(e) => setMatchData({ ...matchData, awayTeamLogo: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select
              className="p-2 border rounded text-sm"
              value={matchData.status}
              onChange={(e) => setMatchData({ ...matchData, status: e.target.value })}
            >
              <option value="upcoming">รอแข่งขัน (Upcoming)</option>
              <option value="LIVE">กำลังแข่งขัน (LIVE)</option>
              <option value="HT">พักครึ่ง (HT)</option>
              <option value="FT">จบการแข่งขัน (FT)</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              {loading ? 'Saving...' : 'บันทึกข้อมูลแมตช์'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          ยิงสดเหตุการณ์ (Live Broadcasting)
        </h2>
        <form onSubmit={handlePublishEvent} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">คะแนนทีมเย้า</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={eventData.homeScore}
                onChange={(e) =>
                  setEventData({ ...eventData, homeScore: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">คะแนนทีมเยือน</label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={eventData.awayScore}
                onChange={(e) =>
                  setEventData({ ...eventData, awayScore: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">นาทีปัจจุบัน</label>
              <input
                placeholder="เช่น 47, HT, 90+2"
                className="w-full p-2 border rounded"
                value={eventData.minute}
                onChange={(e) => setEventData({ ...eventData, minute: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              เหตุการณ์หลัก (บรรทัดแรก)
            </label>
            <input
              placeholder="เช่น B. Sesko Goal ⚽"
              className="w-full p-2 border rounded font-bold text-lg text-slate-800"
              value={eventData.primaryDetail}
              onChange={(e) => setEventData({ ...eventData, primaryDetail: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              รายละเอียดรอง (บรรทัดที่สอง - Optional)
            </label>
            <input
              placeholder="เช่น B. Fernandes Assist 👟"
              className="w-full p-2 border rounded text-slate-600"
              value={eventData.secondaryDetail}
              onChange={(e) => setEventData({ ...eventData, secondaryDetail: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white font-black text-lg rounded-xl shadow-lg hover:bg-red-700 hover:shadow-red-500/30 transition-all"
          >
            {loading ? 'Broadcasting...' : '📡 บรอดแคสต์เหตุการณ์ (Publish)'}
          </button>
        </form>
      </div>
    </div>
  );
}
