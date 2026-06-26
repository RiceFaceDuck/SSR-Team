import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function RuleSettingItem({
  label,
  description,
  info,
  isActive,
  onToggle,
  hasInput = false,
  inputLabel,
  inputValue,
  onInputChange,
  inputStep = '1',
}) {
  return (
    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 hover:scale-[1.01] transition-all duration-300 mt-4 shadow-sm hover:shadow-md">
      <ToggleSwitch
        label={label}
        description={description}
        info={info}
        checked={isActive}
        onChange={onToggle}
      />
      {hasInput && isActive && (
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-right-4">
          <label className="text-sm font-bold text-slate-700">{inputLabel}:</label>
          <input
            type="number"
            step={inputStep}
            value={inputValue || 0}
            onChange={(e) => onInputChange(parseFloat(e.target.value) || 0)}
            className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-center transition-all"
          />
        </div>
      )}
    </div>
  );
}
