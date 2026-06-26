import React from 'react';
import { History, Clock } from 'lucide-react';

export default function MatchEventHistory({ events }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-h-[500px]">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <History size={18} className="text-blue-500" /> ประวัติเหตุการณ์
        </h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
          20 ล่าสุด
        </span>
      </div>

      <div className="p-0 overflow-y-auto custom-scrollbar flex-1">
        {events.length === 0 ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Clock size={32} className="text-slate-300 mb-2" />
            <p className="text-sm">ยังไม่มีเหตุการณ์ถูกบันทึก</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {events.map((ev, idx) => (
              <div
                key={ev.id || idx}
                className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue-600">{ev.minute}'</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-800 truncate">{ev.primaryDetail}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                      {formatTime(ev.timestamp)}
                    </span>
                  </div>
                  {ev.secondaryDetail && (
                    <p className="text-xs text-slate-500 truncate">{ev.secondaryDetail}</p>
                  )}
                  <div className="mt-2 text-[10px] font-bold text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded">
                    Score: {ev.homeScore} - {ev.awayScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
