import React from 'react';

const PlayerStatsForm = ({ stats, handleChange }) => {
  return (
    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        สถิติความสามารถ (Attributes) <span className="text-[10px] font-normal text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">0-99</span>
      </h3>
      
      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        {[
          { id: 'pace', label: 'ความเร็ว (PAC)', color: 'text-blue-600' },
          { id: 'shooting', label: 'การยิง (SHO)', color: 'text-rose-600' },
          { id: 'passing', label: 'การจ่าย (PAS)', color: 'text-amber-600' },
          { id: 'dribbling', label: 'เลี้ยงบอล (DRI)', color: 'text-purple-600' },
          { id: 'defending', label: 'เกมรับ (DEF)', color: 'text-emerald-600' },
          { id: 'physical', label: 'กายภาพ (PHY)', color: 'text-slate-600' }
        ].map((stat) => (
          <div key={stat.id}>
            <label className="block text-[11px] font-bold text-gray-500 mb-1">{stat.label}</label>
            <input
              type="number"
              min="0" max="99"
              name={stat.id}
              value={stats[stat.id] || 0}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono ${stat.color} font-bold text-center bg-white transition-all`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatsForm;
