import React from 'react';
import { Activity, Trophy, Loader2 } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import GameweekStatusCard from '../components/GameweekStatusCard';
import GameweekPipeline from '../components/GameweekPipeline';
import QuotaAnalyzerCard from '../components/QuotaAnalyzerCard';

export default function Dashboard() {
  const {
    config,
    setConfig,
    isLoading,
    isUpdating,
    isProcessing,
    gwHistory,
    apiGameweeks,
    isLoadingApiGw,
    isAutoMode,
    setIsAutoMode,
    updateSystemState,
    handleProcessGameweek
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy size={160} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <Activity className="text-blue-400" size={32} />
            GAMEWEEK LIFECYCLE MANAGER
          </h1>
          <p className="text-blue-200 font-medium max-w-2xl">
            แผงควบคุมหลักสำหรับจัดการวัฏจักรของเกมในแต่ละสัปดาห์ ควบคุมสถานะและเข้าถึงเครื่องมือคำนวณได้อย่างรวดเร็ว
          </p>
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Quick Status & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <GameweekStatusCard 
            config={config}
            setConfig={setConfig}
            isUpdating={isUpdating}
            isLoadingApiGw={isLoadingApiGw}
            apiGameweeks={apiGameweeks}
            isAutoMode={isAutoMode}
            setIsAutoMode={setIsAutoMode}
            updateSystemState={updateSystemState}
          />
          <QuotaAnalyzerCard />
        </div>

        {/* Right: The Loop Pipeline */}
        <div className="lg:col-span-2">
          <GameweekPipeline 
            config={config}
            isAutoMode={isAutoMode}
            setIsAutoMode={setIsAutoMode}
            isLoadingApiGw={isLoadingApiGw}
            apiGameweeks={apiGameweeks}
            isProcessing={isProcessing}
            handleProcessGameweek={handleProcessGameweek}
            gwHistory={gwHistory}
          />
        </div>

      </div>
    </div>
  );
}
