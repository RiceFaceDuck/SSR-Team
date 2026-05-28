/**
 * @file PitchScreen.jsx
 * @description หน้าจอหลักสำหรับการจัดทีมลงสนาม (Pitch)
 * อัปเกรด: เชื่อมต่อข้อมูลจริงจาก Store, นำงบประมาณมาแสดงผล, และผูกระบบบันทึกทีม (Save Squad) ขึ้น Firebase
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

import GlassCard from '../../components/common/GlassCard';
import CountdownTimer from '../../components/common/CountdownTimer';
import Button from '../../components/common/Button';
import FormationSelector from './FormationSelector';
import PitchBoard from './PitchBoard';
import BenchArea from './BenchArea';
import PowerCardPopup from './PowerCardPopup';
import GoogleAdWrapper from '../../components/ads/GoogleAdWrapper';

// นำเข้า Store, Service และ Utility ที่เกี่ยวข้อง (แก้ไข Path ให้ถูกต้อง)
import { useUserStore } from '../../store/useUserStore';
import { squadService } from '../../services/firebase/squadService';
import { validateSquadReadyForSave } from '../../utils/squadValidator';
import { toast } from '../../utils/toast';

export default function PitchScreen() {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ดึง State หลักจากระบบ
  const { userData, mySquad, budgetLeft, formation } = useUserStore();

  // ฟังก์ชันสำหรับบันทึกทีมขึ้น Cloud (Firebase)
  const handleSaveSquad = async () => {
    // 1. ดักจับกรณีผู้ใช้เผลอกดรัวๆ หรือยังไม่ล็อกอิน
    if (isSaving) return;
    if (!userData?.uid) {
      toast.error('ไม่พบข้อมูลผู้ใช้งาน กรุณาล็อกอินใหม่');
      return;
    }

    // 2. ตรวจสอบความพร้อมของทีมเบื้องต้นผ่าน Validator
    const validation = validateSquadReadyForSave(mySquad);
    if (!validation.isReady) {
      toast.error(validation.message);
      return;
    }

    // 3. เริ่มกระบวนการบันทึก
    setIsSaving(true);
    try {
      const success = await squadService.saveSquad(userData.uid, {
        mySquad,
        budgetLeft,
        formation
      });

      if (success) {
        // แจ้งเตือนสำเร็จพร้อมข้อความแนบ (เช่น เตือนว่าจัดตัวยังไม่ครบ 15 คน)
        toast.success(validation.message || 'บันทึกการจัดทีมสำเร็จ!');
      }
    } catch (error) {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการบันทึกทีม');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header ของหน้าจัดทีม */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">ทีมของคุณ</h2>
          <CountdownTimer />
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">งบประมาณ</p>
          <p className="text-2xl font-black text-indigo-600 leading-none">
            {/* นำงบประมาณจริงมาแสดงผล */}
            {budgetLeft.toFixed(1)}M
          </p>
        </div>
      </div>
      
      <GlassCard className="!p-4">
        <FormationSelector />
        
        {/* กดที่ปุ่มเพื่อทดสอบระบบ Popup ได้ (รอเชื่อม Logic จริง) */}
        <div onClick={() => setPopupOpen(true)}>
          <PitchBoard />
        </div>
        
        <BenchArea />
        
        <div className="mt-6 text-center">
          {/* ปุ่มบันทึกทีม (อัปเกรดสถานะ Loading) */}
          <Button 
            variant="primary" 
            className={`w-full flex justify-center items-center ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
            onClick={handleSaveSquad}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                กำลังบันทึกทีม...
              </>
            ) : (
              'บันทึกทีม (Save Squad)'
            )}
          </Button>
        </div>
      </GlassCard>

      <GoogleAdWrapper />
      
      <PowerCardPopup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}