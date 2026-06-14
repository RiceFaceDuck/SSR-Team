import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { useUserStore } from '../../../../store/useUserStore';
import { toast } from '../../../../utils/toast';

import AdSponsorView from './AdSponsorView';
import SquadSummaryView from './SquadSummaryView';

export default function SaveSquadManager({ isOpen, onClose, onConfirmSave }) {
  const { isSaveUnlocked, unlockSave, mySquad, formation, fetchAdsConfig, adsConfig, isAdsLoading } = useUserStore();
  
  // Local State
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // คำนวณจำนวนผู้เล่นตัวจริงบนสนาม
  const startersCount = mySquad.filter(p => p.isStarting).length;
  // เช็คว่าทีมครบหรือไม่ (ตัวจริง 11, สำรอง 4, ผู้จัดการ 1 = 16)
  const isSquadComplete = mySquad.length === 15 && useUserStore.getState().managerId !== null;

  useEffect(() => {
    // Load config on mount if not loaded
    if (!adsConfig || (adsConfig.adLinks.length === 0 && !adsConfig.googleAdsense.isActive)) {
       fetchAdsConfig();
    }
  }, [fetchAdsConfig]);

  useEffect(() => {
    if (!isOpen) {
      setIsAdPlaying(false);
      setIsSaving(false);
    } else {
      // When opened, if save is locked, check if there's any active ad for "save_team"
      if (!isSaveUnlocked && adsConfig) {
        const { googleAdsense, adLinks } = adsConfig;
        const activeLinkAd = adLinks?.find(ad => ad.isActive && ad.position === 'save_team');
        const hasActiveAd = googleAdsense?.isActive || activeLinkAd;
        
        if (!hasActiveAd) {
           // Auto skip if no active ads
           unlockSave();
        }
      }
    }
  }, [isOpen, isSaveUnlocked, adsConfig, unlockSave]);

  const handleWatchAd = () => {
    setIsAdPlaying(true);
    // Real ad view logic is delegated to AdSponsorView
  };

  const handleAdFinished = () => {
    setIsAdPlaying(false);
    unlockSave();
    toast.success('ปลดล็อกการเซฟเรียบร้อย!');
  };

  const handleSaveClick = async () => {
    if (startersCount === 0) {
      toast.error("ไม่มีนักเตะบนสนาม กรุณาจัดทีมก่อนเซฟ");
      return;
    }

    setIsSaving(true);
    try {
      if (onConfirmSave) {
        await onConfirmSave();
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => !isAdPlaying && !isSaving && onClose()}
      />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Save size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">SAVE TEAM</h3>
          </div>
          {!isAdPlaying && !isSaving && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6">
          {!isSaveUnlocked || isAdPlaying ? (
            <AdSponsorView 
              isAdPlaying={isAdPlaying} 
              adsConfig={adsConfig}
              onWatchAd={handleWatchAd}
              onAdFinished={handleAdFinished} 
            />
          ) : (
            <SquadSummaryView 
              formation={formation}
              startersCount={startersCount}
              isSquadComplete={isSquadComplete}
              isSaving={isSaving}
              onClose={onClose}
              onSave={handleSaveClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
