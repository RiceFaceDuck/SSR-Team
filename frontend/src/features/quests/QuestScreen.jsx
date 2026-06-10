import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { useQuestStore } from '../../store/useQuestStore';
import { useUserStore } from '../../store/useUserStore';
import SponsorAdCard from './SponsorAdCard';
import { showToast } from '../../utils/toast';
import { playSound } from '../../config/theme';

export default function QuestScreen() {
  // ดึง State ผู้เล่น และ ฟังก์ชันเพิ่ม Balls (⚽)
  const { userData, addBalls } = useUserStore();
  
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
    <div className="p-4 md:p-6 pb-24 max-w-2xl mx-auto min-h-screen animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="mb-6 relative">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Sparkles className="text-amber-500" />
          ภารกิจพิเศษ
        </h2>
        <p className="text-slate-500 mt-1 font-medium text-sm">
          เยี่ยมชมสปอนเซอร์เพื่อรับ <span className="font-bold text-amber-500">Balls ⚽</span>
        </p>
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
  );
}