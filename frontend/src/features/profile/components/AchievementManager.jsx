import React, { useState } from 'react';
import { Award, Check, X, Shield, Star, Trophy, Flame, Crown } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { updateUserProfile } from '../../../services/firebase/userService';
import { toast } from '../../../utils/toast';
import { useAchievements } from '../hooks/useAchievements';

const getIconComponent = (type) => {
  switch (type) {
    case 'Shield': return <Shield size={20} />;
    case 'Trophy': return <Trophy size={20} />;
    case 'Award': return <Award size={20} />;
    case 'Flame': return <Flame size={20} />;
    case 'Crown': return <Crown size={20} />;
    default: return <Star size={20} />;
  }
};

const getRarityStyles = (rarity, unlocked) => {
  if (!unlocked) return 'bg-slate-50 border-slate-200 opacity-60 grayscale-[50%]';
  switch (rarity) {
    case 'legendary': return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-amber-200/50 shadow-md';
    case 'epic': return 'bg-gradient-to-r from-purple-50 to-fuchsia-50 border-purple-300 shadow-purple-200/50 shadow-sm';
    case 'rare': return 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300';
    default: return 'bg-white border-slate-200';
  }
};

const getIconColor = (rarity, unlocked) => {
  if (!unlocked) return 'bg-slate-200 text-slate-400';
  switch (rarity) {
    case 'legendary': return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm';
    case 'epic': return 'bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white shadow-sm';
    case 'rare': return 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-sm';
    default: return 'bg-slate-100 text-slate-600';
  }
};

export default function AchievementManager({ isOpen, onClose }) {
  const { userData, updateUserData } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const { achievements, loading } = useAchievements();
  
  if (!isOpen) return null;

  const handleEquipTitle = async (titleName) => {
    setIsSaving(true);
    try {
      await updateUserProfile(userData.uid, { equippedTitle: titleName });
      updateUserData({ equippedTitle: titleName });
      toast.success(`ติดตั้งฉายา ${titleName} แล้ว!`);
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาดในการติดตั้งฉายา');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnequipTitle = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(userData.uid, { equippedTitle: null });
      updateUserData({ equippedTitle: null });
      toast.success('ถอดฉายาแล้ว');
    } catch (error) {
      console.error(error);
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
              <Award size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">ความสำเร็จ & ฉายา</h3>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          <div className="mb-4 p-4 bg-gradient-to-br from-indigo-900 to-blue-900 border border-indigo-500/30 rounded-xl flex justify-between items-center shadow-lg shadow-indigo-900/20">
            <div>
              <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">ฉายาปัจจุบัน</div>
              <div className="font-black text-white text-lg tracking-wide">{userData?.equippedTitle || 'ไม่มีฉายา'}</div>
            </div>
            {userData?.equippedTitle && (
              <button 
                onClick={handleUnequipTitle}
                disabled={isSaving}
                className="text-xs font-bold text-indigo-100 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg transition-all"
              >
                ถอดถอน
              </button>
            )}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center p-8 text-slate-400 animate-pulse">กำลังโหลดข้อมูล...</div>
            ) : achievements.length === 0 ? (
              <div className="text-center p-8 text-slate-400">ยังไม่มีข้อมูลฉายาในระบบ</div>
            ) : (
              achievements.map(achv => {
                const isEquipped = userData?.equippedTitle === achv.title;
                return (
                  <div key={achv.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${getRarityStyles(achv.rarity, achv.unlocked)}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${getIconColor(achv.rarity, achv.unlocked)}`}>
                        {getIconComponent(achv.iconType)}
                      </div>
                      <div>
                        <div className={`font-black text-sm tracking-wide ${achv.unlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                          {achv.title}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{achv.desc}</div>
                      </div>
                    </div>
                    
                    {achv.unlocked ? (
                      isEquipped ? (
                        <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-black uppercase tracking-wider bg-emerald-100/50 px-2 py-1 rounded-md border border-emerald-200">
                          <Check size={14} strokeWidth={3} /> ใช้งานอยู่
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleEquipTitle(achv.title)}
                          disabled={isSaving}
                          className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          ติดตั้ง
                        </button>
                      )
                    ) : (
                      <div className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-widest">ล็อค</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
