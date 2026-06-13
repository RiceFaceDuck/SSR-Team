import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { useQuestStore } from '../../store/useQuestStore';
import { useUserStore } from '../../store/useUserStore';
import { useGameStore } from '../../store/useGameStore';
import SponsorAdCard from './SponsorAdCard';
import { showToast } from '../../utils/toast';
import { playSound } from '../../config/theme';

export default function QuestScreen() {
  // ดึง State ผู้เล่น และ ฟังก์ชันเพิ่ม Balls (⚽)
  const { userData, addBalls, balls } = useUserStore();
  const themeConfig = useGameStore(state => state.themeConfig);
  
  // ดึง State และ Functions สำหรับระบบภารกิจ
  const { 
    quests, 
    userQuestRecords, 
    isLoading, 
    fetchActiveQuests, 
    fetchUserQuestRecords, 
    claimReward 
  } = useQuestStore();

  // State เก็บ ID โฆษณาที่กำลังกด เพื่อแสดง Loading แบบแยกเฉพาะป้าย
  const [claimingId, setClaimingId] = useState(null);

  // โหลดข้อมูลเมื่อเข้ามาหน้านี้
  useEffect(() => {
    fetchActiveQuests();
    if (userData?.uid) {
      fetchUserQuestRecords(userData.uid);
    }
  }, [userData?.uid, fetchActiveQuests, fetchUserQuestRecords]);

  // ฟังก์ชันจัดการเมื่อผู้เล่นกดรับรางวัล
  const handleClaim = async (quest) => {
    if (!userData?.uid) {
      showToast('error', 'กรุณาเข้าสู่ระบบก่อนรับรางวัล');
      return;
    }

    playSound('click');
    setClaimingId(quest.id);
    
    // เรียกใช้ Service ฝั่ง Store
    const res = await claimReward(userData.uid, quest);
    
    if (res.success) {
      // อัปเดตจำนวนบอลที่หน้าปัด (ระบบจะจัดการ Haptic Vibrate ให้เองใน useUserStore)
      addBalls(quest.rewardBalls); 
      showToast('success', `รับ ${quest.rewardBalls} ⚽ สำเร็จ!`);
    } else {
      showToast('error', res.message || 'เกิดข้อผิดพลาดในการรับรางวัล');
    }
    
    setClaimingId(null);
  };

  return (
    <div 
      className="p-3 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24 bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url(${themeConfig?.marketBackgroundUrl || 'https://images.unsplash.com/photo-1518605368461-1ee7c5320673?auto=format&fit=crop&q=80&w=1000'})` }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-md pointer-events-none"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header Section (Matched with MarketScreen) */}
        <div className="mb-4">
          <div className="flex justify-between items-center px-2 pt-2 pb-1">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-br from-slate-800 via-slate-700 to-indigo-900 drop-shadow-md pb-1">
              QUESTS.
            </h2>
            <div className="bg-gradient-to-b from-white to-slate-50 border border-slate-300 shadow-md px-3 py-1.5 rounded-lg flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold leading-none uppercase">ยอดเงิน</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-black text-amber-500 leading-none">{balls?.toLocaleString() || 0}</span>
                <span className="text-amber-500 drop-shadow-sm leading-none text-xs">⚽</span>
              </div>
            </div>
          </div>
        </div>

      {/* Content Area */}
      {isLoading && quests.length === 0 ? (
        // Loading State
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="font-semibold text-sm">กำลังค้นหาภารกิจ...</p>
        </div>
      ) : quests.length === 0 ? (
        // Empty State (ยังไม่มีโฆษณา)
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-200">
            <Trophy size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">ยังไม่มีภารกิจในขณะนี้</h3>
          <p className="text-sm text-slate-500 mt-2">โปรดกลับมาตรวจสอบใหม่ภายหลัง</p>
        </div>
      ) : (
        // Quest List
        <div className="flex flex-col gap-4">
          {quests.map((quest) => (
            <SponsorAdCard 
              key={quest.id}
              quest={quest}
              record={userQuestRecords[quest.id]}
              onClaim={handleClaim}
              isClaiming={claimingId === quest.id}
            />
          ))}
        </div>
      )}
      
      </div>
    </div>
  );
}