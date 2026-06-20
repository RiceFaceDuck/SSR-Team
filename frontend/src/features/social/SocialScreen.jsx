import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import ReferralCard from './components/ReferralCard';
import LeagueManager from './components/LeagueManager';
import LeagueList from './components/LeagueList';
import FriendManager from './components/FriendManager';

export default function SocialScreen() {
  const themeConfig = useGameStore(state => state.themeConfig);
  const [refreshLeagues, setRefreshLeagues] = useState(0);
  const [leagueCount, setLeagueCount] = useState(0);
  const [activeTab, setActiveTab] = useState('leagues'); // 'leagues' | 'friends'

  const handleLeagueAdded = () => {
    setRefreshLeagues(prev => prev + 1);
  };

  return (
    <div 
      className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24 bg-cover bg-center bg-fixed relative flex flex-col"
      style={{ backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})` }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center px-2 pt-2 pb-1">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 drop-shadow-md pb-1 flex items-center gap-2">
              <Users className="text-indigo-600" size={32} /> SOCIAL.
            </h2>
            <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-300 shadow-md px-3 py-1.5 rounded-lg flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold leading-none uppercase">คอมมูนิตี้</span>
              <span className="text-sm font-black text-indigo-600 leading-none mt-1">LEAGUES</span>
            </div>
          </div>
        </div>

        {/* บล็อกชวนเพื่อน */}
        <ReferralCard />

        {/* Tab Navigation */}
        <div className="flex bg-white/80 backdrop-blur-md rounded-xl p-1 mb-4 shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('leagues')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'leagues' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            ลีก & การดวล
          </button>
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'friends' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            ระบบเพื่อน
          </button>
        </div>

        {activeTab === 'leagues' ? (
          <>
            {/* จัดการลีก (สร้าง/เข้าร่วม) */}
            <LeagueManager onLeagueAdded={handleLeagueAdded} compactMode={leagueCount > 0} />

            {/* รายการลีกส่วนตัว */}
            <LeagueList refreshTrigger={refreshLeagues} onLeaguesLoaded={setLeagueCount} />
          </>
        ) : (
          <FriendManager />
        )}

      </div>
    </div>
  );
}