import React, { useState, useEffect } from 'react';
import { Calculator, Save, AlertCircle, RefreshCw, XCircle, RotateCcw } from 'lucide-react';
import PlayerValueFormulaConfig from '../components/PlayerValueFormulaConfig';
import PlayerValuePreviewTable from '../components/PlayerValuePreviewTable';
import { previewPlayerValues, commitPlayerValues } from '../../../services/engine/playerValueCalculationService';
import { getGameRules } from '../../../services/firebase/gameRulesDatabase';

const DEFAULT_CONFIG = {
  basePrice: 5.0,
  statMultiplier: 10,
  formMultiplier: 20,
  posModifiers: { FW: 1.2, MF: 1.1, DF: 0.9, GK: 0.8 }
};

export default function PlayerValueManager({ onClose }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [budgetConfig, setBudgetConfig] = useState(200); // Default to 200m

  useEffect(() => {
    // 1. Load saved config from localStorage
    const savedConfig = localStorage.getItem('playerValueConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }

    // 2. Fetch game budget from conditions
    const fetchBudget = async () => {
      try {
        const rules = await getGameRules();
        if (rules?.startingBudget?.value) {
          setBudgetConfig(Number(rules.startingBudget.value));
        }
      } catch (err) {
        console.error("Error fetching budget", err);
      }
    };
    fetchBudget();
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('playerValueConfig', JSON.stringify(config));
  }, [config]);

  const handleResetDefault = () => {
    if (window.confirm('คุณต้องการรีเซ็ตตัวแปรกลับเป็นค่าเริ่มต้นหรือไม่?')) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const [previews, setPreviews] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const results = await previewPlayerValues(config);
      setPreviews(results);
      setHasCalculated(true);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการคำนวณ: ' + error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!previews || previews.length === 0) return;
    
    const confirmSave = window.confirm(`คุณต้องการบันทึกราคาใหม่สำหรับนักเตะจำนวน ${previews.length} คน ใช่หรือไม่?\nการกระทำนี้จะส่งผลต่อตลาดซื้อขายทันที`);
    if (!confirmSave) return;

    setIsSaving(true);
    const result = await commitPlayerValues(previews);
    setIsSaving(false);

    if (result.success) {
      alert(`บันทึกราคาใหม่สำเร็จ ${result.updatedCount} คน (ผ่าน ${result.batches} Batches)`);
      if (onClose) onClose();
    } else {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + result.error?.message);
    }
  };

  return (
    <div className="bg-slate-50 max-h-[90vh] w-full max-w-5xl mx-auto rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative">
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-sm">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">ระบบคำนวณมูลค่านักเตะ (Value Engine)</h1>
            <p className="text-sm text-slate-500">ปรับสมดุลราคานักเตะแบบอัตโนมัติตามสถิติและผลงาน</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors flex items-center gap-2 border border-transparent hover:border-red-100">
              <XCircle className="w-5 h-5" />
              ปิดหน้าต่าง
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={!hasCalculated || isSaving || isCalculating}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
          >
            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            อัพเดทข้อมูลราคา ตลาดจริง
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 overflow-y-auto flex-1">
        
        {/* Banner Alert */}
        <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-xl flex gap-3 text-amber-800 items-start">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <div className="text-xs leading-relaxed font-medium">
            <strong>คำแนะนำ:</strong> คุมงบประมาณให้พอดี {budgetConfig}m ต่อทีม (15 คน เฉลี่ย {(budgetConfig / 15).toFixed(1)}m) ควรตั้งค่ากองหน้าท็อป 20-30m และสำรองขั้นต่ำ {config.basePrice}m
          </div>
        </div>

        {/* Formula Configuration */}
        <PlayerValueFormulaConfig config={config} setConfig={setConfig} />

        {/* Action Button & Stats */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
          <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCalculate}
                disabled={isCalculating || isSaving}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 text-sm whitespace-nowrap"
              >
                {isCalculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                คำนวณราคาจำลอง (Preview)
              </button>
              <button 
                onClick={handleResetDefault}
                disabled={isCalculating || isSaving}
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 text-sm whitespace-nowrap"
                title="รีเซ็ตค่าเป็น Default"
              >
                <RotateCcw className="w-4 h-4" />
                Default
              </button>
            </div>
            
            {hasCalculated && previews.length > 0 && (
              <div className="flex items-center gap-4 md:gap-8 px-2 md:px-4 md:border-l border-slate-200 flex-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ราคาเฉลี่ย (เป้าหมาย {(budgetConfig / 15).toFixed(1)}m)</span>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-black ${
                      (previews.reduce((sum, p) => sum + p.newPrice, 0) / previews.length) > ((budgetConfig / 15) + 0.2) ? 'text-red-500' : 
                      (previews.reduce((sum, p) => sum + p.newPrice, 0) / previews.length) < ((budgetConfig / 15) - 0.3) ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {(previews.reduce((sum, p) => sum + p.newPrice, 0) / previews.length).toFixed(1)}m
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ราคาสูงสุด</span>
                  <span className="text-xl font-black text-slate-700">
                    {Math.max(...previews.map(p => p.newPrice)).toFixed(1)}m
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ราคาต่ำสุด</span>
                  <span className="text-xl font-black text-slate-700">
                    {Math.min(...previews.map(p => p.newPrice)).toFixed(1)}m
                  </span>
                </div>

                <div className="flex flex-col border-l border-slate-200 pl-4 md:pl-6 ml-auto">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">งบประมาณ (Budget)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-indigo-600">{budgetConfig}m</span>
                    <span className="text-xs font-bold text-indigo-400">({(budgetConfig / 15).toFixed(1)}m/คน)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Table */}
        <PlayerValuePreviewTable previews={previews} isLoading={isCalculating} />
        
      </div>
    </div>
  );
}
