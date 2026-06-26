import React from 'react';
import { Calendar, Trophy, Building2 } from 'lucide-react';

export default function LeaderboardTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'weekly', label: 'ประจำสัปดาห์', icon: <Calendar size={14} /> },
    { id: 'season', label: 'ตลอดฤดูกาล', icon: <Trophy size={14} /> },
    { id: 'club', label: 'MY CLUB', icon: <Building2 size={14} /> },
  ];

  return (
    <div className="flex bg-slate-100 p-1 rounded-xl mb-4 shadow-inner">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
