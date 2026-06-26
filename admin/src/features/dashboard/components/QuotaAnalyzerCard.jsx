import React, { useState } from 'react';
import { Database, RefreshCw, Users, Settings, ArrowRight } from 'lucide-react';
import { useQuotaAnalyzer } from '../hooks/useQuotaAnalyzer';
import QuotaSimulatorModal from './QuotaSimulatorModal';

export default function QuotaAnalyzerCard() {
  const {
    dau,
    setDau,
    isLoading,
    ESTIMATED_QUOTA_PER_SESSION,
    updateQuotaEstimates,
    totalSessionReads,
    totalSessionWrites,
    refreshDAU,
  } = useQuotaAnalyzer();

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const totalDailyReads = totalSessionReads * dau;
  const totalDailyWrites = totalSessionWrites * dau;

  return (
    <div className="bg-white border border-slate-300 shadow-sm mt-6 font-sans rounded-md overflow-hidden flex flex-col">
      
      {/* Header Section - Vertical for narrow spaces */}
      <div className="flex flex-col p-4 border-b border-slate-300 bg-slate-50 gap-3">
        <div className="flex justify-between items-start">
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2 m-0 leading-tight">
            <Database size={18} className="text-slate-500" />
            <span>
              Quota Analyzer
              <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">
                Estimation Mode
              </span>
            </span>
          </h2>
          <button
            onClick={refreshDAU}
            disabled={isLoading}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
            title="Refresh DAU"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="w-full py-2 px-3 text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 flex items-center justify-center gap-1.5 shadow-sm rounded transition-colors"
        >
          <Settings size={14} /> Advanced Simulator
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        
        {/* DAU Box - Stacked */}
        <div className="border border-slate-300 bg-white p-3 rounded flex flex-col">
          <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <Users size={14} className="text-slate-400" /> Daily Active Users (DAU)
          </div>
          <input
            type="number"
            value={dau}
            onChange={(e) => setDau(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full text-xl font-black bg-slate-50 border border-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 text-center transition-all"
          />
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            * อิงจาก lastLoginAt ล่าสุด
          </p>
        </div>

        {/* Total Quota Box - Stacked */}
        <div className="border border-slate-300 bg-slate-800 p-3 rounded shadow-inner flex flex-col">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center border-b border-slate-700 pb-2">
            Estimated Daily Quota
          </div>
          <div className="flex justify-around items-center pt-1">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-black text-emerald-400">{totalDailyReads.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-slate-500 mt-0.5">READS</div>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-black text-blue-400">{totalDailyWrites.toLocaleString()}</div>
              <div className="text-[10px] font-bold text-slate-500 mt-0.5">WRITES</div>
            </div>
          </div>
        </div>

        {/* Breakdown Table - Compact */}
        <div className="border border-slate-300 rounded overflow-hidden">
          <div className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-2 border-b border-slate-300 flex items-center gap-1.5">
            <Database size={14} className="text-slate-500" />
            ค่าเฉลี่ยต่อ 1 Session
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-500 border-b border-slate-200">
                  <th className="px-3 py-2 font-bold uppercase">ระบบงาน</th>
                  <th className="px-3 py-2 font-bold text-right text-emerald-600">Reads</th>
                  <th className="px-3 py-2 font-bold text-right text-blue-600">Writes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {Object.entries(ESTIMATED_QUOTA_PER_SESSION).map(([key, data]) => (
                  <tr key={key} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 font-medium text-slate-700 max-w-[120px] truncate" title={data.label}>{data.label}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-600">{data.reads}</td>
                    <td className="px-3 py-2 text-right font-bold text-blue-600">{data.writes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t border-slate-300 font-bold">
                <tr>
                  <td className="px-3 py-2 text-right text-slate-600 text-[10px] uppercase">รวมเฉลี่ย</td>
                  <td className="px-3 py-2 text-right text-sm text-emerald-700">{totalSessionReads}</td>
                  <td className="px-3 py-2 text-right text-sm text-blue-700">{totalSessionWrites}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>

      {/* Simulator Modal */}
      <QuotaSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onApply={updateQuotaEstimates}
      />
    </div>
  );
}
