import React, { useState } from 'react';
import GlassCard from '../../components/common/GlassCard';
import CountdownTimer from '../../components/common/CountdownTimer';
import Button from '../../components/common/Button';
import FormationSelector from './FormationSelector';
import PitchBoard from './PitchBoard';
import BenchArea from './BenchArea';
import PowerCardPopup from './PowerCardPopup';
import GoogleAdWrapper from '../../components/ads/GoogleAdWrapper';

export default function PitchScreen() {
  const [isPopupOpen, setPopupOpen] = useState(false);

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
          <p className="text-2xl font-black text-indigo-600 leading-none">100.0M</p>
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
          <Button variant="primary" className="w-full">
            บันทึกทีม (Save Squad)
          </Button>
        </div>
      </GlassCard>

      <GoogleAdWrapper />
      
      <PowerCardPopup isOpen={isPopupOpen} onClose={() => setPopupOpen(false)} />
    </div>
  );
}