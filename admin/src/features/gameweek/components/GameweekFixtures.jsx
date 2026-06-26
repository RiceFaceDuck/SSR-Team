import React, { useState, useEffect } from 'react';
import { apiFootballService } from '../../../services/api/apiFootballService';

export default function GameweekFixtures({ gameweekId }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (gameweekId) {
      loadFixtures();
    }
  }, [gameweekId]);

  const loadFixtures = async () => {
    try {
      setLoading(true);
      setError(null);
      // สมมติว่า gwId มาในรูปแบบ "GW1" เราจะดึงตัวเลข 1 ออกมา
      const gwNumber = gameweekId.replace(/\D/g, '');
      if (!gwNumber) {
        throw new Error('รหัสสัปดาห์ไม่ถูกต้อง (ต้องมีตัวเลข เช่น GW1)');
      }

      const data = await apiFootballService.fetchFixtures(gwNumber);
      setFixtures(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusShort) => {
    switch (statusShort) {
      case 'FT':
      case 'AET':
      case 'PEN':
        return 'text-emerald-600 bg-emerald-50';
      case '1H':
      case '2H':
      case 'HT':
      case 'ET':
        return 'text-red-600 bg-red-50 animate-pulse';
      case 'NS':
        return 'text-slate-500 bg-slate-100';
      case 'PST':
      case 'CANC':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-slate-500 bg-slate-50';
    }
  };

  const getStatusText = (statusShort) => {
    switch (statusShort) {
      case 'FT':
        return 'จบการแข่งขัน';
      case 'NS':
        return 'ยังไม่เริ่ม';
      case '1H':
        return 'ครึ่งแรก';
      case '2H':
        return 'ครึ่งหลัง';
      case 'HT':
        return 'พักครึ่ง';
      case 'PST':
        return 'เลื่อนการแข่งขัน';
      default:
        return statusShort;
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            🗓️ ตารางการแข่งขัน
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            โปรแกรมฟุตบอลสำหรับสัปดาห์ <strong>{gameweekId}</strong>
          </p>
        </div>
        <button
          onClick={loadFixtures}
          disabled={loading}
          className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'กำลังโหลด...' : '🔄 รีเฟรชตาราง'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 text-sm">
          ❌ เกิดข้อผิดพลาด: {error}
        </div>
      )}

      {loading && !fixtures.length && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <div className="animate-spin text-2xl mb-2">⚽</div>
          <p>กำลังโหลดข้อมูลการแข่งขัน...</p>
        </div>
      )}

      {!loading && fixtures.length === 0 && !error && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-slate-500">ไม่พบตารางการแข่งขันสำหรับสัปดาห์นี้</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fixtures.map((match) => (
          <div
            key={match.fixture.id}
            className="border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-slate-50/50"
          >
            <div className="flex justify-between items-center mb-3 text-xs font-semibold">
              <span className="text-slate-500">
                {new Date(match.fixture.date).toLocaleString('th-TH', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span
                className={`px-2 py-1 rounded-md ${getStatusColor(match.fixture.status.short)}`}
              >
                {getStatusText(match.fixture.status.short)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex flex-col items-center flex-1">
                <img
                  src={match.teams.home.logo}
                  alt={match.teams.home.name}
                  className="w-10 h-10 mb-2 object-contain"
                />
                <span className="text-sm font-bold text-slate-800 text-center line-clamp-1">
                  {match.teams.home.name}
                </span>
              </div>

              {/* Score */}
              <div className="px-4 flex flex-col items-center">
                <div className="text-2xl font-black text-slate-800 bg-white px-4 py-1 rounded-lg border border-slate-200 shadow-sm">
                  {match.goals.home ?? '-'} : {match.goals.away ?? '-'}
                </div>
                {match.fixture.status.short === '1H' || match.fixture.status.short === '2H' ? (
                  <span className="text-xs font-bold text-red-500 mt-1 animate-pulse">
                    {match.fixture.status.elapsed}'
                  </span>
                ) : null}
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center flex-1">
                <img
                  src={match.teams.away.logo}
                  alt={match.teams.away.name}
                  className="w-10 h-10 mb-2 object-contain"
                />
                <span className="text-sm font-bold text-slate-800 text-center line-clamp-1">
                  {match.teams.away.name}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
