import React from 'react';

export default function WonItemModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-300 flex flex-col relative border-4 border-amber-400">
        {/* โบว์ตกแต่ง */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-amber-400 rounded-b-xl flex justify-center items-end pb-1 shadow-inner">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
            Jackpot
          </span>
        </div>

        <div className="p-8 text-center pt-10">
          <h3 className="text-2xl font-black text-slate-800 mb-2">ยินดีด้วย! 🎉</h3>
          <p className="text-sm text-slate-500 font-medium mb-6">คุณเปิดกล่องสุ่มได้รับ</p>

          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 shadow-inner mb-6 transform hover:scale-105 transition-transform">
            <div className="text-5xl mb-3 drop-shadow-md">🎁</div>
            <h4 className="font-black text-lg text-amber-600 leading-tight">
              {item.name || 'ไอเทมปริศนา'}
            </h4>
            {item.rarity && (
              <span className="inline-block mt-2 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                ระดับ: {item.rarity}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 py-3.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            รับรางวัลและปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
