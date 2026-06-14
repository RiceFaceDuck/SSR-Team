import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../../store/useGameStore';
import { ExternalLink } from 'lucide-react';

/**
 * SquadActions - Bottom action bar for Auto Pick, Reset, and Save Team.
 * Also displays the remaining bank balance and squad count.
 */
const SquadActions = ({ totalBudget, managerBonus = 0, bank, squadCount, actions, isAutoFilling }) => {
  const [cooldown, setCooldown] = useState(0);
  const autoPickConfig = useGameStore(state => state.autoPickConfig);
  const isNoAdsMode = useGameStore(state => state.isNoAdsMode);

  useEffect(() => {
    const checkCooldown = () => {
      const endTime = parseInt(localStorage.getItem('autoPickCooldownEnd') || '0');
      const now = Date.now();
      if (endTime > now) {
        setCooldown(Math.ceil((endTime - now) / 1000));
      } else {
        setCooldown(0);
      }
    };
    
    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const onAutoPickClick = () => {
    if (cooldown > 0 && autoPickConfig?.adLinkUrl && !isNoAdsMode) {
      window.open(autoPickConfig.adLinkUrl, '_blank');
      return;
    }

    actions.handleAutoPick();

    if (!isNoAdsMode) {
      const cdSeconds = autoPickConfig?.cooldownSeconds || 15;
      if (cdSeconds > 0) {
        const endTime = Date.now() + (cdSeconds * 1000);
        localStorage.setItem('autoPickCooldownEnd', endTime.toString());
        setCooldown(cdSeconds);
      }
    }
  };

  return (
    <div className="flex-shrink-0 w-full px-2 py-2 bg-[#0a192f] border-t border-[#1a365d] shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-20">
      
      {/* Action Buttons */}
      <div className="flex justify-between gap-2 mb-1.5">
        <button 
          onClick={onAutoPickClick}
          disabled={isAutoFilling}
          className={`flex-1 ${isAutoFilling ? 'bg-slate-500 opacity-70 cursor-not-allowed border-slate-400' : 'bg-gradient-to-b from-[#fbbf24] to-[#f59e0b] hover:from-[#fcd34d] hover:to-[#fbbf24] border border-[#b45309]/50 shadow-[0_2px_10px_rgba(251,191,36,0.2)]'} text-[#0a192f] font-bold py-2 rounded-md flex items-center justify-center gap-1 active:scale-95 transition-all duration-200 overflow-hidden`}
        >
          {isAutoFilling ? (
            <>
              <svg className="animate-spin w-4 h-4 text-[#0a192f] shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span className="text-[10px] sm:text-xs">PROCESSING...</span>
            </>
          ) : (cooldown > 0 && !isNoAdsMode) ? (
            <>
              <ExternalLink size={14} className="animate-pulse shrink-0" />
              <span className="text-[9px] sm:text-[11px] leading-tight">โฆษณา ({cooldown}s)</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              <span className="text-[10px] sm:text-xs">AUTO PICK</span>
            </>
          )}
        </button>
        
        <button 
          onClick={actions.handleReset}
          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-md shadow flex items-center justify-center gap-1 active:scale-95 transition-all duration-200 border border-slate-500"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          <span className="text-sm">RESET</span>
        </button>
        
        <button 
          onClick={actions.handleSaveTeam}
          className="flex-1 bg-gradient-to-b from-[#3b82f6] to-[#2563eb] hover:from-[#60a5fa] hover:to-[#3b82f6] text-white font-bold py-2 rounded-md shadow-[0_2px_10px_rgba(59,130,246,0.3)] flex items-center justify-center gap-1 active:scale-95 transition-all duration-200 border border-[#1e40af]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
          <span className="text-sm">SAVE TEAM</span>
        </button>
      </div>

      {/* Squad Status */}
      <div className="flex justify-between items-center text-xs font-semibold text-white px-1">
        <span className="opacity-80">MY SQUAD ({squadCount}/11)</span>
        <div className="flex gap-4">
          <span className="opacity-80 flex items-baseline gap-1">
            TOTAL BUDGET: 
            <span className="text-[#60a5fa] text-sm">{totalBudget}m</span>
            {managerBonus > 0 && (
              <span className="text-emerald-400 text-[10px] ml-1" title={`Manager Bonus: +${managerBonus}m`}>
                (+{managerBonus}m)
              </span>
            )}
          </span>
          <span className="opacity-80">
            REMAINING BANK: <span className="text-[#fbbf24] text-sm">{bank}m</span>
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default SquadActions;
