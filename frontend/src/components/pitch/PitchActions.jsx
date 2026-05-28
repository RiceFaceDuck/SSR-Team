import React, { useState } from 'react';
import { Trash2, Wand2, Save, Loader2 } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function PitchActions() {
  const { mySquad, clearPitch, autoFillTeam } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  // คำนวณความเคลื่อนไหวภายในทีม เพื่อควบคุมการเปิด-ปิดการทำงานของปุ่มควบคุมอย่างแม่นยำ
  const startersCount = mySquad.filter(p => p.isStarting).length;
  const benchCount = mySquad.filter(p => !p.isStarting).length;
  
  const isPitchEmpty = startersCount === 0;
  const isBenchEmpty = benchCount === 0;
  const isSquadEmpty = mySquad.length === 0;

  // ฟังก์ชันล้างสนาม - ย้ายผู้เล่นตัวจริงทั้งหมดกลับไปยังม้านั่งสำรอง
  const handleClearPitch = () => {
    if (isPitchEmpty) return;
    clearPitch();
    if (toast && toast.success) {
      toast.success('ล้างสนามเรียบร้อย ดึงนักเตะกลับม้านั่งสำรอง');
    }
  };

  // ฟังก์ชันจัดทีมอัตโนมัติ - เติมเต็มตำแหน่งว่างในกระดานโดยใช้ตัวเลือกที่ดีที่สุดบนม้านั่งสำรอง
  const handleAutoFill = () => {
    if (isBenchEmpty) return;
    const result = autoFillTeam();
    if (toast) {
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  // ฟังก์ชันจำลองการส่งข้อมูลไปบันทึกกับ Server พร้อมสถานะ Loading และ Haptic Feedback
  const handleSaveSquad = async () => {
    if (isSquadEmpty || isSaving) return;
    setIsSaving(true);
    
    try {
      // จำลองดีเลย์สำหรับการอัปโหลดเพื่อความสวยงามในเชิงอนิเมชันของพอร์ทัล
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (toast && toast.success) {
        toast.success('บันทึกแผนการเล่นเรียบร้อยแล้ว!');
      }
    } catch (error) {
      if (toast && toast.error) {
        toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูลทีม');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex justify-center px-4 py-4 z-20">
      {/* ส่วนควบคุมแบบลอยตัวสไตล์ Glassmorphism ด้วยสีพื้นหลังสีกรมและขอบเบลออันพรีเมียม */}
      <div className="flex items-center gap-3 p-2 rounded-full 
                      bg-slate-900/60 backdrop-blur-md border border-slate-700/50 
                      shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        
        {/* 🧹 ปุ่มล้างสนาม */}
        <button
          onClick={handleClearPitch}
          disabled={isPitchEmpty}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200
            ${isPitchEmpty 
              ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-800/30' 
              : 'text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-300 border border-slate-700 active:scale-95'
            }`}
          title="ดึงผู้เล่นทั้งหมดกลับม้านั่งสำรอง"
        >
          <Trash2 size={18} />
          <span className="hidden sm:inline">ล้างสนาม</span>
        </button>

        {/* 🪄 ปุ่มจัดทีมอัตโนมัติ */}
        <button
          onClick={handleAutoFill}
          disabled={isBenchEmpty}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-200
            ${isBenchEmpty
              ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-800/30'
              : 'text-cyan-300 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95'
            }`}
          title="จัดตัวผู้เล่นจากม้านั่งสำรองลงสนามอัตโนมัติ"
        >
          <Wand2 size={18} className={!isBenchEmpty && startersCount === 0 ? 'animate-pulse' : ''} />
          <span>จัดทีมออโต้</span>
        </button>

        {/* 💾 ปุ่มบันทึกทีม */}
        <button
          onClick={handleSaveSquad}
          disabled={isSaving || isSquadEmpty}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-200
            ${isSquadEmpty
              ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-800/30'
              : 'text-emerald-400 bg-slate-800/80 hover:bg-emerald-500/10 hover:text-emerald-300 border border-slate-700 active:scale-95'
            }`}
          title="บันทึกแผนการเล่นปัจจุบัน"
        >
          {isSaving ? (
             <Loader2 size={18} className="animate-spin text-emerald-500" />
          ) : (
             <Save size={18} />
          )}
          <span className="hidden sm:inline">{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</span>
        </button>

      </div>
    </div>
  );
}