import React from 'react';
import { Star } from 'lucide-react';

export default function SponsorBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 rounded-xl text-white mb-6 shadow-lg shadow-amber-500/30 flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform">
      <div>
        <h4 className="font-bold flex items-center gap-1">
          <Star size={16} /> Shopee Super League
        </h4>
        <p className="text-xs text-orange-100">เข้าร่วมลุ้นรับรางวัลพิเศษ!</p>
      </div>
      <span className="bg-white text-amber-500 px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-white">
        เข้าร่วมเลย
      </span>
    </div>
  );
}
