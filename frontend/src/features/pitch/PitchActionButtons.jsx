import React from 'react';
import { Zap, Trash2 } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function PitchActionButtons() {
  const { autoFillTeam, clearPitch, mySquad } = useUserStore();

  // เช็คว่ามีตัวจริงบนสนามกี่คน
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
    
    // 📳 Haptic feedback สั่นตอนล้างสนาม
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([20, 50, 20]);
    }
    
    clearPitch();
    toast.success("ดึงนักเตะกลับม้านั่งสำรองทั้งหมดแล้ว");
  };

  return (
    <div className="flex gap-3 mb-4 z-20 relative">
      {/* ปุ่มจัดทีมอัตโนมัติ (Auto-Fill) */}
      <button
        onClick={handleAutoFill}
        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 
                   text-slate-900 font-black py-2.5 px-4 rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.3)] 
                   active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-yellow-300/50"
      >
        <Zap size={18} className="fill-slate-900" />
        <span>จัดทีมอัตโนมัติ</span>
      </button>

      {/* ปุ่มล้างสนาม (Clear Pitch) */}
      <button
        onClick={handleClearPitch}
        disabled={startersCount === 0}
        className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border
          ${startersCount === 0 
            ? 'bg-slate-800/50 text-slate-500 border-slate-700 cursor-not-allowed' 
            : 'bg-slate-800 text-rose-400 border-slate-600 hover:bg-slate-700 hover:border-rose-400/50 hover:shadow-[0_4px_15px_rgba(225,29,72,0.2)] active:scale-[0.98]'
          }`}
      >
        <Trash2 size={18} />
        <span>ล้างสนาม</span>
      </button>
    </div>
  );
}