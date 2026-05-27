import React from 'react';
import { STYLES } from '../../config/theme';

export default function SponsorBanner({ imageUrl, linkUrl, altText = "Sponsor" }) {
  return (
    <a href={linkUrl} target="_blank" rel="noreferrer" className="block w-full rounded-2xl overflow-hidden shadow-md border-2 border-indigo-100 hover:border-indigo-400 transition-colors my-4">
      {/* ใช้ Div แทนรูปภาพไปก่อนในช่วงทำโครงสร้าง */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 h-24 flex items-center justify-center text-white font-black text-xl tracking-widest relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/path/to/noise.png')] opacity-20 mix-blend-overlay"></div>
        {altText} BANNER
      </div>
    </a>
  );
}