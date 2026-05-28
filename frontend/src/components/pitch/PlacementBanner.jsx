import React from 'react';
import { X, MapPin } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import PositionBadge from '../player/PositionBadge';

export default function PlacementBanner() {
  const { pendingPlacement, cancelPlacement } = useUserStore();

  // หากไม่มีนักเตะรอกดวาง ให้ซ่อน Component นี้ไปเลย
  if (!pendingPlacement) return null;

  const handleCancel = () => {
    // 📳 Haptic Feedback: สั่นเบาๆ ตอบสนองการกดยกเลิก
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    cancelPlacement();
  };

  return (
    <div className="fixed top-[72px] left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      {/* Container หลัก: ใช้ animation slide-in เพื่อให้เด้งลงมาอย่างสมูท 
        pointer-events-auto เพื่อให้กดปุ่มยกเลิกได้แม้ตัวหุ้มจะทะลุก็ตาม
      */}
      <div className="w-full max-w-md animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 shadow-[0_8px_30px_rgba(16,185,129,0.2)] rounded-2xl p-3 flex items-center justify-between">
          
          {/* ฝั่งซ้าย: ไอคอน และ ข้อมูลนักเตะ */}
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
              <MapPin className="text-emerald-400" size={20} />
            </div>
            
            <div className="min-w-0">
              <p className="text-emerald-400 font-bold text-[10px] mb-0.5 uppercase tracking-wider">
                โหมดจัดวางนักเตะ
              </p>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm truncate max-w-[120px] sm:max-w-[160px]">
                  {pendingPlacement.name}
                </span>
                <div className="shrink-0 scale-90 origin-left">
                  <PositionBadge position={pendingPlacement.position} />
                </div>
              </div>
            </div>
          </div>
          
          {/* ฝั่งขวา: ปุ่มยกเลิก */}
          <button
            onClick={handleCancel}
            className="shrink-0 ml-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-2.5 rounded-full transition-colors active:scale-90"
            aria-label="ยกเลิกการจัดวาง"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          
        </div>
      </div>
    </div>
  );
}