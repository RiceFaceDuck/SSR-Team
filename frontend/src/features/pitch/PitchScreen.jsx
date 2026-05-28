/**
 * @file PitchScreen.jsx
 * @description หน้าจอหลักสำหรับการจัดทีมลงสนาม (Pitch)
 * อัปเกรด (Phase 3 - Tap & Place): เพิ่ม PlacementBanner, Focus Mode, และ Smart Budget Preview
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
import PlacementBanner from '../../components/pitch/PlacementBanner'; // 🌟 นำเข้า Placement Banner

// นำเข้า Store, Service และ Utility
import { useUserStore } from '../../store/useUserStore';
import { squadService } from '../../services/firebase/squadService';
import { validateSquadReadyForSave } from '../../utils/squadValidator';
import { toast } from '../../utils/toast';

export default function PitchScreen() {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 🌟 ดึง State หลัก (เพิ่ม pendingPlacement และ projectedBudget มาใช้แสดงผล)
  const { userData, mySquad, budgetLeft, formation, pendingPlacement, projectedBudget } = useUserStore();

  // ฟังก์ชันสำหรับบันทึกทีมขึ้น Cloud (Firebase)
  const handleSaveSquad = async () => {
    // 1. ดักจับกรณีผู้ใช้เผลอกดรัวๆ หรือยังไม่ล็อกอิน
    if (isSaving) return;
    
    // ห้ามเซฟขณะที่กำลังอยู่ในโหมดถือการ์ดนักเตะ (ป้องกันข้อมูลไม่สมบูรณ์)
    if (pendingPlacement) {
      toast.error('กรุณาวางนักเตะลงสนาม หรือกดยกเลิกก่อนบันทึกทีม');
      return;
    }

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
        // แจ้งเตือนสำเร็จพร้อมข้อความแนบ
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
      
      {/* 🌟 แสดง Banner แถบสถานะด้านบนสุดเมื่ออยู่ในโหมดจัดวาง */}
      <PlacementBanner />

      {/* Header ของหน้าจัดทีม */}
      <div className="flex justify-between items-end mb-2 mt-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">ทีมของคุณ</h2>
          {/* 🌟 สลับข้อความ Header ถ้ากำลังอยู่ในโหมดจัดวาง */}
          {pendingPlacement ? (
            <p className="text-emerald-600 font-bold text-sm animate-pulse flex items-center gap-1">
              📍 แตะที่ช่องบนสนามเพื่อวางนักเตะ
            </p>
          ) : (
            <CountdownTimer />
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
            {pendingPlacement ? 'งบคงเหลือ (หลังซื้อ)' : 'งบประมาณ'}
          </p>
          {/* 🌟 Smart Budget Preview: โชว์เงินสีเขียวถ้ากำลังถือการ์ด */}
          <p className={`text-2xl font-black leading-none transition-colors duration-300 ${pendingPlacement ? 'text-emerald-500' : 'text-indigo-600'}`}>
            {(pendingPlacement && projectedBudget !== null) ? projectedBudget.toFixed(1) : budgetLeft.toFixed(1)}M
          </p>
        </div>
      </div>
      
      <GlassCard className="!p-4">
        <FormationSelector />
        
        {/* 🌟 Focus Mode: เรืองแสงและซูมสนามเบาๆ เมื่อถือการ์ดนักเตะอยู่ */}
        <div 
          className={`mt-4 rounded-2xl transition-all duration-500 ease-out ${
            pendingPlacement 
              ? 'scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/50 bg-emerald-50/10 z-10 relative' 
              : 'scale-100 ring-0'
          }`}
          onClick={() => {
            // ป้องกันไม่ให้เปิด Popup เล่นๆ ถ้ากำลังอยู่ในโหมดวางนักเตะ
            if (!pendingPlacement) {
              setPopupOpen(true);
            }
          }}
        >
          <PitchBoard />
        </div>
        
        <BenchArea />
        
        <div className="mt-6 text-center">
          {/* ปุ่มบันทึกทีม (อัปเกรดสถานะ Loading และ Disable ตอนถือการ์ด) */}
          <Button 
            variant="primary" 
            className={`w-full flex justify-center items-center transition-all ${
              (isSaving || pendingPlacement) ? 'opacity-70 pointer-events-none' : ''
            }`}
            onClick={handleSaveSquad}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                กำลังบันทึกทีม...
              </>
            ) : pendingPlacement ? (
              'กำลังจัดวางนักเตะ...'
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