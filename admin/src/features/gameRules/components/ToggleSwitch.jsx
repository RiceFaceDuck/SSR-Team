import React, { useState } from 'react';
import { Info } from 'lucide-react';

export default function ToggleSwitch({ label, description, info, checked, onChange }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex flex-col p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100">
      <div className="flex items-center justify-between relative">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2">
            <p className="font-bold text-slate-800">{label}</p>
            {info && (
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info size={16} className="text-slate-400 hover:text-indigo-500 cursor-help" />
                {showTooltip && (
                  <div className="absolute left-0 top-6 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-50 whitespace-pre-line animate-in fade-in zoom-in-95 duration-200">
                    {info}
                    {/* Tooltip arrow */}
                    <div className="absolute -top-1.5 left-1 w-3 h-3 bg-slate-800 rotate-45"></div>
                  </div>
                )}
              </div>
            )}
          </div>
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
    </div>
  );
}
