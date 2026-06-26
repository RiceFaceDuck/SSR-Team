import { useState, useEffect } from 'react';
import { useRedeemStore } from '../../../store/useRedeemStore';
import { useUserStore } from '../../../store/useUserStore';
import { playSound } from '../../../config/theme';

export function useRewardCard(reward, onSuccess) {
  const redeemReward = useRedeemStore((state) => state.redeemReward);
  const { userData, balls } = useUserStore();

  const [step, setStep] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  const displayStock = reward?.stock;
  const isGacha = reward?.type === 'gacha';
  const isFlashSale = reward?.isFlashSale;
  const isOutOfStock = displayStock !== undefined && displayStock <= 0;
  // Fallback to displayCost if reward price is not available
  const displayCost = reward?.price || reward?.cost || 0;
  const isNotEnoughBalls = (balls || 0) < displayCost;

  useEffect(() => {
    if (!isFlashSale || !reward?.flashSaleEndTime) return;

    const calculateTimeLeft = () => {
      const difference = new Date(reward.flashSaleEndTime).getTime() - new Date().getTime();

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
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
    if (!userData?.uid) {
      setErrorMessage('กรุณาล็อกอินก่อน');
      setStep('error');
      return;
    }
    if (isOutOfStock) return;
    if (isNotEnoughBalls) {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
      setErrorMessage('ยอด Balls ไม่พอ!');
      setStep('error');
      return;
    }

    if (step === 'idle') {
      setStep('confirm');
      if (playSound) playSound('click');
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
    } else if (step === 'confirm') {
      setStep('loading');
      try {
        const result = await redeemReward(userData.uid, reward);
        setStep('success');

        if (onSuccess) onSuccess(result);

        setTimeout(() => setStep('idle'), 3000);
      } catch (error) {
        setErrorMessage(error.message);
        setStep('error');
      }
    }
  };

  const getButtonUI = () => {
    if (isOutOfStock) {
      return {
        text: 'Sold Out',
        classes: 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200',
      };
    }
    if (isNotEnoughBalls && step === 'idle') {
      return {
        text: 'ไม่พอ',
        classes:
          'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-70',
      };
    }

    switch (step) {
      case 'confirm':
        return {
          text: 'กดยืนยันอีกครั้ง!',
          classes:
            'bg-amber-500 hover:bg-amber-600 text-white animate-pulse shadow-lg shadow-amber-500/40 border border-amber-400',
        };
      case 'loading':
        return { text: 'กำลังตรวจสอบ...', classes: 'bg-slate-100 text-slate-500 cursor-wait' };
      case 'success':
        return {
          text: 'รับสำเร็จ! 🎉',
          classes:
            'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105 border border-emerald-400',
        };
      case 'error':
        return { text: '❌ พลาด', classes: 'bg-red-500 text-white border border-red-600' };
      default:
        return {
          text: 'แลกรับรางวัล',
          classes:
            'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md active:scale-95 transition-all duration-200',
        };
    }
  };

  return {
    step,
    errorMessage,
    timeLeft,
    displayStock,
    isGacha,
    isFlashSale,
    isOutOfStock,
    isNotEnoughBalls,
    handleRedeemClick,
    buttonState: getButtonUI(),
  };
}
