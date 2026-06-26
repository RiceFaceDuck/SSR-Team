import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Save, CheckCircle, Calculator, Activity, RefreshCw, RotateCcw } from 'lucide-react';
import { ATOMIC_ACTIONS, runQuotaSimulation } from '../services/quotaTestRunner';

const DEFAULT_SCENARIO = {
  login: 1,            // เข้าสู่ระบบ 1 ครั้งต่อ Session
  viewDashboard: 2,    // เปิดหน้าแรกตอนเข้า และอาจจะกลับมาดูอีกรอบ
  viewSquad: 3,        // เปิดหน้าจัดทีมบ่อย (เช็คทีม -> ไปตลาด -> กลับมาจัด)
  saveSquad: 2,        // สลับตัว/จัดตำแหน่ง แล้วกดเซฟ
  viewMarket: 5,       // ค้นหา เลื่อนดูหน้านักเตะหลายหน้า
  buyPlayer: 1,        // ซื้อนักเตะเข้าทีม 1 คน
  sellPlayer: 1,       // ขายนักเตะออก 1 คน
  viewLiveMatch: 0,    // ไม่ใช่วันแข่ง (ถ้าวันแข่งอาจจะสูงกว่านี้)
  sendChat: 1,         // แวะพิมพ์คุย 1 ข้อความ
};

export default function QuotaSimulatorModal({ isOpen, onClose, onApply }) {
  const [scenarioConfig, setScenarioConfig] = useState(DEFAULT_SCENARIO);

  const [simulationResult, setSimulationResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCountChange = (actionId, value) => {
    setScenarioConfig((prev) => ({
      ...prev,
      [actionId]: Math.max(0, parseInt(value) || 0),
    }));
    setSimulationResult(null);
  };

  const handleRunTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      const result = runQuotaSimulation(scenarioConfig);
      setSimulationResult(result);
      setIsTesting(false);
    }, 800);
  };

  const handleApply = () => {
    if (simulationResult) {
      onApply(simulationResult.categories);
      onClose();
    }
  };

  const handleReset = () => {
    setScenarioConfig(DEFAULT_SCENARIO);
    setSimulationResult(null);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with animation */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header - Glassy Gradient */}
        <div className="flex justify-between items-center p-6 sm:p-8 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border-b border-indigo-100/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
                <Calculator className="text-white" size={24} />
              </div>
              Advanced Quota Simulator
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              ปรับแต่งพฤติกรรมผู้เล่น (Session Scenario) เพื่อประเมินค่าโควต้า Firebase ได้อย่างแม่นยำ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 bg-white/50 hover:bg-white rounded-2xl text-slate-500 hover:text-slate-800 shadow-sm transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
          
          {/* Left Panel: Configuration */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="text-indigo-500" size={20} />
                <h3 className="font-bold text-slate-700 text-lg">จำลองพฤติกรรม 1 Session</h3>
              </div>
              <button 
                onClick={handleReset}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <RotateCcw size={12} />
                Reset Default
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.values(ATOMIC_ACTIONS).map((action) => (
                <div 
                  key={action.id} 
                  className="group flex flex-col justify-between bg-white border border-slate-200 hover:border-indigo-300 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  {/* Decorative background glow on active */}
                  {scenarioConfig[action.id] > 0 && (
                    <div className="absolute -right-10 -top-10 w-24 h-24 bg-indigo-100 rounded-full blur-2xl opacity-50 pointer-events-none transition-opacity" />
                  )}
                  
                  <div className="mb-3 relative z-10">
                    <div className="text-sm font-bold text-slate-800 mb-1">{action.label}</div>
                    <div className="text-[11px] font-medium text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded-full">
                      Base: {action.defaultReads} R / {action.defaultWrites} W
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto relative z-10">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">จำนวนครั้ง</span>
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleCountChange(action.id, scenarioConfig[action.id] - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-l-xl font-bold transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={scenarioConfig[action.id]}
                        onChange={(e) => handleCountChange(action.id, e.target.value)}
                        className="w-12 h-8 text-center border-y border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-400 focus:outline-none font-black text-indigo-700"
                      />
                      <button 
                        onClick={() => handleCountChange(action.id, scenarioConfig[action.id] + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-r-xl font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Results & Actions */}
          <div className="w-full lg:w-80 flex flex-col gap-5">
            <button
              onClick={handleRunTest}
              disabled={isTesting}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                isTesting
                  ? 'bg-indigo-100 text-indigo-400 scale-[0.98]'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 shadow-xl shadow-indigo-200'
              }`}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="animate-spin" size={20} /> กำลังจำลอง...
                </>
              ) : (
                <>
                  <Play size={20} className="fill-current" />
                  Run Real Test
                </>
              )}
            </button>

            {simulationResult ? (
              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-6 border-b border-slate-700/50 pb-4 relative z-10">
                  <CheckCircle size={20} /> วิเคราะห์ผลเสร็จสิ้น
                </div>
                
                <div className="flex-1 space-y-6 relative z-10">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="text-sm text-slate-400 mb-1 font-medium tracking-wide">Total Reads</div>
                    <div className="text-4xl font-black text-emerald-400 drop-shadow-md">
                      {simulationResult.totalReads.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="text-sm text-slate-400 mb-1 font-medium tracking-wide">Total Writes</div>
                    <div className="text-4xl font-black text-blue-400 drop-shadow-md">
                      {simulationResult.totalWrites.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleApply}
                  className="mt-8 w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-lg rounded-xl flex justify-center items-center gap-2 transition-all hover:shadow-lg hover:shadow-emerald-500/30 relative z-10"
                >
                  <Save size={20} />
                  Apply to Dashboard
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border-2 border-slate-200 border-dashed p-8 rounded-3xl flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <Calculator size={48} className="text-indigo-200" />
                </div>
                <h4 className="font-bold text-slate-600 mb-1">ยังไม่มีผลลัพธ์</h4>
                <p className="text-sm text-slate-500">ปรับตั้งค่าทางซ้ายแล้วกด <br/><b>Run Real Test</b> เพื่อประเมิน</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
