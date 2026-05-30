/**
 * @file SaveSquadModal.jsx
 * @description โมดอลสำหรับยืนยันการบันทึกแผนการเล่นและนักเตะลงสนาม 
 * รวมระบบ "ดูโฆษณาสปอนเซอร์เพื่อปลดล็อกการเซฟ" (Monetization Feature)
 */

import React, { useState, useEffect } from 'react';
import { Save, X, PlayCircle, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';
import { toast } from '../../utils/toast';

export default function SaveSquadModal({ isOpen, onClose, onConfirmSave }) {
  const { isSaveUnlocked, unlockSave, mySquad, formation } = useUserStore();
  
  // Local State
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // คำนวณจำนวนผู้เล่นตัวจริงบนสนาม
  const startersCount = mySquad.filter(p => p.isStarting).length;
  const isSquadComplete = startersCount === 11;

  useEffect(() => {
    if (!isOpen) {
      setIsAdPlaying(false);
      setAdProgress(0);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleWatchAd = () => {
    setIsAdPlaying(true);
    setAdProgress(0);
    
    // จำลองระยะเวลาโฆษณา 3 วินาที
    const duration = 3000;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setAdProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAdPlaying(false);
          unlockSave(); // ปลดล็อกสถานะใน Store
          toast.success('ปลดล็อกการเซฟเรียบร้อย!');
        }, 300);
      }
    }, intervalTime);
  };

  const handleSaveClick = async () => {
    if (startersCount === 0) {
      toast.error("ไม่มีนักเตะบนสนาม กรุณาจัดทีมก่อนเซฟ");
      return;
    }

    setIsSaving(true);
    try {
      // เรียกใช้ฟังก์ชันเซฟที่ส่งมาจาก PitchScreen
      if (onConfirmSave) {
        await onConfirmSave();
      }
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (คลิกเพื่อปิดได้ถ้าไม่ได้ดูโฆษณาหรือกำลังเซฟ) */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => !isAdPlaying && !isSaving && onClose()}
      />

      {}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Save size={20} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">บันทึกแผนการเล่น</h3>
          </div>
          {!isAdPlaying && !isSaving && (
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6">
          
          {}
          {isAdPlaying ? (
            <div className="text-center py-6">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg className="animate-spin w-full h-full text-slate-100" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75 text-indigo-600" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-600 text-sm">
                  {Math.round(adProgress)}%
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-1">ผู้สนับสนุนใจดีกำลังโหลด...</h4>
              <p className="text-sm text-slate-500">กรุณารอสักครู่เพื่อรับสิทธิ์เซฟทีมฟรี</p>
            </div>
          ) : 
          
          !isSaveUnlocked ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle size={40} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">สนับสนุนนักพัฒนา</h4>
              <p className="text-slate-500 text-sm mb-6 px-4">
                รับชมวิดีโอสปอนเซอร์สั้นๆ 1 ครั้ง เพื่อปลดล็อกสิทธิ์ในการบันทึกทีมลงคลาวด์
              </p>
              
              <button 
                onClick={handleWatchAd}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <PlayCircle size={20} />
                <span>รับชมวิดีโอ (3 วินาที)</span>
              </button>
            </div>
          ) : 
          
          (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="text-left">
                    <h5 className="font-bold text-slate-800">สิทธิ์การเซฟพร้อมใช้งาน</h5>
                    <p className="text-xs text-emerald-600 font-medium">ปลดล็อกจากการดูโฆษณาแล้ว</p>
                  </div>
                </div>
                <CheckCircle2 size={24} className="text-emerald-500" />
              </div>

              {/* ข้อมูลสรุปทีมที่จะเซฟ */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-sm">แผนการเล่นปัจจุบัน</span>
                  <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">{formation}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium text-sm">ผู้เล่นบนสนาม</span>
                  <span className={`font-bold ${isSquadComplete ? 'text-emerald-600' : 'text-amber-500'} bg-slate-100 px-3 py-1 rounded-lg flex items-center gap-1`}>
                    {startersCount}/11
                    {!isSquadComplete && <AlertCircle size={14} className="text-amber-500" />}
                  </span>
                </div>
              </div>

              {!isSquadComplete && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>ทีมยังไม่ครบ 11 คน คุณสามารถเซฟไว้เป็นฉบับร่างได้ แต่อาจจะไม่ได้รับคะแนนในรอบการแข่งขัน</p>
                </div>
              )}

              {/* ปุ่มยืนยันการบันทึก */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSaveClick}
                  disabled={isSaving || startersCount === 0}
                  className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 active:scale-[0.98] shadow-lg shadow-slate-800/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>บันทึกทีมลงคลาวด์</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}