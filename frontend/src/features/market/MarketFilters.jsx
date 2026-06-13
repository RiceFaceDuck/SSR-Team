import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

const MarketFilters = ({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  activeTab,
  setActiveTab,
  setMarketFilterPos,
  setPendingTargetSlot
}) => {
  const tabs = [
    { label: 'ALL', value: 'ALL' },
    { label: 'FW', value: 'FW' },
    { label: 'MF', value: 'MF' },
    { label: 'DF', value: 'DF' },
    { label: 'GK', value: 'GK' }
  ];

  return (
    <div className="bg-gradient-to-b from-[#0a192f] to-[#112240] p-3 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.3)] border border-[#1a365d] mb-3 space-y-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
      
      {/* Search & Sort */}
      <div className="flex gap-2 relative z-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ, สโมสร..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d2341] border border-[#1a365d] shadow-inner rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all text-white placeholder-slate-400"
          />
        </div>
        <div className="relative shrink-0 w-[110px]">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#0d2341] border border-[#1a365d] shadow-inner text-white rounded-lg pl-9 pr-2 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] appearance-none cursor-pointer transition-all"
          >
            <option value="price-desc">แพงสุด</option>
            <option value="price-asc">ถูกสุด</option>
            <option value="points-desc">คะแนน</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <button 
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                setMarketFilterPos(tab.value); 
                setPendingTargetSlot(null); 
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold border transition-all 
                ${isActive 
                  ? 'bg-gradient-to-b from-[#3b82f6] to-[#2563eb] text-white border-[#1e40af] shadow-[0_2px_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-slate-700/50 text-slate-300 border-[#1a365d] shadow-sm hover:border-slate-500 hover:bg-slate-700'
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MarketFilters;
