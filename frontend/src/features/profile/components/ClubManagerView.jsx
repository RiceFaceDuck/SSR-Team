import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Dumbbell, 
  Cross, 
  GraduationCap, 
  Trophy,
  X,
  Sparkles
} from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import FacilityCard from './FacilityCard';

export default function ClubManagerView({ isOpen, onClose }) {
  const { userData, clubData, isClubLoading, loadClubData, upgradeFacility, getAvailableExp, getExpRequiredForLevel } = useUserStore();
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

  // Calculate overall rating to show club evolution
  const totalLevels = cData.stadiumLevel + cData.trainingGroundLevel + cData.hospitalLevel + cData.gymLevel + cData.youthAcademyLevel;
  
  // Decide visual tier based on total levels (Max is 50)
  // Tier 1: 5-14 (Beginner)
  // Tier 2: 15-29 (Professional)
  // Tier 3: 30-44 (Elite)
  // Tier 4: 45-50 (World Class)
  let tierName = "Local Club";
  let clubImage = "https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000";
  let tierColor = "from-slate-400 to-slate-600";
  
  if (totalLevels >= 45) {
    tierName = "World Class Franchise";
    clubImage = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=1000";
    tierColor = "from-amber-400 to-orange-600";
  } else if (totalLevels >= 30) {
    tierName = "Elite Football Club";
    clubImage = "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&q=80&w=1000";
    tierColor = "from-fuchsia-500 to-purple-600";
  } else if (totalLevels >= 15) {
    tierName = "Professional Team";
    clubImage = "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=1000";
    tierColor = "from-blue-500 to-indigo-600";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-slate-50 sm:rounded-3xl rounded-t-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8">
        
        {/* Dynamic Club Header */}
        <div className="relative h-48 flex-shrink-0">
          <img src={clubImage} alt="Club" className="w-full h-full object-cover transition-all duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${tierColor} text-white text-[10px] font-black uppercase tracking-wider mb-2 shadow-lg`}>
              <Sparkles size={12} />
              {tierName}
            </div>
            <h3 className="text-2xl font-black text-white italic drop-shadow-md">MY CLUB</h3>
            <div className="flex items-center gap-4 mt-1">
              <div className="text-slate-200 text-sm font-medium flex items-center gap-1.5">
                <Trophy size={16} className="text-amber-400" />
                Total Lvl: <span className="text-white font-bold">{totalLevels}</span>/50
              </div>
            </div>
          </div>
        </div>

        {/* EXP Bar Tracker */}
        <div className="bg-white px-5 py-4 border-b border-slate-100 flex-shrink-0 flex items-center justify-between shadow-sm z-10 relative">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available EXP</div>
            <div className="text-2xl font-black text-indigo-600 tracking-tight flex items-baseline gap-1">
              {availableExp.toLocaleString()} <span className="text-sm font-medium text-slate-400">EXP</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
        </div>

        {/* Facilities List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-safe relative">
          {isClubLoading && !clubData ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <FacilityCard 
                title="Stadium" 
                icon={Building2} 
                level={cData.stadiumLevel} 
                cost={getExpRequiredForLevel(cData.stadiumLevel)}
                availableExp={availableExp}
                isUpgrading={upgradingKey === 'stadiumLevel'}
                onUpgrade={() => handleUpgrade('stadiumLevel')}
              />
              <FacilityCard 
                title="Training Ground" 
                icon={Trophy} 
                level={cData.trainingGroundLevel} 
                cost={getExpRequiredForLevel(cData.trainingGroundLevel)}
                availableExp={availableExp}
                isUpgrading={upgradingKey === 'trainingGroundLevel'}
                onUpgrade={() => handleUpgrade('trainingGroundLevel')}
              />
              <FacilityCard 
                title="Hospital" 
                icon={Cross} 
                level={cData.hospitalLevel} 
                cost={getExpRequiredForLevel(cData.hospitalLevel)}
                availableExp={availableExp}
                isUpgrading={upgradingKey === 'hospitalLevel'}
                onUpgrade={() => handleUpgrade('hospitalLevel')}
              />
              <FacilityCard 
                title="Gym & Fitness" 
                icon={Dumbbell} 
                level={cData.gymLevel} 
                cost={getExpRequiredForLevel(cData.gymLevel)}
                availableExp={availableExp}
                isUpgrading={upgradingKey === 'gymLevel'}
                onUpgrade={() => handleUpgrade('gymLevel')}
              />
              <FacilityCard 
                title="Youth Academy" 
                icon={GraduationCap} 
                level={cData.youthAcademyLevel} 
                cost={getExpRequiredForLevel(cData.youthAcademyLevel)}
                availableExp={availableExp}
                isUpgrading={upgradingKey === 'youthAcademyLevel'}
                onUpgrade={() => handleUpgrade('youthAcademyLevel')}
              />
              
              <div className="text-center text-xs text-slate-400 font-medium py-4">
                Upgrading facilities currently changes your club's visual appearance and tier.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
