import React, { useState, useEffect } from 'react';
import { Activity, Target, Link as LinkIcon, Chrome } from 'lucide-react';
import { useAdsStore } from '../../store/adsStore';

import QuestTab from './components/QuestTab';
import AdLinksTab from './components/AdLinksTab';
import AdSenseTab from './components/AdSenseTab';
import AutoPickAdsTab from './components/AutoPickAdsTab';

export default function QuestManager() {
  const [activeTab, setActiveTab] = useState('quests');
  const { fetchAdsConfig } = useAdsStore();

  useEffect(() => {
    // Load ads config when opening this manager
    fetchAdsConfig();
  }, [fetchAdsConfig]);

  const tabs = [
    { id: 'quests', label: 'ภารกิจสปอนเซอร์', icon: Target },
    { id: 'adlinks', label: 'ติดตั้ง ลิงก์โฆษณา', icon: LinkIcon },
    { id: 'adsense', label: 'จัดการ Google AdSense', icon: Chrome },
    { id: 'autopick', label: 'ฝังโฆษณาตามปุ่ม', icon: Activity },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Activity className="text-indigo-600" />
          จัดการสปอนเซอร์ & โฆษณา
        </h1>
        <p className="text-slate-500 mt-1">ระบบจัดแคมเปญรางวัลและตั้งค่าการแสดงผลโฆษณาทุกรูปแบบ</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'quests' && <QuestTab />}
        {activeTab === 'adlinks' && <AdLinksTab />}
        {activeTab === 'adsense' && <AdSenseTab />}
        {activeTab === 'autopick' && <AutoPickAdsTab />}
      </div>
    </div>
  );
}
