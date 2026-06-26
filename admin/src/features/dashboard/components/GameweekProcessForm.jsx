import React from 'react';
import { Calculator, Loader2, Activity } from 'lucide-react';

export default function GameweekProcessForm({
  isAutoMode,
  setIsAutoMode,
  isLoadingApiGw,
  apiGameweeks,
  processGwId,
  setProcessGwId,
  isProcessing,
  onProcessClick,
  gwHistory,
}) {
  return (
    <div className="w-full mt-2 flex flex-col gap-4">
      {/* Process Action */}
      <div className="bg-white rounded-xl p-4 border border-emerald-100 flex flex-col md:flex-row items-end gap-4 shadow-sm w-full">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-emerald-700">
              ระบุตำแหน่งบันทึกผล (Gameweek ID)
            </label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-emerald-600">Auto</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isAutoMode}
                  onChange={(e) => setIsAutoMode(e.target.checked)}
                />
                <div className="w-6 h-3 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2 after:w-2 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {isAutoMode ? (
            <select
              value={processGwId}
              onChange={(e) => setProcessGwId(e.target.value)}
              disabled={isLoadingApiGw}
              className="w-full border border-emerald-200 rounded-lg px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">เลือกสัปดาห์</option>
              {apiGameweeks.map((gw, idx) => (
                <option key={idx} value={gw}>
                  บันทึกคะแนนเป็น {gw}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={processGwId}
              onChange={(e) => setProcessGwId(e.target.value)}
              placeholder="เช่น GW1"
              className="w-full border border-emerald-200 rounded-lg px-4 py-2 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
            />
          )}
        </div>
        <button
          onClick={onProcessClick}
          disabled={isProcessing}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-emerald-600/30 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Calculator size={20} />}
          {isProcessing ? 'กำลังคำนวณ...' : 'บันทึกผลการแข่งขัน'}
        </button>
      </div>

      {/* History List */}
      {gwHistory.length > 0 && (
        <div className="w-full mt-2 text-sm">
          <p className="font-bold text-slate-700 mb-2">ประวัติการบันทึกผลก่อนหน้านี้:</p>
          <div className="space-y-2">
            {gwHistory.slice(0, 3).map((history) => (
              <div
                key={history.id}
                className="flex justify-between items-center bg-white border border-emerald-100 px-4 py-2 rounded-lg"
              >
                <span className="font-bold text-slate-700">{history.id}</span>
                <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md flex items-center gap-1">
                  <Activity size={12} />{' '}
                  {history.status === 'completed' ? 'เรียบร้อยดี (Completed)' : history.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
