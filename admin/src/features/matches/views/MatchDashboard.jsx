import React, { useState, useEffect } from 'react';
import { useLiveMatchAdmin } from '../hooks/useLiveMatchAdmin';
import MatchConfigPanel from '../components/MatchConfigPanel';
import MatchScoreController from '../components/MatchScoreController';
import MatchEventPublisher from '../components/MatchEventPublisher';
import MatchEventHistory from '../components/MatchEventHistory';
import LivePreviewBoard from '../components/LivePreviewBoard';
import { Trophy, AlertCircle } from 'lucide-react';

export default function MatchDashboard() {
  const {
    match,
    events,
    isLoading,
    isUpdating,
    error,
    updateMatchConfig,
    publishEvent,
    incrementScore,
  } = useLiveMatchAdmin();

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">กำลังโหลดข้อมูลการแข่งขัน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
              <Trophy size={28} />
            </div>
            จัดการการแข่งขันสด (Live Match)
          </h1>
          <p className="text-slate-500 mt-2">
            ควบคุมผลการแข่งขัน แจ้งเหตุการณ์สด และส่งข้อมูลตรงไปยังหน้าจอผู้เล่น
          </p>
        </div>

        {/* Status Indicator */}
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              สถานะระบบ
            </span>
            <span
              className={`text-sm font-bold ${isOnline ? 'text-emerald-700' : 'text-rose-600'}`}
            >
              {isOnline ? 'เชื่อมต่อแล้ว (Real-time)' : 'ขาดการเชื่อมต่อ (Offline)'}
            </span>
          </div>
          <span className="relative flex h-3 w-3">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}
            ></span>
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Row 1: Config & Score */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="xl:col-span-1">
              <MatchConfigPanel match={match} onSave={updateMatchConfig} isUpdating={isUpdating} />
            </div>
            <div className="xl:col-span-1">
              <MatchScoreController
                match={match}
                onIncrement={incrementScore}
                isUpdating={isUpdating}
              />
            </div>
          </div>

          {/* Row 2: Event Publisher */}
          <MatchEventPublisher match={match} onPublish={publishEvent} isUpdating={isUpdating} />
        </div>

        {/* Right Column: Preview & History (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="h-64 shrink-0">
            <LivePreviewBoard match={match} />
          </div>

          <div className="flex-1 min-h-[400px]">
            <MatchEventHistory events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
