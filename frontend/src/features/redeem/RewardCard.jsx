import React, { useState, useEffect } from 'react';
import { STYLES } from '../../config/theme';
import { useRedeemStore } from '../../store/useRedeemStore';
import { useUserStore } from '../../store/useUserStore';

export function RewardCard({ reward, title, cost, imageSlot }) {
  // ดึงฟังก์ชันสำหรับทำรายการจาก Store
  const redeemReward = useRedeemStore((state) => state.redeemReward);
  // ดึงข้อมูลผู้เล่นปัจจุบัน (เพื่อเอา uid ไปอ้างอิงตอนหักเงิน)
  const userData = useUserStore((state) => state.userData);

  // จัดการสถานะปุ่มกด (idle -> confirm -> loading -> success -> error)
  const [step, setStep] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback data เผื่อบางจุดยังไม่ได้อัปเกรดการส่ง Props
  const displayTitle = reward?.title || title;
  const displayCost = reward?.cost || cost;
  const displayIcon = reward?.icon || '🎁';
  const displayColor = reward?.color || 'from-slate-400 to-slate-500';
  const displayDesc = reward?.description || '';

  // Effect สำหรับรีเซ็ตสถานะปุ่มกลับเป็นปกติหลังจากผ่านไป 3 วินาที
  useEffect(() => {
    let timer;
    if (step === 'confirm' || step === 'success' || step === 'error') {
      timer = setTimeout(() => {
        setStep('idle');
        setErrorMessage('');
      }, 3000); // 3 วินาที
    }
    return () => clearTimeout(timer);
  }, [step]);

  const handleRedeemClick = async () => {
    // 1. ตรวจสอบการล็อกอิน
    if (!userData?.uid) {
      setErrorMessage('กรุณาล็อกอินก่อน');
      setStep('error');
      return;
    }

    // 2. Logic การกดปุ่ม 2 จังหวะ (ป้องกันมือลั่น)
    if (step === 'idle') {
      setStep('confirm'); // เปลี่ยนปุ่มเป็นสถานะรอการยืนยัน
      // 📳 สั่นเบาๆ ให้รู้ว่าต้องกดยืนยัน (Haptic Feedback)
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
    } else if (step === 'confirm') {
      // 3. เริ่มกระบวนการแลกรางวัล
      setStep('loading');
      try {
        await redeemReward(userData.uid, reward);
        setStep('success'); // แลกสำเร็จ! Store หักเงินให้แล้ว
        // 📳 สั่นแสดงความสำเร็จ
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([30, 50, 30]);
        }
      } catch (error) {
        // แลกไม่สำเร็จ (เช่น เงินไม่พอ, ของหมด)
        setErrorMessage(error.message);
        setStep('error');
      }
    }
  };

  // ฟังก์ชันช่วยเหลือสำหรับแสดงสี/ข้อความปุ่มตามสถานะ (ลดความซ้ำซ้อนของโค้ดใน JSX)
  const getButtonUI = () => {
    switch (step) {
      case 'confirm':
        return { text: 'ยืนยัน?', classes: 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse shadow-md shadow-amber-500/30' };
      case 'loading':
        return { text: 'กำลังแลก...', classes: 'bg-slate-200 text-slate-500 cursor-not-allowed' };
      case 'success':
        return { text: 'สำเร็จ! 🎉', classes: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 scale-105 transition-transform' };
      case 'error':
        return { text: '❌ พลาด', classes: 'bg-red-500 text-white' };
      default:
        // สถานะปกติ (idle)
        return { text: 'แลกรางวัล', classes: 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95 transition-all' };
    }
  };

  const buttonState = getButtonUI();

  return (
    <div className={`${STYLES?.card || 'bg-white rounded-3xl shadow-sm p-4'} flex flex-col h-full relative overflow-hidden group border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300`}>
      
      {/* ภาพจำลองของรางวัล (Gradients + Icon) */}
      <div className={`w-full h-32 rounded-2xl mb-4 flex items-center justify-center text-5xl bg-gradient-to-br ${displayColor} shadow-inner transition-transform duration-300 group-hover:scale-[1.02]`}>
        {imageSlot || <span className="drop-shadow-md">{displayIcon}</span>}
      </div>

      {/* ป้ายกำกับสินค้ามีจำนวนจำกัด */}
      {reward?.stock !== undefined && (
        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm text-[10px] font-black text-rose-600 px-2 py-1 rounded-full shadow-sm">
          เหลือ {reward.stock} ชิ้น
        </div>
      )}

      {/* ข้อมูลรางวัล */}
      <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2">{displayTitle}</h3>
      {displayDesc && <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{displayDesc}</p>}

      {/* แสดงข้อความ Error แจ้งเตือนสาเหตุที่แลกไม่ได้ */}
      {step === 'error' && errorMessage && (
        <div className="mt-2 text-[10px] font-medium text-red-500 bg-red-50 px-2 py-1 rounded-md text-center animate-in fade-in zoom-in duration-200">
          {errorMessage}
        </div>
      )}

      {/* ส่วนควบคุม (ราคา + ปุ่มแลก) */}
      <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">ราคา</span>
          <span className="font-black text-amber-500 text-base">{displayCost?.toLocaleString()} ⚽</span>
        </div>
        
        <button 
          onClick={handleRedeemClick}
          disabled={step === 'loading'}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 ${buttonState.classes}`}
        >
          {buttonState.text}
        </button>
      </div>

    </div>
  );
}

export default RewardCard;