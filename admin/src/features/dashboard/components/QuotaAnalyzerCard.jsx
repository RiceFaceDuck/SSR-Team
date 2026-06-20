import React from 'react';
import { Database, RefreshCw, Users, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';
import { useQuotaAnalyzer } from '../hooks/useQuotaAnalyzer';

export default function QuotaAnalyzerCard() {
  const { 
    dau, 
    setDau, 
    isLoading, 
    ESTIMATED_QUOTA_PER_SESSION, 
    totalSessionReads, 
    totalSessionWrites, 
    refreshDAU 
  } = useQuotaAnalyzer();

  const totalDailyReads = totalSessionReads * dau;
  const totalDailyWrites = totalSessionWrites * dau;

  return (
    <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-sm border border-slate-100 mt-6 relative overflow-hidden transition-all hover:shadow-md">
      <div className="absolute -right-10 -top-10 text-indigo-50 opacity-50 pointer-events-none">
        <Database size={150} />
      </div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Database className="text-indigo-500" size={24} />
          Quota Analyzer
          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full ml-2">Estimation</span>
        </h2>
        <button 
          onClick={refreshDAU}
          disabled={isLoading}
          className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          title="Refresh DAU"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
        {/* DAU Control */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100/50">
          <div className="flex items-center gap-2 text-indigo-700 font-bold mb-2">
            <Users size={18} /> Daily Active Users (DAU)
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              value={dau} 
              onChange={(e) => setDau(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-2xl font-black bg-white border border-indigo-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-800"
            />
          </div>
          <p className="text-xs text-indigo-500 mt-2 flex items-center gap-1">
            <Info size={12}/> ดึงข้อมูลอัตโนมัติจาก lastLoginAt
          </p>
        </div>

        {/* Total Cost Board */}
        <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-white flex flex-col justify-center">
          <div className="text-sm text-slate-400 font-medium mb-1">Estimated Daily Quota</div>
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg">
                <ArrowDownCircle size={16} /> {(totalDailyReads).toLocaleString()} Reads
              </div>
              <div className="flex items-center gap-1 text-blue-400 font-bold text-lg">
                <ArrowUpCircle size={16} /> {(totalDailyWrites).toLocaleString()} Writes
              </div>
            </div>
            <Database size={32} className="text-slate-600" />
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 relative z-10">
        <h3 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-200 pb-2">ค่าเฉลี่ยต่อ 1 Session (1 ผู้ใช้งาน)</h3>
        <div className="space-y-2">
          {Object.entries(ESTIMATED_QUOTA_PER_SESSION).map(([key, data]) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-slate-600 font-medium">{data.label}</span>
              <div className="flex gap-4">
                <span className="text-emerald-600 w-16 text-right">{data.reads} <span className="text-[10px] text-slate-400">R</span></span>
                <span className="text-blue-600 w-16 text-right">{data.writes} <span className="text-[10px] text-slate-400">W</span></span>
              </div>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center font-bold">
            <span className="text-slate-800">รวมต่อคน (Average)</span>
            <div className="flex gap-4">
              <span className="text-emerald-600 w-16 text-right">{totalSessionReads} <span className="text-xs">R</span></span>
              <span className="text-blue-600 w-16 text-right">{totalSessionWrites} <span className="text-xs">W</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
