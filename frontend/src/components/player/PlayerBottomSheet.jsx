import React, { useEffect, useState } from 'react';
import { X, UserPlus, BarChart2, Wallet, AlertCircle } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import PositionBadge from './PositionBadge';
import BottomSheetHighlights from './BottomSheetHighlights';
import PlayerStatsDetailModal from './PlayerStatsDetailModal';

const PlayerBottomSheet = ({ isOpen, onClose, player, onPlace }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const getEffectiveBudget = useUserStore((state) => state.getEffectiveBudget);
  const budgetLeft = getEffectiveBudget();

  // ควบคุม Animation เปิด/ปิด
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // 📳 Haptic Feedback: สั่นเบาๆ เมื่อ Sheet เด้งขึ้นมา
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(15);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // ป้องกัน Error หากไม่มีข้อมูลนักเตะ
  if (!player) return null;

  const playerPrice = parseFloat(player.price || 0);
  const projectedBudget = budgetLeft - playerPrice;
  const isAffordable = projectedBudget >= 0;

  const handlePlaceClick = () => {
    if (!isAffordable) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]); // สั่นเตือนเมื่อเงินไม่พอ
      }
      return;
    }
    
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(30);
    }
    onPlace(player);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col justify-end transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Bottom Sheet Container */}
      <div 
        className={`relative bg-slate-900 border-t border-slate-700/50 rounded-t-[32px] w-full max-w-md mx-auto shadow-2xl transition-transform duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Drag Handle (Visual only) */}
        <div className="w-full flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"
        >
          <X size={20} />
        </button>

        <div className="px-6 pb-8 pt-2">
          {/* Header: Player Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 overflow-hidden shadow-lg flex items-center justify-center">
                <img 
                  src={player.image || '/assets/default-avatar.png'} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/assets/default-avatar.png' }}
                />
              </div>
              <div className="absolute -bottom-2 -right-2">
                <PositionBadge position={player.position} />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white leading-tight mb-1 truncate">
                {player.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
                  {player.club || 'Unknown Club'}
                </span>
                <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">
                  OVR {player.overall || player.base_overall || '?'}
                </span>
              </div>
            </div>
          </div>

          {/* Smart Budget Preview */}
          <div className="bg-slate-800/80 rounded-2xl p-4 mb-6 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3 text-slate-300 font-medium">
              <Wallet size={18} className="text-emerald-400" />
              <span>ข้อมูลการเซ็นสัญญา</span>
            </div>
            
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-400">งบประมาณสโมสร</span>
              <span className="text-white font-mono">{budgetLeft.toFixed(1)} M</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2 pb-2 border-b border-slate-700 border-dashed">
              <span className="text-slate-400">ค่าเหนื่อย / ค่าตัว</span>
              <span className="text-rose-400 font-mono font-medium">-{playerPrice.toFixed(1)} M</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-slate-300 font-medium">งบประมาณคงเหลือหลังเซ็นสัญญา</span>
              <span className={`text-lg font-bold font-mono ${isAffordable ? 'text-emerald-400' : 'text-rose-500'}`}>
                {projectedBudget.toFixed(1)} M
              </span>
            </div>
          </div>

          {/* ไฮไลท์สถิติผู้เล่น (ฤดูกาล / สัปดาห์ล่าสุด / ฟอร์ม) */}
          <BottomSheetHighlights player={player} />

          {/* Error Message (If not affordable) */}
          {!isAffordable && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-xl mb-4 border border-rose-500/20 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <span>งบประมาณของคุณไม่เพียงพอ! กรุณาจัดสรรการเงินใหม่</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                  window.navigator.vibrate(20);
                }
                setIsStatsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-[0.98] transition-all"
            >
              <BarChart2 size={20} />
              STATS
            </button>
            
            <button 
              onClick={handlePlaceClick}
              disabled={!isAffordable}
              className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
                isAffordable 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/50' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <UserPlus size={20} />
              SIGN
            </button>
          </div>
        </div>
      </div>

      <PlayerStatsDetailModal 
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        player={player}
      />
    </div>
  );
};

export default PlayerBottomSheet;