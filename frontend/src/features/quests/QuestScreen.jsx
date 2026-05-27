import React from 'react';
import DailyCheckIn from './DailyCheckIn';
import SponsorBanner from '../../components/ads/SponsorBanner';
import { STYLES } from '../../config/theme';

export default function QuestScreen() {
  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">ภารกิจประจำวัน</h2>
      <p className="text-slate-500 mb-6 font-medium text-sm">สะสมแต้มเพื่อนำไปแลกของรางวัล</p>
      
      <DailyCheckIn />

      <h3 className="font-bold text-lg text-slate-800 mb-4 px-2">สนับสนุนโดยสปอนเซอร์</h3>
      <SponsorBanner altText="SHOPEE/LAZADA" linkUrl="#" />

      <div className={`${STYLES.card} mt-4`}>
        <h4 className="font-bold text-slate-800 text-sm">ดูโฆษณารับ 20 Pts</h4>
        <p className="text-xs text-slate-500 mt-1 mb-3">ดูวิดีโอ 15 วินาทีเพื่อรับแต้มฟรี (ทำได้ 5 ครั้ง/วัน)</p>
        <button className="w-full bg-slate-100 text-slate-700 text-xs font-bold py-3 rounded-xl hover:bg-slate-200">
          ▶ กดเพื่อดูวิดีโอ
        </button>
      </div>
    </div>
  );
}