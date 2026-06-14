import React from 'react';

const PlayerStatsTable = ({ players, handleStatChange, saveStats, savingId }) => {
  return (
    <div className="overflow-y-auto max-h-[500px] border border-slate-100 rounded-lg shadow-inner">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 sticky top-0 shadow-sm z-10">
          <tr>
            <th className="px-4 py-3 font-semibold">นักเตะ</th>
            <th className="px-4 py-3 w-20 font-semibold text-center">ลงสนาม</th>
            <th className="px-4 py-3 w-20 text-blue-700 bg-blue-50/50 font-semibold text-center">ยิง</th>
            <th className="px-4 py-3 w-20 text-blue-700 bg-blue-50/50 font-semibold text-center">จ่าย</th>
            <th className="px-4 py-3 w-20 text-emerald-700 bg-emerald-50/50 font-semibold text-center">คลีนชีต</th>
            <th className="px-4 py-3 w-20 text-amber-600 bg-amber-50/50 font-semibold text-center">เหลือง</th>
            <th className="px-4 py-3 w-20 text-red-600 bg-red-50/50 font-semibold text-center">แดง</th>
            <th className="px-4 py-3 w-24 text-center font-semibold">จัดการ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {players.map(p => (
            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">
                <div className="flex items-center gap-3">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">👤</div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight">{p.sku || '-'} • {p.position}</span>
                  </div>
                </div>
              </td>
              
              {['minutesPlayed'].map(field => (
                <td key={field} className="px-4 py-2">
                  <input type="number" min="0" className="w-16 px-2 py-1.5 border border-slate-200 rounded text-center focus:ring-2 focus:ring-blue-100 outline-none transition-all" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                </td>
              ))}
              
              {/* API Fields: Goals, Assists */}
              {['goals', 'assists'].map(field => (
                <td key={field} className="px-4 py-2 bg-blue-50/20">
                  <input type="number" min="0" className="w-16 px-2 py-1.5 border border-blue-200 rounded text-center text-blue-900 font-bold focus:ring-2 focus:ring-blue-300 outline-none transition-all bg-blue-50" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                </td>
              ))}
              
              {/* Clean sheets */}
              {['cleanSheets'].map(field => (
                <td key={field} className="px-4 py-2 bg-emerald-50/20">
                  <input type="number" min="0" className="w-16 px-2 py-1.5 border border-emerald-200 rounded text-center text-emerald-900 font-bold focus:ring-2 focus:ring-emerald-300 outline-none transition-all bg-emerald-50" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                </td>
              ))}
              
              {/* Cards */}
              {['yellowCards'].map(field => (
                <td key={field} className="px-4 py-2 bg-amber-50/20">
                  <input type="number" min="0" className="w-16 px-2 py-1.5 border border-amber-200 rounded text-center text-amber-900 font-bold focus:ring-2 focus:ring-amber-300 outline-none transition-all bg-amber-50" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                </td>
              ))}
              {['redCards'].map(field => (
                <td key={field} className="px-4 py-2 bg-red-50/20">
                  <input type="number" min="0" className="w-16 px-2 py-1.5 border border-red-200 rounded text-center text-red-900 font-bold focus:ring-2 focus:ring-red-300 outline-none transition-all bg-red-50" value={p.stats?.[field] || 0} onChange={(e) => handleStatChange(p.id, field, e.target.value)} />
                </td>
              ))}

              <td className="px-4 py-2 text-center">
                <button 
                  onClick={() => saveStats(p.id, p.stats)}
                  disabled={savingId === p.id}
                  className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 text-xs font-semibold w-full"
                >
                  {savingId === p.id ? 'กำลังเซฟ...' : 'บันทึกคนนี้'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerStatsTable;
