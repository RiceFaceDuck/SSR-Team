import React from 'react';
import { ScrollText, Save, AlertCircle } from 'lucide-react';
import RuleSettingItem from '../components/RuleSettingItem';
import { useGameRulesManager } from '../hooks/useGameRulesManager';

export default function GameRulesManager({ isEmbedded = false }) {
  const { rules, isLoading, isSaving, error, handleSave, updateRule } = useGameRulesManager();

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
              <p className="text-slate-500 font-medium">
                ตั้งค่ากติกาพื้นฐานสำหรับการจัดทีมและการเล่น
              </p>
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
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3">
            กติกาการจัดทีม (Team Building Rules)
          </h2>

          <RuleSettingItem
            label="งบประมาณเริ่มต้น (Starting Budget)"
            description="เปิด/ปิด การจำกัดงบในการสร้างทีม"
            info="งบตั้งต้นที่ผู้เล่นทุกคนจะได้รับตอนเริ่มฤดูกาลเพื่อนำไปจัดทีม"
            isActive={rules.startingBudget?.isActive}
            onToggle={(val) => updateRule('startingBudget', 'isActive', val)}
            hasInput={true}
            inputLabel="จำนวนงบ (M)"
            inputValue={rules.startingBudget?.value}
            onInputChange={(val) => updateRule('startingBudget', 'value', val)}
          />

          <RuleSettingItem
            label="จำกัดโควต้านักเตะสโมสรเดียวกัน"
            description="เปิด/ปิด การจำกัดจำนวนนักเตะจากสโมสรเดียวกัน"
            info="หากผู้เล่นเลือกนักเตะจากสโมสรเดียวกันเกินกำหนด ระบบจะไม่ให้เซฟทีม"
            isActive={rules.maxPlayersPerTeam?.isActive}
            onToggle={(val) => updateRule('maxPlayersPerTeam', 'isActive', val)}
            hasInput={true}
            inputLabel="สูงสุด/สโมสร"
            inputValue={rules.maxPlayersPerTeam?.value}
            onInputChange={(val) => updateRule('maxPlayersPerTeam', 'value', val)}
          />

          <RuleSettingItem
            label="ระบบโควต้าเปลี่ยนตัวฟรี (Free Transfers)"
            description="ให้สิทธิ์ผู้จัดการทีมเปลี่ยนตัวนักเตะฟรีรายสัปดาห์"
            info="ทุก 1 ตัวที่ผู้เล่นเปลี่ยนเกินโควต้าฟรี จะถูกหักคะแนนลบออกจากคะแนนรวมประจำสัปดาห์ (เช่น -4 แต้ม)"
            isActive={rules.freeTransfers?.isActive}
            onToggle={(val) => updateRule('freeTransfers', 'isActive', val)}
            hasInput={true}
            inputLabel="ฟรี (ต่อ GW)"
            inputValue={rules.freeTransfers?.value}
            onInputChange={(val) => updateRule('freeTransfers', 'value', val)}
          />

          <RuleSettingItem
            label="ระบบกัปตันทีม (Captain Multiplier)"
            description="ตัวคูณพิเศษสำหรับกัปตันทีม"
            info="คะแนนที่กัปตันทีมทำได้ในสัปดาห์นั้นๆ จะถูกคูณด้วยตัวเลขนี้เสมอ"
            isActive={rules.captainMultiplier?.isActive}
            onToggle={(val) => updateRule('captainMultiplier', 'isActive', val)}
            hasInput={true}
            inputLabel="ตัวคูณคะแนน"
            inputValue={rules.captainMultiplier?.value}
            onInputChange={(val) => updateRule('captainMultiplier', 'value', val)}
            inputStep="0.5"
          />

          {/* New Features Toggle */}
          <RuleSettingItem
            label="ระบบรองกัปตันทีม (Vice-Captain)"
            description="สำรองคูณคะแนนกรณีกัปตันตัวจริงไม่ได้ลงสนาม"
            info="หากกัปตันตัวจริงไม่ได้ลงสนามเลยแม้แต่นาทีเดียว สิทธิ์การคูณคะแนนจะตกมาที่รองกัปตันทันที"
            isActive={rules.viceCaptainSystem?.isActive}
            onToggle={(val) => updateRule('viceCaptainSystem', 'isActive', val)}
          />

          <RuleSettingItem
            label="ระบบทบยอดงบประมาณ (Budget Carry-over)"
            description="นำงบที่เหลือสัปดาห์นี้ ยกยอดไปใช้สัปดาห์หน้า"
            info="เมื่อจบ Gameweek งบจัดทีมที่ผู้เล่นเหลือทิ้งไว้จะถูกนำมาคำนวณตาม % เพื่อยกยอดเป็นงบโบนัสให้ในสัปดาห์ถัดไป"
            isActive={rules.budgetCarryOver?.isActive}
            onToggle={(val) => updateRule('budgetCarryOver', 'isActive', val)}
            hasInput={true}
            inputLabel="% ยกยอด"
            inputValue={rules.budgetCarryOver?.percent}
            onInputChange={(val) => updateRule('budgetCarryOver', 'percent', val)}
          />

          <RuleSettingItem
            label="ระบบเคมีทีม (Synergy Bonus)"
            description="โบนัส % หากมีผู้เล่นทีม/ชาติเดียวกันครบตามกำหนด"
            info="หากผู้เล่นจัด 11 ตัวจริงที่มีนักเตะจากสโมสรเดียวกันครบตามโควต้า ระบบจะบวกเปอร์เซ็นต์โบนัสพิเศษให้กับคะแนนรวมสุทธิในสัปดาห์นั้น"
            isActive={rules.synergyBonus?.isActive}
            onToggle={(val) => updateRule('synergyBonus', 'isActive', val)}
            hasInput={true}
            inputLabel="โบนัส %"
            inputValue={rules.synergyBonus?.bonusPercent}
            onInputChange={(val) => updateRule('synergyBonus', 'bonusPercent', val)}
          />

          <RuleSettingItem
            label="ระบบสะสมการเล่น (Play Streaks)"
            description="แจกโบนัสหากผู้เล่นส่งทีมต่อเนื่อง"
            info="ผู้เล่นที่เข้ามากดยืนยันทีมครบทุกสัปดาห์ต่อเนื่องตามกำหนด (เช่น 3 สัปดาห์ติด) จะได้รับรางวัลพิเศษ"
            isActive={rules.playStreaks?.isActive}
            onToggle={(val) => updateRule('playStreaks', 'isActive', val)}
            hasInput={true}
            inputLabel="สัปดาห์ต่อเนื่อง"
            inputValue={rules.playStreaks?.streakTarget}
            onInputChange={(val) => updateRule('playStreaks', 'streakTarget', val)}
          />

          <RuleSettingItem
            label="กฎวัดผลคะแนนเท่ากัน (Tie-breaker งบประมาณ)"
            description="หากคะแนน Pts เท่ากัน ให้ดูว่าใครใช้งบประมาณน้อยกว่า"
            info="หากเปิดใช้งาน เมื่อคะแนนเท่ากัน คนที่ใช้งบประมาณจัดทีมน้อยกว่าจะชนะ หากงบยังเท่ากันอีก จึงจะดูเวลาที่เซฟทีมล่าสุด"
            isActive={rules.budgetTieBreaker?.isActive}
            onToggle={(val) => updateRule('budgetTieBreaker', 'isActive', val)}
          />

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
