import React, { useState } from 'react';
import { Users, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useUserStore } from '../../../store/useUserStore';
import { useGameStore } from '../../../store/useGameStore';
import { showToast } from '../../../utils/toast';

export default function ReferralCard() {
  const { userData } = useUserStore();
  const { referralRewardBalls } = useGameStore();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!userData || !userData.uid) {
      showToast('error', 'กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    // สร้างลิงก์เชิญ (ใช้ URL ปัจจุบัน + ?ref=uid)
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/?ref=${userData.uid}`;

    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      showToast('success', 'คัดลอกลิงก์สำเร็จ!');

      // สั่นเตือนเบาๆ
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div className="bg-white border border-slate-100 p-5 rounded-2xl mb-6 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-screen filter blur-[40px] opacity-10"></div>
      <h3 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
        <Users size={20} className="text-amber-500" /> ชวนเพื่อนรับ {referralRewardBalls || 50}{' '}
        Balls
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        ส่งลิงก์ให้เพื่อนสมัครเล่นเกม รับ Balls ฟรีทันทีเมื่อเพื่อนจัดทีมเสร็จ
      </p>
      <button
        onClick={handleCopyLink}
        className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm ${
          copied
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }`}
      >
        {copied ? (
          <>
            <CheckCircle size={16} /> คัดลอกลิงก์แล้ว
          </>
        ) : (
          <>
            <LinkIcon size={16} /> คัดลอกลิงก์คำเชิญ
          </>
        )}
      </button>
    </div>
  );
}
