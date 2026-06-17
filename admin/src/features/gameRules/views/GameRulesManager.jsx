import React, { useState, useEffect } from 'react';
import { ScrollText, Save, AlertCircle } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';
import { getGameRules, updateGameRules } from '../../../services/firebase/gameRulesDatabase';

export default function GameRulesManager({ isEmbedded = false }) {
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const defaultRules = {
    startingBudget: { value: 100, isActive: true },
    maxPlayersPerTeam: { value: 3, isActive: true },
    freeTransfers: { value: 1, isActive: true },
    captainMultiplier: { value: 2, isActive: true },
    viceCaptainSystem: { isActive: true },
    budgetCarryOver: { percent: 50, isActive: true },
    synergyBonus: { sameTeamThreshold: 3, sameNationThreshold: 4, bonusPercent: 5, isActive: true },
    playStreaks: { streakTarget: 3, rewardType: "budget", rewardValue: 5, isActive: true }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await getGameRules();
      if (data) {
        setRules(data);
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
      await updateGameRules(rules);
      alert('บันทึกกติกาเกมเรียบร้อยแล้ว');
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
    <div className="max-w-4xl space-y-6">
      {!isEmbedded && (
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <ScrollText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">จัดการกติกาเกม</h1>
              <p className="text-slate-500 font-medium">ตั้งค่ากติกาพื้นฐานสำหรับการจัดทีมและการเล่น</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            <Save size={20} />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกกติกา'}
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
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3">กติกาการจัดทีม (Team Building Rules)</h2>
          
          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors">
            <ToggleSwitch
              label="งบประมาณเริ่มต้น (Starting Budget)"
              description="เปิด/ปิด การจำกัดงบในการสร้างทีม"
              info="งบตั้งต้นที่ผู้เล่นทุกคนจะได้รับตอนเริ่มฤดูกาลเพื่อนำไปจัดทีม"
              checked={rules.startingBudget?.isActive}
              onChange={(val) => updateRule('startingBudget', 'isActive', val)}
            />
            {rules.startingBudget?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">จำนวนงบ (M):</label>
                <input
                  type="number"
                  value={rules.startingBudget?.value || 0}
                  onChange={(e) => updateRule('startingBudget', 'value', parseFloat(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors mt-4">
            <ToggleSwitch
              label="จำกัดโควต้านักเตะสโมสรเดียวกัน"
              description="เปิด/ปิด การจำกัดจำนวนนักเตะจากสโมสรเดียวกัน"
              info="หากผู้เล่นเลือกนักเตะจากสโมสรเดียวกันเกินกำหนด ระบบจะไม่ให้เซฟทีม"
              checked={rules.maxPlayersPerTeam?.isActive}
              onChange={(val) => updateRule('maxPlayersPerTeam', 'isActive', val)}
            />
            {rules.maxPlayersPerTeam?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">สูงสุด/สโมสร:</label>
                <input
                  type="number"
                  value={rules.maxPlayersPerTeam?.value || 0}
                  onChange={(e) => updateRule('maxPlayersPerTeam', 'value', parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors mt-4">
            <ToggleSwitch
              label="ระบบโควต้าเปลี่ยนตัวฟรี (Free Transfers)"
              description="ให้สิทธิ์ผู้จัดการทีมเปลี่ยนตัวนักเตะฟรีรายสัปดาห์"
              info="ทุก 1 ตัวที่ผู้เล่นเปลี่ยนเกินโควต้าฟรี จะถูกหักคะแนนลบออกจากคะแนนรวมประจำสัปดาห์ (เช่น -4 แต้ม)"
              checked={rules.freeTransfers?.isActive}
              onChange={(val) => updateRule('freeTransfers', 'isActive', val)}
            />
            {rules.freeTransfers?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">ฟรี (ต่อ GW):</label>
                <input
                  type="number"
                  value={rules.freeTransfers?.value || 0}
                  onChange={(e) => updateRule('freeTransfers', 'value', parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors mt-4">
            <ToggleSwitch
              label="ระบบกัปตันทีม (Captain Multiplier)"
              description="ตัวคูณพิเศษสำหรับกัปตันทีม"
              info="คะแนนที่กัปตันทีมทำได้ในสัปดาห์นั้นๆ จะถูกคูณด้วยตัวเลขนี้เสมอ"
              checked={rules.captainMultiplier?.isActive}
              onChange={(val) => updateRule('captainMultiplier', 'isActive', val)}
            />
            {rules.captainMultiplier?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">ตัวคูณคะแนน:</label>
                <input
                  type="number"
                  step="0.5"
                  value={rules.captainMultiplier?.value || 0}
                  onChange={(e) => updateRule('captainMultiplier', 'value', parseFloat(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          {/* New Features Toggle */}
          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors mt-4">
            <ToggleSwitch
              label="ระบบรองกัปตันทีม (Vice-Captain)"
              description="สำรองคูณคะแนนกรณีกัปตันตัวจริงไม่ได้ลงสนาม"
              info="หากกัปตันตัวจริงไม่ได้ลงสนามเลยแม้แต่นาทีเดียว สิทธิ์การคูณคะแนนจะตกมาที่รองกัปตันทันที"
              checked={rules.viceCaptainSystem?.isActive}
              onChange={(val) => updateRule('viceCaptainSystem', 'isActive', val)}
            />
          </div>

          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors mt-4">
            <ToggleSwitch
              label="ระบบทบยอดงบประมาณ (Budget Carry-over)"
              description="นำงบที่เหลือสัปดาห์นี้ ยกยอดไปใช้สัปดาห์หน้า"
              info="เมื่อจบ Gameweek งบจัดทีมที่ผู้เล่นเหลือทิ้งไว้จะถูกนำมาคำนวณตาม % เพื่อยกยอดเป็นงบโบนัสให้ในสัปดาห์ถัดไป"
              checked={rules.budgetCarryOver?.isActive}
              onChange={(val) => updateRule('budgetCarryOver', 'isActive', val)}
            />
            {rules.budgetCarryOver?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">% ยกยอด:</label>
                <input
                  type="number"
                  value={rules.budgetCarryOver?.percent || 0}
                  onChange={(e) => updateRule('budgetCarryOver', 'percent', parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors mt-4">
            <ToggleSwitch
              label="ระบบเคมีทีม (Synergy Bonus)"
              description="โบนัส % หากมีผู้เล่นทีม/ชาติเดียวกันครบตามกำหนด"
              info="หากผู้เล่นจัด 11 ตัวจริงที่มีนักเตะจากสโมสรเดียวกันครบตามโควต้า ระบบจะบวกเปอร์เซ็นต์โบนัสพิเศษให้กับคะแนนรวมสุทธิในสัปดาห์นั้น"
              checked={rules.synergyBonus?.isActive}
              onChange={(val) => updateRule('synergyBonus', 'isActive', val)}
            />
            {rules.synergyBonus?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">โบนัส %:</label>
                <input
                  type="number"
                  value={rules.synergyBonus?.bonusPercent || 0}
                  onChange={(e) => updateRule('synergyBonus', 'bonusPercent', parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors mt-4">
            <ToggleSwitch
              label="ระบบสะสมการเล่น (Play Streaks)"
              description="แจกโบนัสหากผู้เล่นส่งทีมต่อเนื่อง"
              info="ผู้เล่นที่เข้ามากดยืนยันทีมครบทุกสัปดาห์ต่อเนื่องตามกำหนด (เช่น 3 สัปดาห์ติด) จะได้รับรางวัลพิเศษ"
              checked={rules.playStreaks?.isActive}
              onChange={(val) => updateRule('playStreaks', 'isActive', val)}
            />
            {rules.playStreaks?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">สัปดาห์ต่อเนื่อง:</label>
                <input
                  type="number"
                  value={rules.playStreaks?.streakTarget || 0}
                  onChange={(e) => updateRule('playStreaks', 'streakTarget', parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-blue-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          <div className="flex justify-center md:justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกกติกา'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
