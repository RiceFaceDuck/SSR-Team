import React from 'react';

export default function ToggleSwitch({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100">
      <div>
        <p className="font-bold text-slate-800">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
        <input 
          type="checkbox" 
          className="sr-only peer"
          checked={checked || false}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
      </label>
    </div>
  );
}
