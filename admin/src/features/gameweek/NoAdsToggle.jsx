import React from 'react';

export default function NoAdsToggle() {
  return (
    <div className="bg-slate-900 p-6 rounded-xl shadow-md border border-slate-700 text-white h-full relative overflow-hidden">
      {/* เอฟเฟกต์ตกแต่ง */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full mix-blend-screen filter blur-[50px] opacity-40"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-blue-400 mb-2">โหมด No Ads (ฟุตบอลเตะ)</h3>
        <p className="text-sm text-slate-400 mb-6">
          สวิตช์ปิดโฆษณา AdSense ในหน้าแอปชั่วคราว เพื่อประสบการณ์ที่ดีที่สุดช่วงบอลเตะ (ควบคุมระบบหน้าบ้านได้จากตรงนี้)
        </p>
        <button className="bg-green-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 hover:bg-green-400 transition-colors">
          จำลองปุ่ม: เปิดโหมด NO ADS ทันที
        </button>
      </div>
    </div>
  );
}