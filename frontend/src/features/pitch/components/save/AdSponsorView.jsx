import React, { useEffect } from 'react';
import { PlayCircle, ExternalLink, X } from 'lucide-react';

export default function AdSponsorView({ isAdPlaying, adsConfig, onWatchAd, onAdFinished }) {
  
  // Find active ad for save_team
  const googleAdsense = adsConfig?.googleAdsense;
  const activeLinkAd = adsConfig?.adLinks?.find(ad => ad.isActive && ad.position === 'save_team');
  const hasActiveAd = googleAdsense?.isActive || activeLinkAd;

  // Initialize AdSense if it's playing and AdSense is active
  useEffect(() => {
    if (isAdPlaying && googleAdsense?.isActive) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }
    }
  }, [isAdPlaying, googleAdsense]);

  if (!hasActiveAd) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <PlayCircle size={32} />
        </div>
        <h4 className="text-lg font-bold text-slate-800 mb-1">ปลดล็อกสำเร็จ</h4>
        <p className="text-sm text-slate-500">ระบบกำลังนำคุณไปยังหน้าบันทึกทีม...</p>
      </div>
    );
  }

  if (isAdPlaying) {
    return (
      <div className="text-center">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Advertisement</h4>
          <button 
            onClick={onAdFinished}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
          >
            ข้ามโฆษณา <X size={14} />
          </button>
        </div>

        {/* AdSense Block */}
        {googleAdsense?.isActive ? (
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden min-h-[250px] flex items-center justify-center">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client={googleAdsense.clientId}
                 data-ad-slot={googleAdsense.slotId}
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          </div>
        ) : (
          /* Custom Link Ad Block */
          <div className="w-full relative group rounded-xl overflow-hidden shadow-sm border border-slate-200">
            <a 
              href={activeLinkAd?.linkUrl || '#'} 
              target="_blank" 
              rel="noreferrer"
              onClick={() => {
                // Optional: Auto finish ad when clicked
                // onAdFinished();
              }}
            >
              <img 
                src={activeLinkAd?.imageUrl || 'https://via.placeholder.com/400x250?text=Sponsor+Banner'} 
                alt="Sponsor Ad" 
                className="w-full h-auto object-cover max-h-[300px] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <span className="bg-white/90 text-indigo-800 text-xs font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm">
                  เยี่ยมชมเว็บไซต์ <ExternalLink size={14} />
                </span>
              </div>
            </a>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-4">
          ขอบคุณที่สนับสนุนเซิร์ฟเวอร์ของเรา
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <PlayCircle size={40} />
      </div>
      <h4 className="text-xl font-bold text-slate-800 mb-2">สนับสนุนนักพัฒนา</h4>
      <p className="text-slate-500 text-sm mb-6 px-4">
        รับชมโฆษณาผู้สนับสนุน 1 ครั้ง เพื่อปลดล็อกสิทธิ์ในการบันทึกทีมลงคลาวด์
      </p>
      
      <button 
        onClick={onWatchAd}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <PlayCircle size={20} />
        <span>รับชมโฆษณา / เปิดแบนเนอร์</span>
      </button>
    </div>
  );
}
