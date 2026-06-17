import React, { useState, useEffect } from 'react';
import { Target, Save, AlertCircle } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';
import ScoreStatItem from '../components/ScoreStatItem';
import PositionScoreCard from '../components/PositionScoreCard';
import ScoreCalculatorPreview from '../components/ScoreCalculatorPreview';
import { getScoringRules, updateScoringRules } from '../../../services/firebase/gameRulesDatabase';

export default function ScoreRulesManager({ isEmbedded = false }) {
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Default values structure based on 10k Scale
  const defaultRules = {
    // Basic Stats
    playUnder60: { value: 100, isActive: true },
    playOver60: { value: 200, isActive: true },
    goal: { FWD: 800, MID: 1000, DEF: 1200, GK: 1500, isActive: true },
    assist: { value: 600, isActive: true },
    cleanSheet: { DEF: 500, GK: 500, MID: 200, FWD: 0, isActive: true },
    
    // Defensive
    tackles: { value: 100, per: 3, isActive: true, desc: "ทุกๆ 3 แทคเกิล" },
    blocks: { value: 100, per: 2, isActive: true, desc: "ทุกๆ 2 บล็อค" },
    saves: { value: 50, per: 1, isActive: true, desc: "GK ทุกๆ 1 เซฟ" },
    
    // Offensive
    keyPasses: { value: 100, per: 3, isActive: true, desc: "ทุกๆ 3 Key Passes" },
    dribbles: { value: 100, per: 3, isActive: true, desc: "ทุกๆ 3 Dribbles" },
    
    // Special/Negative
    penaltySaved: { value: 1000, isActive: true },
    penaltyMissed: { value: -500, isActive: true },
    penaltyWon: { value: 400, isActive: true },
    penaltyCommitted: { value: -400, isActive: true },
    yellowCard: { value: -200, isActive: true },
    redCard: { value: -600, isActive: true },
    ownGoal: { value: -800, isActive: true }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await getScoringRules();
      if (data) {
        // Merge with defaults in case of new added stats
        setRules({ ...defaultRules, ...data });
      } else {
        setRules(defaultRules);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    try {
      await updateScoringRules(rules);
      alert('บันทึกกติกาคะแนนเรียบร้อยแล้ว');
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateRule = (key, field, value) => {
    setRules(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-3xl"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }


  return (
    <div className="max-w-4xl space-y-6 pb-20">
      {!isEmbedded && (
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-4 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <Target size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">จัดการคะแนนสถิติ</h1>
              <p className="text-slate-500 font-medium">ตั้งค่าคะแนนสำหรับแต่ละเหตุการณ์</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            <Save size={20} />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกคะแนน'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {rules && (
        <>
          <ScoreCalculatorPreview rules={rules} />

          {/* Basic Stats */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">คะแนนพื้นฐาน (Basic Stats)</h2>
            
            <ScoreStatItem ruleKey="playUnder60" label="ลงเล่นน้อยกว่า 60 นาที" ruleData={rules.playUnder60} onUpdate={updateRule} />
            <ScoreStatItem ruleKey="playOver60" label="ลงเล่นตั้งแต่ 60 นาทีขึ้นไป" ruleData={rules.playOver60} onUpdate={updateRule} />
            <ScoreStatItem ruleKey="assist" label="แอสซิสต์ (Assist)" ruleData={rules.assist} onUpdate={updateRule} />

            {/* Goals (Position Based) */}
            <PositionScoreCard ruleKey="goal" label="การทำประตู (Goals)" desc="คะแนนแยกตามตำแหน่ง" ruleData={rules.goal} onUpdate={updateRule} />

            {/* Clean Sheets (Position Based) */}
            <div className="mt-4">
              <PositionScoreCard ruleKey="cleanSheet" label="คลีนชีต (Clean Sheets)" desc="คะแนนแยกตามตำแหน่ง (มักจะให้เฉพาะ DEF/GK/MID)" ruleData={rules.cleanSheet} onUpdate={updateRule} />
            </div>
          </div>

          {/* Defensive & Offensive Stats */}
          <div className="space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">สถิติเกมรับ (Defensive)</h2>
              <ScoreStatItem ruleKey="tackles" label="แทคเกิล (Tackles)" ruleData={rules.tackles} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="blocks" label="บล็อคลูกยิง (Blocks)" ruleData={rules.blocks} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="saves" label="เซฟประตู (Saves)" ruleData={rules.saves} onUpdate={updateRule} />
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">สถิติเกมรุก (Offensive)</h2>
              <ScoreStatItem ruleKey="keyPasses" label="จ่ายบอลสำคัญ (Key Passes)" ruleData={rules.keyPasses} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="dribbles" label="เลี้ยงผ่านคู่แข่ง (Dribbles)" ruleData={rules.dribbles} onUpdate={updateRule} />
            </div>
          </div>

          {/* Special Events */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mt-6 mb-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">เหตุการณ์พิเศษและบทลงโทษ</h2>
            <div className="space-y-3">
              <ScoreStatItem ruleKey="penaltySaved" label="เซฟจุดโทษ (GK)" ruleData={rules.penaltySaved} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="penaltyMissed" label="ยิงจุดโทษพลาด" ruleData={rules.penaltyMissed} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="penaltyWon" label="เรียกจุดโทษได้" ruleData={rules.penaltyWon} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="penaltyCommitted" label="ทำเสียจุดโทษ" ruleData={rules.penaltyCommitted} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="yellowCard" label="โดนใบเหลือง" ruleData={rules.yellowCard} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="redCard" label="โดนใบแดง" ruleData={rules.redCard} onUpdate={updateRule} />
              <ScoreStatItem ruleKey="ownGoal" label="ทำเข้าประตูตัวเอง" ruleData={rules.ownGoal} onUpdate={updateRule} />
            </div>
          </div>

          <div className="flex justify-center md:justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าคะแนน'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
