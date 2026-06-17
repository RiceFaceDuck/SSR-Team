import React from 'react';
import { Zap, Clock, Package, HelpCircle } from 'lucide-react';
import { useRewardCard } from './hooks/useRewardCard';

export function RewardCard({ reward, title, cost, imageSlot, onSuccess }) {
  const {
    step,
    errorMessage,
    timeLeft,
    displayStock,
    isGacha,
    isFlashSale,
    isOutOfStock,
    isNotEnoughBalls,
    handleRedeemClick,
    buttonState
  } = useRewardCard(reward, onSuccess);

  const displayTitle = reward?.name || reward?.title || title;
  const displayCost = reward?.price || reward?.cost || cost;
  const displayImage = reward?.imageUrl || null;
  const displayDesc = reward?.description || '';
  
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