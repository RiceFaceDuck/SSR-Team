import React from 'react';
import { PlayCircle } from 'lucide-react';

export default function AdSponsorView({ isAdPlaying, adProgress, onWatchAd }) {
  if (isAdPlaying) {
    return (
      <div className="text-center py-6">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <svg className="animate-spin w-full h-full text-slate-100" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75 text-indigo-600" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-600 text-sm">
            {Math.round(adProgress)}%
          </div>
        </div>
        <h4 className="text-lg font-bold text-slate-800 mb-1">ผู้สนับสนุนใจดีกำลังโหลด...</h4>
        <p className="text-sm text-slate-500">กรุณารอสักครู่เพื่อรับสิทธิ์เซฟทีมฟรี</p>
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
        รับชมวิดีโอสปอนเซอร์สั้นๆ 1 ครั้ง เพื่อปลดล็อกสิทธิ์ในการบันทึกทีมลงคลาวด์
      </p>
      
      <button 
        onClick={onWatchAd}
        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <PlayCircle size={20} />
        <span>รับชมวิดีโอ (3 วินาที)</span>
      </button>
    </div>
  );
}
