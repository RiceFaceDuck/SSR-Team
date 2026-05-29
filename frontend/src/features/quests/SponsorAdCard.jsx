import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { playSound } from '../../config/theme';

export default function SponsorAdCard({ quest, record, onClaim, isClaiming }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [isMaxed, setIsMaxed] = useState(false);

  // คำนวณ Cooldown และ โควต้า แบบ Real-time
  useEffect(() => {
    // 1. ตรวจสอบว่าใช้งานครบโควต้าต่อวันหรือยัง?
    if (record && record.uses >= quest.maxClaimsPerUser) {
      setIsMaxed(true);
      setIsCooldown(false);
      setTimeLeft(null);
      return;
    }

    // 2. ตรวจสอบว่าติด Cooldown อยู่หรือไม่?
    if (record && record.lastClaimed && record.uses > 0) {
      const checkCooldown = () => {
        const lastClaimTime = new Date(record.lastClaimed).getTime();
        const cooldownMs = quest.cooldownHours * 60 * 60 * 1000;
        const nextAvailableTime = lastClaimTime + cooldownMs;
        const now = new Date().getTime();

        if (now < nextAvailableTime) {
          setIsCooldown(true);
          const diff = nextAvailableTime - now;
          
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          
          // Format เวลาให้ออกมาสวยงาม (เช่น 02:15:30)
          const formatTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          setTimeLeft(formatTime);
        } else {
          setIsCooldown(false);
          setTimeLeft(null);
        }
      };

      checkCooldown(); // รันทันที 1 ครั้ง
      const intervalId = setInterval(checkCooldown, 1000); // อัปเดตทุกๆ 1 วินาที
      
      return () => clearInterval(intervalId); // ล้าง Timer เมื่อ Component ถูกทำลาย
    } else {
      // กรณียังไม่เคยกด หรือ ไม่ติดอะไรเลย
      setIsMaxed(false);
      setIsCooldown(false);
      setTimeLeft(null);
    }
  }, [record, quest.cooldownHours, quest.maxClaimsPerUser]);

  // --- Helpers ---
  const getPlatformStyle = (platform) => {
    switch (platform) {
      case 'Shopee': return 'bg-orange-500 text-white shadow-orange-500/40';
      case 'Lazada': return 'bg-[#0f146d] text-white shadow-blue-900/40';
      case 'Facebook': return 'bg-blue-600 text-white shadow-blue-600/40';
      case 'Line': return 'bg-[#00c300] text-white shadow-green-500/40';
      case 'Official': return 'bg-indigo-600 text-white shadow-indigo-500/40';
      default: return 'bg-slate-700 text-white shadow-slate-500/40';
    }
  };

  const handleClaimClick = () => {
    if (isCooldown || isMaxed || isClaiming) return;
    playSound('click');
    onClaim(quest);
  };

  const handleLinkClick = () => {
    playSound('click');
    window.open(quest.targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-3 flex gap-4 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgba(79,70,229,0.1)] transition-all duration-300">
      
      {/* 1. ส่วนรูปภาพ (สัดส่วน 1:1) - กดเพื่อไปที่ลิงก์ได้ */}
      <div 
        onClick={handleLinkClick}
        className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden relative shadow-inner cursor-pointer"
      >
        <img 
          src={quest.imageUrl} 
          alt={quest.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=SSR+Sponsor'; }}
        />
        {/* เลเยอร์ดำจางๆ ตอน Hover ให้รู้ว่ากดได้ */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ExternalLink size={24} className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
        </div>
        
        {/* ป้ายกำกับแพลตฟอร์ม */}
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide shadow-lg ${getPlatformStyle(quest.platform)}`}>
          {quest.platform.toUpperCase()}
        </div>
      </div>

      {/* 2. ส่วนข้อมูลและปุ่มรับรางวัล */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        
        {/* หัวข้อและคำอธิบาย */}
        <div>
          <div className="flex items-start gap-1">
            <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight tracking-tight cursor-pointer hover:text-indigo-600 transition-colors" onClick={handleLinkClick}>
              {quest.title}
            </h3>
            {quest.isVerified && (
              <ShieldCheck size={16} className="text-blue-500 shrink-0 mt-0.5" title="Verified Sponsor" />
            )}
          </div>
          {quest.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{quest.description}</p>
          )}
        </div>

        {/* ปุ่ม Claim และ Status */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] font-semibold text-slate-400">
            โควต้า: {record ? record.uses : 0}/{quest.maxClaimsPerUser}
          </div>

          <button
            onClick={handleClaimClick}
            disabled={isCooldown || isMaxed || isClaiming}
            className={`
              relative overflow-hidden px-4 py-2 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all duration-300
              ${isMaxed 
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                : isCooldown
                  ? 'bg-orange-50 text-orange-500 border border-orange-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-[0_4px_15px_rgba(245,158,11,0.4)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 border border-amber-300/50 cursor-pointer'
              }
            `}
          >
            {isMaxed ? (
              <>
                <CheckCircle size={16} /> <span className="drop-shadow-sm">รับครบแล้ว</span>
              </>
            ) : isCooldown ? (
              <>
                <Clock size={14} className="animate-pulse" /> 
                <span className="font-mono tracking-tighter">{timeLeft}</span>
              </>
            ) : isClaiming ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                กำลังรับ...
              </>
            ) : (
              <>
                <span className="animate-bounce">⚽</span> <span className="drop-shadow-sm">รับ {quest.rewardBalls}</span>
              </>
            )}
            
            {/* Shimmer Effect สำหรับปุ่มที่กดได้ */}
            {!isMaxed && !isCooldown && !isClaiming && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent hover:animate-[shimmer_1.5s_infinite]"></div>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}