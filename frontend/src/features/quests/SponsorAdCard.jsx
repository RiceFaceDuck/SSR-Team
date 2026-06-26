import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { playSound } from '../../config/theme';
import { useQuestCooldown } from './hooks/useQuestCooldown';

export default function SponsorAdCard({ quest, record, onClaim, isClaiming }) {
  const { isMaxed, isCooldown, timeLeft } = useQuestCooldown(quest, record);

  // สถานะสำหรับการ Verify Visit
  const [hasVisited, setHasVisited] = useState(false);
  // ถ้าไม่มี targetUrl ให้ claim ได้เลยตั้งแต่ต้น
  const [canClaim, setCanClaim] = useState(!quest.targetUrl);

  // ตรวจจับเมื่อผู้ใช้กลับมาที่แท็บเกมหลังจากไปดูเว็บสปอนเซอร์
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hasVisited) {
        setCanClaim(true);
      }
    };

    const handleFocus = () => {
      if (hasVisited) setCanClaim(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [hasVisited]);

  // --- Helpers ---
  const getDirectImageUrl = (url) => {
    if (!url) return '';
    const driveRegex =
      /(?:drive\.google\.com\/.*?(?:id=|\/d\/)|drive\.google\.com\/file\/d\/)([\w-]+)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  };

  const getPlatformStyle = (platform) => {
    switch (platform) {
      case 'Shopee':
        return 'bg-orange-500 text-white shadow-orange-500/40';
      case 'Lazada':
        return 'bg-[#0f146d] text-white shadow-blue-900/40';
      case 'Facebook':
        return 'bg-blue-600 text-white shadow-blue-600/40';
      case 'Line':
        return 'bg-[#00c300] text-white shadow-green-500/40';
      case 'Official':
        return 'bg-indigo-600 text-white shadow-indigo-500/40';
      default:
        return 'bg-slate-700 text-white shadow-slate-500/40';
    }
  };

  // ฟังก์ชันเปิดลิงก์และเปลี่ยนสถานะว่าดูแล้ว
  const openLink = () => {
    if (quest.targetUrl) {
      playSound('click');
      window.open(quest.targetUrl, '_blank', 'noopener,noreferrer');
      setHasVisited(true);
    }
  };

  // ฟังก์ชันเมื่อกดปุ่มหลัก
  const handleMainButtonClick = () => {
    if (isCooldown || isMaxed || isClaiming) return;

    if (!canClaim) {
      // ถ้ายังไม่ดูโฆษณา ให้ไปดูโฆษณาก่อน
      openLink();
    } else {
      // ถ้าดูแล้ว และปลดล็อกแล้ว ให้รับรางวัลได้เลย ไม่ต้องเปิดซ้ำ
      playSound('click');
      onClaim(quest);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 flex gap-4 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-indigo-200 transition-all duration-300">
      {/* 1. ส่วนรูปภาพ (สัดส่วน 1:1) - กดเพื่อไปที่ลิงก์ได้ */}
      <div
        onClick={openLink}
        className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden relative shadow-inner cursor-pointer"
      >
        <img
          src={getDirectImageUrl(quest.imageUrl)}
          alt={quest.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150?text=SSR+Sponsor';
          }}
        />
        {/* เลเยอร์ดำจางๆ ตอน Hover ให้รู้ว่ากดได้ */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ExternalLink
            size={24}
            className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300"
          />
        </div>

        {/* ป้ายกำกับแพลตฟอร์ม */}
        {quest.platform && (
          <div
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide shadow-lg ${getPlatformStyle(quest.platform)}`}
          >
            {quest.platform.toUpperCase()}
          </div>
        )}
      </div>

      {/* 2. ส่วนข้อมูลและปุ่มรับรางวัล */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        {/* หัวข้อและคำอธิบาย */}
        <div>
          <div className="flex items-start gap-1">
            <h3
              className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight tracking-tight cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={openLink}
            >
              {quest.title}
            </h3>
            {quest.isVerified && (
              <ShieldCheck
                size={16}
                className="text-indigo-500 shrink-0 mt-0.5"
                title="Verified Sponsor"
              />
            )}
          </div>
          {quest.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{quest.description}</p>
          )}
        </div>

        {/* ปุ่ม Claim และ Status */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] font-semibold text-slate-500">
            สิทธิ์คงเหลือ: {record ? record.uses : 0}/{quest.maxClaimsPerUser}
          </div>

          <button
            onClick={handleMainButtonClick}
            disabled={isCooldown || isMaxed || isClaiming}
            className={`
              relative overflow-hidden px-4 py-2 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all duration-300
              ${
                isMaxed
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : isCooldown
                    ? 'bg-orange-50 text-orange-600 border border-orange-200 cursor-not-allowed'
                    : isClaiming
                      ? 'bg-indigo-400 text-white cursor-not-allowed'
                      : !canClaim
                        ? 'bg-white text-indigo-600 border border-indigo-200 shadow-sm hover:bg-indigo-50 hover:shadow-md cursor-pointer'
                        : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-indigo-500/50 cursor-pointer'
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
            ) : !canClaim ? (
              <>
                <ExternalLink size={14} /> <span className="drop-shadow-sm">ดูโฆษณา รับ {quest.rewardBalls}⚽</span>
              </>
            ) : (
              <>
                <span className="animate-bounce">⚽</span>{' '}
                <span className="drop-shadow-sm">รับ {quest.rewardBalls}</span>
              </>
            )}

            {/* Shimmer Effect สำหรับปุ่มที่กดรับได้แล้ว */}
            {canClaim && !isMaxed && !isCooldown && !isClaiming && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent hover:animate-[shimmer_1.5s_infinite]"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
