import React from 'react';
import { Zap, Trash2 } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function PitchActionButtons() {
  const { autoFillTeam, clearPitch, mySquad } = useUserStore();

  const startersCount = mySquad.filter(p => p.isStarting).length;

  const handleAutoFill = () => {
    const result = autoFillTeam();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleClearPitch = () => {
    if (startersCount === 0) {
      toast.info("สนามว่างอยู่แล้วครับ");
      return;
    }
    
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 50, 20]);
    }
    
    clearPitch();
    toast.success("ดึงนักเตะกลับม้านั่งสำรองทั้งหมดแล้ว");
  };

  return (
    <div className="flex gap-2 mb-3 px-2 z-20 relative">
      {/* ปุ่มจัดทีมอัตโนมัติ (Auto-Fill) */}
      <button
        onClick={handleAutoFill}
        className="flex-1 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 
                   text-slate-900 font-bold py-2 px-3 rounded-lg shadow-md hover:shadow-[0_4px_12px_rgba(245,158,11,0.3)] 
                   active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-amber-300/50"
      >
        <Zap size={14} className="fill-slate-900" />
        <span className="tracking-wide text-xs sm:text-sm">จัดทีมอัตโนมัติ</span>
      </button>

      {/* ปุ่มล้างสนาม (Clear Pitch) */}
      <button
        onClick={handleClearPitch}
        disabled={startersCount === 0}
        className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 border shadow-md tracking-wide text-xs sm:text-sm
          ${startersCount === 0 
            ? 'bg-slate-800/50 text-slate-500 border-slate-700 cursor-not-allowed shadow-none' 
            : 'bg-slate-800/90 text-rose-400 border-slate-600 hover:bg-slate-700 hover:border-rose-500/50 hover:shadow-[0_4px_12px_rgba(225,29,72,0.2)] active:scale-95'
          }`}
      >
        <Trash2 size={14} />
        <span>ล้างสนาม</span>
      </button>
    </div>
  );
}