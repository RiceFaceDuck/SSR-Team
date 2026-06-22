import React from 'react';
import { Building2, Dumbbell, Cross, GraduationCap, Trophy } from 'lucide-react';
import FacilityCard from './FacilityCard';

export default function FacilityList({ 
  clubData, 
  isClubLoading, 
  availableExp, 
  getExpRequiredForLevel, 
  upgradingKey, 
  onUpgrade 
}) {

  if (isClubLoading && !clubData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin shadow-lg"></div>
      </div>
    );
  }

  // Provide safe defaults
  const cData = clubData || {
    stadiumLevel: 1,
    trainingGroundLevel: 1,
    hospitalLevel: 1,
    gymLevel: 1,
    youthAcademyLevel: 1
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-safe bg-slate-50 relative">
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/5 to-transparent pointer-events-none z-10" />
      
      <FacilityCard 
        title="Stadium" 
        icon={Building2} 
        level={cData.stadiumLevel} 
        cost={getExpRequiredForLevel(cData.stadiumLevel)}
        availableExp={availableExp}
        isUpgrading={upgradingKey === 'stadiumLevel'}
        onUpgrade={() => onUpgrade('stadiumLevel')}
      />
      <FacilityCard 
        title="Training Ground" 
        icon={Trophy} 
        level={cData.trainingGroundLevel} 
        cost={getExpRequiredForLevel(cData.trainingGroundLevel)}
        availableExp={availableExp}
        isUpgrading={upgradingKey === 'trainingGroundLevel'}
        onUpgrade={() => onUpgrade('trainingGroundLevel')}
      />
      <FacilityCard 
        title="Hospital" 
        icon={Cross} 
        level={cData.hospitalLevel} 
        cost={getExpRequiredForLevel(cData.hospitalLevel)}
        availableExp={availableExp}
        isUpgrading={upgradingKey === 'hospitalLevel'}
        onUpgrade={() => onUpgrade('hospitalLevel')}
      />
      <FacilityCard 
        title="Gym & Fitness" 
        icon={Dumbbell} 
        level={cData.gymLevel} 
        cost={getExpRequiredForLevel(cData.gymLevel)}
        availableExp={availableExp}
        isUpgrading={upgradingKey === 'gymLevel'}
        onUpgrade={() => onUpgrade('gymLevel')}
      />
      <FacilityCard 
        title="Youth Academy" 
        icon={GraduationCap} 
        level={cData.youthAcademyLevel} 
        cost={getExpRequiredForLevel(cData.youthAcademyLevel)}
        availableExp={availableExp}
        isUpgrading={upgradingKey === 'youthAcademyLevel'}
        onUpgrade={() => onUpgrade('youthAcademyLevel')}
      />
      
      <div className="text-center py-6 px-4">
        <div className="inline-block bg-slate-200/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
          Upgrading facilities changes your club's visual appearance and unlocks new tiers.
        </div>
      </div>
    </div>
  );
}
