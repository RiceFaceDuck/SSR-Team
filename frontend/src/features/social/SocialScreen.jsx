import React from 'react';
import { STYLES } from '../../config/theme';
import { Users, Link as LinkIcon } from 'lucide-react';

export default function SocialScreen() {
  return (
    <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">คอมมูนิตี้</h2>
      <p className="text-slate-500 mb-6 font-medium text-sm">ลีกส่วนตัวและระบบชวนเพื่อน</p>

      {}
      {/* บล็อกชวนเพื่อน */}
      <div className="bg-white border border-slate-100 p-5 rounded-2xl mb-6 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-screen filter blur-[40px] opacity-10"></div>
        <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Users size={20} className="text-amber-500" /> ชวนเพื่อนรับ 50 Pts
        </h3>
        <p className="text-xs text-slate-500 mb-4">ส่งลิงก์ให้เพื่อนสมัครเล่นเกม รับแต้มฟรีทันทีเมื่อเพื่อนจัดทีมเสร็จ</p>
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm">
          <LinkIcon size={16} /> คัดลอกลิงก์คำเชิญ
        </button>
      </div>

      {}
      <h3 className="font-bold text-lg text-slate-800 mb-4 px-2">ลีกส่วนตัว (Private Leagues)</h3>
      <div className={STYLES.card}>
        <div className="text-center py-6 text-slate-500">
          <Users size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">คุณยังไม่ได้เข้าร่วมลีกส่วนตัว</p>
          <div className="mt-4 flex gap-2 justify-center">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors">สร้างลีกใหม่</button>
            <button className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors">เข้าร่วมด้วยรหัส</button>
          </div>
        </div>
      </div>
    </div>
  );
}