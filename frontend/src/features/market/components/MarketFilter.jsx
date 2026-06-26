import React from 'react';

export default function MarketFilter() {
  const tabs = ['ทั้งหมด', 'กองหน้า', 'กองกลาง', 'กองหลัง', 'ผู้รักษาประตู'];

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
            idx === 0
              ? 'bg-slate-800 text-white border-slate-800 shadow-md'
              : 'bg-white text-slate-600 border-slate-200 shadow-sm hover:border-slate-400'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
