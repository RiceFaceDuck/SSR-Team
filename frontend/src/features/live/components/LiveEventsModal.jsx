import React, { useEffect, useState } from 'react';
import { liveMatchService } from '../../../services/firebase/liveMatchService';

export default function LiveEventsModal({ isOpen, onClose, match }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    const unsubscribe = liveMatchService.subscribeToLiveEvents((data) => {
      setEvents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            เหตุการณ์ทั้งหมด (Match Events)
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
          {loading ? (
            <div className="text-center py-8 text-sm text-slate-500 animate-pulse">กำลังโหลดข้อมูล...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400 italic">ยังไม่มีเหตุการณ์</div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-[45px] before:w-[2px] before:bg-slate-200 pl-2">
              {events.map((ev, index) => (
                <div key={ev.id || index} className="relative flex items-start gap-4">
                  {/* Timeline Dot & Minute */}
                  <div className="flex flex-col items-center w-[40px] shrink-0 pt-1 relative z-10 bg-slate-50/50">
                    <span className="text-[11px] font-bold text-slate-500 mb-1">{ev.minute}'</span>
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-500 shadow-sm"></div>
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-slate-800">{ev.primaryDetail}</span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                        {match?.homeTeam?.code} {ev.homeScore}-{ev.awayScore} {match?.awayTeam?.code}
                      </span>
                    </div>
                    {ev.secondaryDetail && (
                      <div className="text-xs text-slate-500">{ev.secondaryDetail}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
