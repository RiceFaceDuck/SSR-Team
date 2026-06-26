import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Lock, Activity, Calculator, ArrowRight } from 'lucide-react';
import PipelineStep from './PipelineStep';
import GameweekProcessForm from './GameweekProcessForm';

export default function GameweekPipeline({
  config,
  isAutoMode,
  setIsAutoMode,
  isLoadingApiGw,
  apiGameweeks,
  isProcessing,
  handleProcessGameweek,
  gwHistory,
}) {
  const navigate = useNavigate();
  const [processGwId, setProcessGwId] = useState('GW1');

  const isMarketOpen = config?.isMarketOpen ?? true;
  const currentGW = config?.currentGameweek || 'WEEK 1';
  let currentStep = isMarketOpen ? 1 : 2;

  const onProcessClick = () => {
    handleProcessGameweek(processGwId);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
      <h2 className="text-xl font-black text-slate-800 mb-8 text-center md:text-left">
        วัฏจักรเกม (The Gameweek Loop)
      </h2>

      <div className="relative">
        <div className="hidden md:block absolute left-8 top-8 bottom-8 w-1 bg-slate-100 rounded-full"></div>

        <div className="space-y-6 relative">
          <PipelineStep
            icon={PlayCircle}
            title="1. เตรียมความพร้อม & เปิดตลาด"
            description={`แอดมินอัปเดตสัปดาห์เป็น <span class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md mx-1">${currentGW}</span> และตั้งค่าสถานะตลาดให้ <strong>"เปิด"</strong> เพื่อให้ผู้เล่นเข้ามาซื้อตัวและจัดทีม`}
            isActive={currentStep === 1}
            theme="blue"
          >
            <span className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-xl text-sm animate-pulse">
              กำลังอยู่ในช่วงนี้...
            </span>
          </PipelineStep>

          <PipelineStep
            icon={Lock}
            title="2. ปิดตลาด (Deadline Passed)"
            description={`เมื่อถึงกำหนด แอดมินตั้งค่าตลาดให้ <strong>"ปิด"</strong> ผู้เล่นจะไม่สามารถแก้ไขทีมได้อีก จากนั้นรอจนกว่าการแข่งขันจริงในสนามจะจบลง`}
            isActive={currentStep === 2}
            theme="rose"
          >
            <span className="px-4 py-2 bg-rose-100 text-rose-700 font-bold rounded-xl text-sm text-center animate-pulse">
              กำลังอยู่ในช่วงนี้
            </span>
          </PipelineStep>

          <PipelineStep
            icon={Activity}
            title="3. อัปเดตสถิตินักเตะ"
            description="การแข่งขันจบ แอดมินเข้าไประบุสถิติให้นักเตะแต่ละคน (Goals, Assists, Clean Sheets) ในหน้า Game Engine"
            isActive={currentStep === 2}
            theme="amber"
          >
            <button
              onClick={() => navigate('/gameweek')}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-amber-500/30"
            >
              จัดการสถิติ <ArrowRight size={16} />
            </button>
          </PipelineStep>

          <PipelineStep
            icon={Calculator}
            title="4. ประมวลผลคะแนน & แจกรางวัล"
            description="เลือกสัปดาห์ที่ต้องการบันทึกผล และกดคำนวณคะแนนรวม จากนั้นกลับไป <strong>เปิดตลาด</strong> สำหรับรอบถัดไป"
            isActive={currentStep === 2}
            theme="emerald"
          >
            <GameweekProcessForm
              isAutoMode={isAutoMode}
              setIsAutoMode={setIsAutoMode}
              isLoadingApiGw={isLoadingApiGw}
              apiGameweeks={apiGameweeks}
              processGwId={processGwId}
              setProcessGwId={setProcessGwId}
              isProcessing={isProcessing}
              onProcessClick={onProcessClick}
              gwHistory={gwHistory}
            />
          </PipelineStep>
        </div>
      </div>
    </div>
  );
}
