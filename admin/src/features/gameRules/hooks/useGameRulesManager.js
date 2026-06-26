import { useState, useEffect } from 'react';
import { getGameRules, updateGameRules } from '../../../services/firebase/gameRulesDatabase';

const defaultRules = {
  startingBudget: { value: 100, isActive: true },
  maxPlayersPerTeam: { value: 3, isActive: true },
  freeTransfers: { value: 1, isActive: true },
  captainMultiplier: { value: 2, isActive: true },
  viceCaptainSystem: { isActive: true },
  budgetCarryOver: { percent: 50, isActive: true },
  synergyBonus: { sameTeamThreshold: 3, sameNationThreshold: 4, bonusPercent: 5, isActive: true },
  playStreaks: { streakTarget: 3, rewardType: 'budget', rewardValue: 5, isActive: true },
};

export const useGameRulesManager = () => {
  const [rules, setRules] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

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
    setRules((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  return {
    rules,
    isLoading,
    isSaving,
    error,
    handleSave,
    updateRule,
  };
};
