import React from 'react';
import { Activity } from 'lucide-react';
import useBallsCalculator from '../hooks/useBallsCalculator';
import CalculatorInputs from '../components/CalculatorInputs';
import CalculatorResults from '../components/CalculatorResults';

export default function BallsCalculatorBoard() {
  const calc = useBallsCalculator();

  if (calc.isLoading) {
    return <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูลจำลอง...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            Free-to-Play Economy Simulator
          </h1>
          <p className="text-slate-500 mt-1">กระดานจำลองความสมดุลของการหาและการใช้งาน Balls สำหรับผู้เล่นสายฟรี</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Settings */}
        <div className="xl:col-span-4">
          <CalculatorInputs calc={calc} />
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-8">
          <CalculatorResults calc={calc} />
        </div>
        
      </div>
    </div>
  );
}
