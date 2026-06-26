import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function PositionScoreCard({ ruleKey, label, desc, ruleData, onUpdate }) {
  const data = ruleData || {};

  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <ToggleSwitch
        label={label}
        description={desc}
        checked={data.isActive}
        onChange={(val) => onUpdate(ruleKey, 'isActive', val)}
      />
      {data.isActive && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {['FWD', 'MID', 'DEF', 'GK'].map((pos) => (
            <div key={`${ruleKey}-${pos}`}>
              <label className="block text-xs font-bold text-slate-500 mb-1">{pos}</label>
              <input
                type="number"
                value={data[pos] || 0}
                onChange={(e) => onUpdate(ruleKey, pos, parseInt(e.target.value) || 0)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
