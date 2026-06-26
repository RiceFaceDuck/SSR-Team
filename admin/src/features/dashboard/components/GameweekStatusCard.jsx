import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function GameweekStatusCard({
  config,
  setConfig,
  isUpdating,
  isLoadingApiGw,
  apiGameweeks,
  isAutoMode,
  setIsAutoMode,
  updateSystemState,
}) {
  const isMarketOpen = config?.isMarketOpen ?? true;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
      <div
        className={`absolute top-0 left-0 w-full h-2 ${isMarketOpen ? 'bg-emerald-500' : 'bg-red-500'}`}
      ></div>
      <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <ShieldAlert className="text-slate-400" size={20} />
        สถานะปัจจุบัน
      </h2>

      <div className="space-y-6">
        {/* Gameweek Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-slate-600">
              รอบการแข่งขัน (Gameweek)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Auto (API)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isAutoMode}
                  onChange={(e) => setIsAutoMode(e.target.checked)}
                />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAutoMode ? (
              <select
                value={config?.currentGameweek || ''}
                onChange={(e) => setConfig({ ...config, currentGameweek: e.target.value })}
                disabled={isLoadingApiGw}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {isLoadingApiGw ? (
                  <option>กำลังโหลด...</option>
                ) : (
                  <option value="">เลือกสัปดาห์ (GW)</option>
                )}
                {apiGameweeks.map((gw, idx) => (
                  <option key={idx} value={gw}>
                    สัปดาห์ที่ {gw.replace(/\D/g, '')} ({gw})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={config?.currentGameweek || ''}
                onChange={(e) => setConfig({ ...config, currentGameweek: e.target.value })}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="พิมพ์ชื่อรอบด้วยตัวเอง (เช่น GW1)"
              />
            )}

            <button
              onClick={() => updateSystemState('currentGameweek', config.currentGameweek)}
              disabled={isUpdating || !config?.currentGameweek}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
              title="บันทึก Gameweek ลงระบบ"
            >
              <RefreshCw size={20} className={isUpdating ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Market Toggle */}
        <div
          className="p-4 rounded-2xl border-2 transition-colors duration-300 flex items-center justify-between cursor-pointer"
          onClick={() => updateSystemState('isMarketOpen', !isMarketOpen)}
          style={{
            borderColor: isMarketOpen ? '#10b981' : '#ef4444',
            backgroundColor: isMarketOpen ? '#ecfdf5' : '#fef2f2',
          }}
        >
          <div>
            <p
              className={`font-black text-lg ${isMarketOpen ? 'text-emerald-700' : 'text-red-700'}`}
            >
              ตลาด{isMarketOpen ? 'เปิด' : 'ปิด'}
            </p>
            <p
              className={`text-xs font-bold ${isMarketOpen ? 'text-emerald-600/70' : 'text-red-600/70'}`}
            >
              {isMarketOpen ? 'ผู้เล่นสามารถจัดทีมได้' : 'ล็อกทีม รอผลแข่ง'}
            </p>
          </div>

          {/* Switch UI */}
          <div
            className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors duration-300 ${isMarketOpen ? 'bg-emerald-500' : 'bg-red-500'}`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isMarketOpen ? 'translate-x-6' : 'translate-x-0'}`}
            ></div>
          </div>
        </div>

        {/* Registration Toggle */}
        <div
          className="p-4 rounded-2xl border transition-colors duration-300 flex items-center justify-between cursor-pointer border-slate-200 hover:bg-slate-50"
          onClick={() =>
            updateSystemState('isRegistrationOpen', !(config?.isRegistrationOpen ?? true))
          }
        >
          <div>
            <p className="font-bold text-slate-800">เปิดลงทะเบียนเข้าแข่งขัน</p>
            <p className="text-xs text-slate-500">อนุญาตการสร้างทีมใหม่</p>
          </div>
          <div
            className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors duration-300 ${(config?.isRegistrationOpen ?? true) ? 'bg-indigo-500' : 'bg-slate-300'}`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${(config?.isRegistrationOpen ?? true) ? 'translate-x-6' : 'translate-x-0'}`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
