import React, { useState, useEffect } from 'react';
import { liveMatchService } from '../../../services/firebase/liveMatchService';
import LiveMatchScore from './LiveMatchScore';
import LiveLatestEvent from './LiveLatestEvent';
import LiveEventsModal from './LiveEventsModal';

export default function LiveMatchContainer() {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = liveMatchService.subscribeToLiveMatch((data) => {
      setMatch(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-100 p-2 rounded-2xl shadow-sm text-center animate-pulse flex-1 flex flex-col justify-center">
        <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto mb-2"></div>
        <div className="h-8 bg-slate-200 rounded w-1/4 mx-auto"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-white border border-slate-100 p-2 rounded-2xl shadow-sm text-center text-xs text-slate-500 flex-1 flex flex-col justify-center">
        ไม่มีข้อมูลการแข่งขัน
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-300/70 p-2 rounded-2xl shadow-xl shadow-slate-300/60 relative overflow-y-auto flex-1 flex flex-col shrink-0 custom-scrollbar">
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      
      <LiveMatchScore match={match} />
      <LiveLatestEvent match={match} />
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm mt-auto"
      >
        <span>เข้าชมเหตุการณ์ ทั้งหมด</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <LiveEventsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        match={match}
      />
    </div>
  );
}
