import React from 'react';
import { Trash2, Wand2, Save } from 'lucide-react';

export default function FloatingActionBar({
  isPitchEmpty,
  isBenchEmpty,
  isSquadEmpty,
  startersCount,
  hasUnsavedChanges,
  onClearPitch,
  onAutoFill,
  onSave
}) {
  return (
    <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
      <div className="bg-slate-900/85 backdrop-blur-xl border border-slate-700/60 p-2 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-2">
        
        <button
          onClick={onClearPitch}
          disabled={isPitchEmpty}
          className={`flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-xl font-medium text-[10px] sm:text-xs transition-all flex-1
            ${isPitchEmpty 
              ? 'opacity-40 cursor-not-allowed text-slate-500 bg-transparent' 
              : 'text-rose-400 bg-slate-800/50 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 active:scale-95'
            }`}
        >
          <Trash2 size={18} className="mb-1" />
          ล้างสนาม
        </button>

        <button
          onClick={onAutoFill}
          disabled={isBenchEmpty || startersCount === 11}
          className={`flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex-[1.2] border
            ${isBenchEmpty || startersCount === 11
              ? 'opacity-40 cursor-not-allowed text-slate-500 bg-transparent border-transparent'
              : 'text-cyan-300 bg-gradient-to-b from-cyan-600/20 to-blue-600/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:border-cyan-400/80 active:scale-95'
            }`}
        >
          <Wand2 size={18} className={`mb-1 ${!isBenchEmpty && startersCount === 0 ? 'animate-pulse text-cyan-200' : ''}`} />
          จัดออโต้
        </button>

        <button
          onClick={onSave}
          disabled={isSquadEmpty || startersCount === 0}
          className={`flex flex-col items-center justify-center py-2 px-3 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex-[1.5] shadow-lg border
            ${isSquadEmpty || startersCount === 0
              ? 'opacity-40 cursor-not-allowed text-slate-500 bg-slate-800 border-slate-700 shadow-none'
              : hasUnsavedChanges
                ? 'text-white bg-gradient-to-t from-emerald-600 to-emerald-400 border-emerald-400 shadow-emerald-500/30 hover:shadow-emerald-500/50 active:scale-95'
                : 'text-emerald-400 bg-slate-800 border-emerald-500/30 shadow-none'
            }`}
        >
          <Save size={18} className={`mb-1 ${hasUnsavedChanges ? 'animate-pulse' : ''}`} />
          {hasUnsavedChanges ? 'บันทึกด่วน' : 'บันทึกแล้ว'}
        </button>
        
      </div>
    </div>
  );
}
