import React from 'react';
import { STYLES } from '../../config/theme';
import { Trophy, Download } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useLeaderboardData } from './hooks/useLeaderboardData';
import LeaderboardTabs from './components/LeaderboardTabs';
import LeaderboardList from './components/LeaderboardList';
import SponsorBanner from './components/SponsorBanner';

export default function LeaderboardScreen() {
  const themeConfig = useGameStore(state => state.themeConfig);
  const user = useGameStore(state => state.user);
  
  // Custom hook for SRP
  const { activeTab, setActiveTab, leaders, loading, exportCompetitorData, isExporting } = useLeaderboardData();

  const getSubTitle = () => {
    if (activeTab === 'weekly') return 'WEEKLY';
    if (activeTab === 'season') return 'GLOBAL';
    return 'CLUB';
  };

  return (
    <div 
      className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24 bg-cover bg-center bg-fixed relative flex flex-col"
      style={{ backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})` }}
    >
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center px-2 pt-2 pb-1">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 drop-shadow-md pb-1 flex items-center gap-2">
              <Trophy className="text-amber-500" size={32} /> RANK.
            </h2>
            <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-300 shadow-md px-3 py-1.5 rounded-lg flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold leading-none uppercase">
                {activeTab === 'weekly' ? 'สัปดาห์ล่าสุด' : activeTab === 'season' ? 'ซีซั่นนี้' : 'การจัดอันดับ'}
              </span>
              <span className="text-sm font-black text-indigo-600 leading-none mt-1">{getSubTitle()}</span>
            </div>
          </div>
        </div>

        {/* Sponsor Banner */}
        <SponsorBanner />

        {/* Download Data Button - Available to everyone before matches */}
        <div className="flex justify-end mb-3">
          <button 
            onClick={exportCompetitorData}
            disabled={isExporting}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <span className="animate-pulse">กำลังดาวน์โหลด...</span>
            ) : (
              <>
                <Download size={16} /> โหลดข้อมูลทีมคู่แข่ง (.txt)
              </>
            )}
          </button>
        </div>

        {/* Leaderboard Section */}
        <div className={STYLES.card}>
          <LeaderboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          
          <LeaderboardList 
            leaders={leaders} 
            loading={loading} 
            user={user} 
            activeTab={activeTab}
          />
        </div>
      </div>
    </div>
  );
}