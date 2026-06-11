import React, { useState, useEffect } from 'react';
import { useRedeemStore } from '../../store/useRedeemStore';
import { useUserStore } from '../../store/useUserStore';
import { Zap, Clock, Package, HelpCircle } from 'lucide-react';
// สมมติว่ามีฟังก์ชัน playSound อยู่ใน theme (หรือจะใช้ use-sound ก็ได้ตามที่โปรเจกต์ตั้งค่าไว้)
import { STYLES, playSound } from '../../config/theme'; 

export function RewardCard({ reward, title, cost, imageSlot, onSuccess }) {
  const redeemReward = useRedeemStore((state) => state.redeemReward);
  const { userData, balls } = useUserStore();

  const [step, setStep] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  // แมปปิ้งข้อมูลให้รองรับทั้งระบบเก่า (Props) และระบบใหม่ (Firebase Document)
  const displayTitle = reward?.name || reward?.title || title;
  const displayCost = reward?.price || reward?.cost || cost;
  const displayImage = reward?.imageUrl || null;
  const displayDesc = reward?.description || '';
  const displayStock = reward?.stock;
  
  // สถานะสินค้า (Gamification States)
  const isGacha = reward?.type === 'gacha';
  const isFlashSale = reward?.isFlashSale;
  const isOutOfStock = displayStock !== undefined && displayStock <= 0;
  const isNotEnoughBalls = (balls || 0) < displayCost;

  useEffect(() => {
    if (!isFlashSale || !reward?.flashSaleEndTime) return;

    const calculateTimeLeft = () => {
      const difference = new Date(reward.flashSaleEndTime).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)));
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('หมดเวลาแล้ว!');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [isFlashSale, reward?.flashSaleEndTime]);

  useEffect(() => {
    let timer;
    if (step === 'confirm' || step === 'error') {
      timer = setTimeout(() => {
        setStep('idle');
        setErrorMessage('');
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [step]);

  const handleRedeemClick = async () => {
    // 1. ตรวจสอบเบื้องต้น (Client-side validation)
    if (!userData?.uid) {
      setErrorMessage('กรุณาล็อกอินก่อน');
      setStep('error');
      return;
    }
    if (isOutOfStock) return;
    if (isNotEnoughBalls) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]); // สั่น Error
      }
      setErrorMessage('ยอด Balls ไม่พอ!');
      setStep('error');
      return;
    }

    // 2. State ยืนยันการแลก 
    if (step === 'idle') {
      setStep('confirm');
      // เสียงคลิกเบาๆ + สั่น
      if (playSound) playSound('click');
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
    } 
    // 3. กดยืนยันอีกครั้ง -> ยิง API
    else if (step === 'confirm') {
      setStep('loading');
      try {
        const result = await redeemReward(userData.uid, reward);
        setStep('success'); 
        
        // ส่งต่อให้หน้าแม่ (RedeemScreen) แสดง Confetti และโชว์ของรางวัลที่ได้
        if (onSuccess) onSuccess(result);
        
        // ดีเลย์นิดนึงแล้วค่อยกลับไปสถานะปกติ
        setTimeout(() => setStep('idle'), 3000);
      } catch (error) {
        setErrorMessage(error.message);
        setStep('error');
      }
    }
  };

  // ฟังก์ชันคำนวณ UI ของปุ่ม
  const getButtonUI = () => {
    if (isOutOfStock) {
      return { text: 'Sold Out', classes: 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' };
    }
    if (isNotEnoughBalls && step === 'idle') {
      return { text: 'ไม่พอ', classes: 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-70' };
    }
    
    switch (step) {
      case 'confirm': return { text: 'กดยืนยันอีกครั้ง!', classes: 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse shadow-lg shadow-amber-500/40 border border-amber-400' };
      case 'loading': return { text: 'กำลังตรวจสอบ...', classes: 'bg-slate-100 text-slate-500 cursor-wait' };
      case 'success': return { text: 'รับสำเร็จ! 🎉', classes: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105 border border-emerald-400' };
      case 'error': return { text: '❌ พลาด', classes: 'bg-red-500 text-white border border-red-600' };
      default: return { text: 'แลกรับรางวัล', classes: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all duration-200' };
    }
  };

  const buttonState = getButtonUI();
  // ทำให้ภาพเป็นสีเทาถ้าของหมด
  const imageOpacity = isOutOfStock ? 'opacity-40 grayscale' : 'opacity-100';

  return (
    <div className={`bg-white rounded-2xl p-4 flex flex-col h-full relative overflow-hidden group transition-all duration-300 border shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
      ${isGacha ? 'border-purple-200 hover:border-purple-400 hover:shadow-[0_8px_30px_-12px_rgba(168,85,247,0.4)]' : 'border-slate-100 hover:border-indigo-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1'}
      ${isOutOfStock ? 'opacity-80' : ''}
    `}>
      
      {/* 🏷️ ป้ายกำกับ (Badges) */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-1.5">
          {isGacha && (
            <span className="bg-purple-600/90 backdrop-blur text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit">
              <HelpCircle size={10} /> สุ่มรางวัล
            </span>
          )}
          {isFlashSale && timeLeft && (
             <span className="bg-orange-500/90 backdrop-blur text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm flex items-center gap-1 w-fit animate-pulse">
               <Clock size={10} /> {timeLeft}
             </span>
          )}
        </div>

        {displayStock !== undefined && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-full shadow-sm backdrop-blur border ${
            isOutOfStock ? 'bg-red-50/90 text-red-500 border-red-200' : 
            displayStock <= 5 ? 'bg-orange-50/90 text-orange-500 border-orange-200' : 
            'bg-slate-100/90 text-slate-500 border-slate-200'
          }`}>
            {isOutOfStock ? 'SOLD OUT' : `เหลือ ${displayStock}`}
          </span>
        )}
      </div>

      {/* 🖼️ ภาพของรางวัล (Image / Icon) */}
      <div className={`w-full aspect-video rounded-xl mb-4 flex items-center justify-center text-5xl bg-slate-50 transition-all duration-500 group-hover:scale-[1.02] overflow-hidden relative border border-slate-200 ${imageOpacity}`}>
        {/* แสงสว่างจางๆ ด้านหลังสำหรับของระดับแรร์ */}
        {isGacha && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/5"></div>}
        
        {displayImage ? (
          <img src={displayImage} alt={displayTitle} className="w-full h-full object-cover" />
        ) : (
          imageSlot || (isGacha ? <Package className="text-purple-300 w-16 h-16" /> : <span className="drop-shadow-md">🎁</span>)
        )}
      </div>

      {/* 📝 ข้อมูลรางวัล */}
      <div className="flex-1 flex flex-col">
        <h3 className={`font-bold text-sm leading-tight line-clamp-2 ${isOutOfStock ? 'text-slate-400' : 'text-slate-800'}`}>
          {displayTitle}
        </h3>
        {displayDesc && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        )}
      </div>

      {/* ⚠️ ข้อความ Error แจ้งเตือน */}
      {step === 'error' && errorMessage && (
        <div className="mt-3 text-[10px] font-medium text-red-500 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-200">
          <Zap size={12} className="shrink-0" />
          <span className="line-clamp-1">{errorMessage}</span>
        </div>
      )}

      {/* 💰 ส่วนควบคุม (ราคา + ปุ่มแลก) */}
      <div className={`mt-4 flex items-center justify-between gap-3 pt-4 border-t ${isOutOfStock ? 'border-slate-100' : 'border-slate-100 group-hover:border-indigo-200 transition-colors'}`}>
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">มูลค่า</span>
          <div className="flex items-center gap-1">
            <span className={`font-black text-base tracking-tight ${isNotEnoughBalls ? 'text-rose-500' : 'text-amber-500'}`}>
              {displayCost?.toLocaleString()}
            </span>
            <span className="text-sm">⚽</span>
          </div>
        </div>
        
        <button 
          onClick={handleRedeemClick}
          disabled={step === 'loading' || isOutOfStock}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-300 min-w-[90px] flex-shrink-0 ${buttonState.classes}`}
        >
          {buttonState.text}
        </button>
      </div>

    </div>
  );
}

export default RewardCard;