import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function ScoreStatItem({ ruleKey, label, desc, ruleData, onUpdate }) {
  const data = ruleData || {};

  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-3 hover:bg-slate-100 transition-colors">
      <div className="mb-3">
        <ToggleSwitch
          label={label}
          description={desc || data.desc}
          checked={data.isActive}
          onChange={(val) => onUpdate(ruleKey, 'isActive', val)}
        />
      </div>
      {data.isActive && (
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">คะแนน (Points):</span>
            <input
              type="number"
              value={data.value || 0}
              onChange={(e) => onUpdate(ruleKey, 'value', parseInt(e.target.value) || 0)}
              className="w-20 border border-slate-300 rounded-lg px-3 py-1.5 text-center focus:border-blue-500 outline-none"
            />
          </div>
          {data.per && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">ต่อจำนวน (Per):</span>
              <input
                type="number"
                value={data.per || 0}
                onChange={(e) => onUpdate(ruleKey, 'per', parseInt(e.target.value) || 0)}
                className="w-20 border border-slate-300 rounded-lg px-3 py-1.5 text-center focus:border-blue-500 outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
