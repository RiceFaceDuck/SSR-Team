import React, { useState, useEffect } from 'react';
import { Target, Save, AlertCircle } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';
import { getScoringRules, updateScoringRules } from '../../../services/firebase/gameRulesDatabase';

export default function ScoreRulesManager({ isEmbedded = false }) {
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Default values structure based on API-Football Pro
  const defaultRules = {
    // Basic Stats
    playUnder60: { value: 1, isActive: true },
    playOver60: { value: 2, isActive: true },
    goal: { FWD: 4, MID: 5, DEF: 6, GK: 6, isActive: true },
    assist: { value: 3, isActive: true },
    cleanSheet: { DEF: 4, GK: 4, MID: 1, FWD: 0, isActive: true },
    
    // Defensive
    tackles: { value: 1, per: 3, isActive: true, desc: "ทุกๆ 3 แทคเกิล" },
    blocks: { value: 1, per: 2, isActive: true, desc: "ทุกๆ 2 บล็อค" },
    saves: { value: 1, per: 3, isActive: true, desc: "GK ทุกๆ 3 เซฟ" },
    
    // Offensive
    keyPasses: { value: 1, per: 3, isActive: true, desc: "ทุกๆ 3 Key Passes" },
    dribbles: { value: 1, per: 3, isActive: true, desc: "ทุกๆ 3 Dribbles" },
    
    // Special/Negative
    penaltySaved: { value: 5, isActive: true },
    penaltyMissed: { value: -2, isActive: true },
    penaltyWon: { value: 2, isActive: true },
    penaltyCommitted: { value: -2, isActive: true },
    yellowCard: { value: -1, isActive: true },
    redCard: { value: -3, isActive: true },
    ownGoal: { value: -2, isActive: true }
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

  // Helper render function for simple value stats
  const renderSimpleStat = (key, label, desc) => (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-3 hover:bg-slate-100 transition-colors">
      <div className="mb-3">
        <ToggleSwitch
          label={label}
          description={desc || rules[key]?.desc}
          checked={rules[key]?.isActive}
          onChange={(val) => updateRule(key, 'isActive', val)}
        />
      </div>
      {rules[key]?.isActive && (
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">คะแนน (Points):</span>
            <input
              type="number"
              value={rules[key]?.value || 0}
              onChange={(e) => updateRule(key, 'value', parseInt(e.target.value) || 0)}
              className="w-20 border border-slate-300 rounded-lg px-3 py-1.5 text-center focus:border-blue-500 outline-none"
            />
          </div>
          {rules[key]?.per && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">ต่อจำนวน (Per):</span>
              <input
                type="number"
                value={rules[key]?.per || 0}
                onChange={(e) => updateRule(key, 'per', parseInt(e.target.value) || 0)}
                className="w-20 border border-slate-300 rounded-lg px-3 py-1.5 text-center focus:border-blue-500 outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

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
          {/* Basic Stats */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">คะแนนพื้นฐาน (Basic Stats)</h2>
            
            {renderSimpleStat('playUnder60', 'ลงเล่นน้อยกว่า 60 นาที')}
            {renderSimpleStat('playOver60', 'ลงเล่นตั้งแต่ 60 นาทีขึ้นไป')}
            {renderSimpleStat('assist', 'แอสซิสต์ (Assist)')}

            {/* Goals (Position Based) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <ToggleSwitch
                label="การทำประตู (Goals)"
                description="คะแนนแยกตามตำแหน่ง"
                checked={rules.goal?.isActive}
                onChange={(val) => updateRule('goal', 'isActive', val)}
              />
              {rules.goal?.isActive && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {['FWD', 'MID', 'DEF', 'GK'].map(pos => (
                    <div key={`goal-${pos}`}>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{pos}</label>
                      <input
                        type="number"
                        value={rules.goal?.[pos] || 0}
                        onChange={(e) => updateRule('goal', pos, parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Clean Sheets (Position Based) */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <ToggleSwitch
                label="คลีนชีต (Clean Sheets)"
                description="คะแนนแยกตามตำแหน่ง (มักจะให้เฉพาะ DEF/GK/MID)"
                checked={rules.cleanSheet?.isActive}
                onChange={(val) => updateRule('cleanSheet', 'isActive', val)}
              />
              {rules.cleanSheet?.isActive && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {['FWD', 'MID', 'DEF', 'GK'].map(pos => (
                    <div key={`cs-${pos}`}>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{pos}</label>
                      <input
                        type="number"
                        value={rules.cleanSheet?.[pos] || 0}
                        onChange={(e) => updateRule('cleanSheet', pos, parseInt(e.target.value) || 0)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Defensive & Offensive Stats */}
          <div className="space-y-6">
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">สถิติเกมรับ (Defensive)</h2>
              {renderSimpleStat('tackles', 'แทคเกิล (Tackles)')}
              {renderSimpleStat('blocks', 'บล็อคลูกยิง (Blocks)')}
              {renderSimpleStat('saves', 'เซฟประตู (Saves)')}
            </div>

            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">สถิติเกมรุก (Offensive)</h2>
              {renderSimpleStat('keyPasses', 'จ่ายบอลสำคัญ (Key Passes)')}
              {renderSimpleStat('dribbles', 'เลี้ยงผ่านคู่แข่ง (Dribbles)')}
            </div>
          </div>

          {/* Special Events */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 mt-6 mb-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-3 mb-4">เหตุการณ์พิเศษและบทลงโทษ</h2>
            <div className="space-y-3">
              {renderSimpleStat('penaltySaved', 'เซฟจุดโทษ (GK)')}
              {renderSimpleStat('penaltyMissed', 'ยิงจุดโทษพลาด')}
              {renderSimpleStat('penaltyWon', 'เรียกจุดโทษได้')}
              {renderSimpleStat('penaltyCommitted', 'ทำเสียจุดโทษ')}
              {renderSimpleStat('yellowCard', 'โดนใบเหลือง')}
              {renderSimpleStat('redCard', 'โดนใบแดง')}
              {renderSimpleStat('ownGoal', 'ทำเข้าประตูตัวเอง')}
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
