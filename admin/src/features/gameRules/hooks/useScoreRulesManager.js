import { useState, useEffect } from 'react';
import { getScoringRules, updateScoringRules } from '../../../services/firebase/gameRulesDatabase';

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

export const useScoreRulesManager = () => {
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const data = await getScoringRules();
      if (data) {
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

  return {
    rules,
    isLoading,
    isSaving,
    error,
    handleSave,
    updateRule
  };
};
