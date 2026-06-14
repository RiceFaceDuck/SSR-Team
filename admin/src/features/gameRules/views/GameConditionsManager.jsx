import React, { useState, useEffect } from 'react';
import { Sliders, Save, AlertCircle } from 'lucide-react';
import ToggleSwitch from '../components/ToggleSwitch';
import { getGameConditions, updateGameConditions } from '../../../services/firebase/gameRulesDatabase';

export default function GameConditionsManager({ isEmbedded = false }) {
  const [conditions, setConditions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const availableFormations = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];

  const defaultConditions = {
    cardLimitPerGW: { value: 1, isActive: true },
    deadlineOffsetMinutes: { value: 90, isActive: true },
    allowedFormations: {
      isActive: true,
      formations: {
        '3-4-3': true,
        '3-5-2': true,
        '4-3-3': true,
        '4-4-2': true,
        '4-5-1': true,
        '5-3-2': true,
        '5-4-1': true
      }
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      const data = await getGameConditions();
      if (data) {
        setConditions({ ...defaultConditions, ...data });
      } else {
        setConditions(defaultConditions);
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
      await updateGameConditions(conditions);
      alert('บันทึกเงื่อนไขการเล่นเรียบร้อยแล้ว');
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateCondition = (key, field, value) => {
    setConditions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const toggleFormation = (formation) => {
    setConditions(prev => ({
      ...prev,
      allowedFormations: {
        ...prev.allowedFormations,
        formations: {
          ...prev.allowedFormations.formations,
          [formation]: !prev.allowedFormations.formations[formation]
        }
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
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
              <Sliders size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">เงื่อนไขการเล่นเกม</h1>
              <p className="text-slate-500 font-medium">จัดการขอบเขตการเล่นและข้อจำกัดต่างๆ ภายในเกม</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
          >
            <Save size={20} />
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกเงื่อนไข'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {conditions && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3">สภาพแวดล้อม (Environment)</h2>
          
          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors">
            <ToggleSwitch
              label="กำหนดระยะเวลาปิดตลาดล่วงหน้า"
              description="ล็อกตลาดซื้อขายก่อนการแข่งขันคู่แรกของ Gameweek เริ่ม"
              checked={conditions.deadlineOffsetMinutes?.isActive}
              onChange={(val) => updateCondition('deadlineOffsetMinutes', 'isActive', val)}
            />
            {conditions.deadlineOffsetMinutes?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">นาที (Minutes):</label>
                <input
                  type="number"
                  value={conditions.deadlineOffsetMinutes?.value || 0}
                  onChange={(e) => updateCondition('deadlineOffsetMinutes', 'value', parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-emerald-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-100 transition-colors">
            <ToggleSwitch
              label="จำกัดการใช้การ์ดพลังต่อสัปดาห์"
              description="จำนวน Power Card ที่ผู้เล่นกดใช้ได้สูงสุดต่อ 1 GW"
              checked={conditions.cardLimitPerGW?.isActive}
              onChange={(val) => updateCondition('cardLimitPerGW', 'isActive', val)}
            />
            {conditions.cardLimitPerGW?.isActive && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shrink-0">
                <label className="text-sm font-bold text-slate-700">จำนวนครั้ง/GW:</label>
                <input
                  type="number"
                  value={conditions.cardLimitPerGW?.value || 0}
                  onChange={(e) => updateCondition('cardLimitPerGW', 'value', parseInt(e.target.value) || 0)}
                  className="w-24 border border-slate-300 rounded-lg px-3 py-1.5 focus:border-emerald-500 outline-none text-center"
                />
              </div>
            )}
          </div>

          {/* Formations */}
          <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200 transition-colors">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-slate-800">แผนการเล่นที่อนุญาต (Available Formations)</h3>
                <p className="text-sm text-slate-500 mt-1">เปิด/ปิด แผนการเล่นที่ให้ผู้เล่นจัดได้</p>
              </div>
              <ToggleSwitch
                label=""
                checked={conditions.allowedFormations?.isActive}
                onChange={(val) => updateCondition('allowedFormations', 'isActive', val)}
              />
            </div>

            {conditions.allowedFormations?.isActive && (
              <div className="flex flex-wrap gap-3 mt-4">
                {availableFormations.map(formation => {
                  const isEnabled = conditions.allowedFormations.formations?.[formation];
                  return (
                    <button
                      key={formation}
                      onClick={() => toggleFormation(formation)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                        isEnabled 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {formation}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-center md:justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <Save size={20} />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกเงื่อนไข'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
