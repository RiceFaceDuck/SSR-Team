import React from 'react';
import { STYLES } from '../../config/theme';

export default function PowerCardPopup({ isOpen, onClose, player }) {
  if (!isOpen) return null;

  // ป็อปอัปที่จะเด้งขึ้นมาเมื่อกดที่ตัวนักเตะ เพื่อติดตั้งการ์ดเสริมพลัง
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className={`${STYLES.card} w-full max-w-sm max-h-[80vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-lg">ติดตั้งการ์ดพลัง</h3>
          <button onClick={onClose} className="text-slate-400 font-bold p-2">X</button>
        </div>
        <p className="text-xs text-slate-500 mb-4">เลือกการ์ด 1 ใบ เพื่อติดตั้งให้ผู้เล่นคนนี้</p>
        
        {/* จำลองรายการการ์ด */}
        <div className="space-y-3">
          <div className="bg-orange-50 border-2 border-orange-200 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <h4 className="font-bold text-orange-700 text-sm">กัปตันจอมแบก</h4>
                <p className="text-[10px] text-orange-600">คูณ 3 คะแนนสัปดาห์นี้</p>
              </div>
            </div>
            <button className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">ใช้งาน</button>
          </div>
        </div>
      </div>
    </div>
  );
}