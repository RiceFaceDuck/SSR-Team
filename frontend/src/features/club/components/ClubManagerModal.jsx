import React, { useEffect, useState } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import ClubHeader from './ClubHeader';
import FacilityList from './FacilityList';

export default function ClubManagerModal({ isOpen, onClose }) {
  const { 
    userData, 
    clubData, 
    isClubLoading, 
    loadClubData, 
    upgradeFacility, 
    getAvailableExp, 
    getExpRequiredForLevel 
  } = useUserStore();
  
  const [upgradingKey, setUpgradingKey] = useState(null);

  useEffect(() => {
    if (isOpen && userData?.uid && !clubData) {
      loadClubData(userData.uid);
    }
  }, [isOpen, userData?.uid, clubData, loadClubData]);

  if (!isOpen) return null;

  const handleUpgrade = async (key) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(20);
    }
    setUpgradingKey(key);
    await upgradeFacility(userData.uid, key);
    setUpgradingKey(null);
  };

  const availableExp = getAvailableExp();
  
  // Provide safe defaults during loading
  const cData = clubData || {
    stadiumLevel: 1,
    trainingGroundLevel: 1,
    hospitalLevel: 1,
    gymLevel: 1,
    youthAcademyLevel: 1
  };

  const totalLevels = cData.stadiumLevel + cData.trainingGroundLevel + cData.hospitalLevel + cData.gymLevel + cData.youthAcademyLevel;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-slate-50 sm:rounded-[2rem] rounded-t-[2rem] h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 border border-white/20">
        
        <ClubHeader 
          totalLevels={totalLevels}
          availableExp={availableExp}
          onClose={onClose}
        />

        <FacilityList 
          clubData={clubData}
          isClubLoading={isClubLoading}
          availableExp={availableExp}
          getExpRequiredForLevel={getExpRequiredForLevel}
          upgradingKey={upgradingKey}
          onUpgrade={handleUpgrade}
        />

      </div>
    </div>
  );
}
