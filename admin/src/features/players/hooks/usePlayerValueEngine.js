import { useState, useEffect } from 'react';
import {
  previewPlayerValues,
  commitPlayerValues,
} from '../../../services/engine/playerValueCalculationService';
import { getGameRules } from '../../../services/firebase/gameRulesDatabase';

const DEFAULT_CONFIG = {
  basePrice: 5.0,
  statMultiplier: 10,
  formMultiplier: 20,
  posModifiers: { FW: 1.2, MF: 1.1, DF: 0.9, GK: 0.8 },
};

/**
 * Custom Hook สำหรับจัดการ Logic การคำนวณมูลค่านักเตะทั้งหมด
 * นำออกจาก PlayerValueManager เพื่อลดความซับซ้อนของ UI (SRP)
 */
export const usePlayerValueEngine = (onClose) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [budgetConfig, setBudgetConfig] = useState(200);

  const [previews, setPreviews] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    // 1. Load saved config from localStorage
    const savedConfig = localStorage.getItem('playerValueConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to parse saved config', e);
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
        console.error('Error fetching budget', err);
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

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../../config/firebase');
      const previewFn = httpsCallable(functions, 'previewPlayerValues');
      const res = await previewFn({ config });
      setPreviews(res.data.previews);
      setHasCalculated(true);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการคำนวณ: ' + error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (!previews || previews.length === 0) return;

    const confirmSave = window.confirm(
      `คุณต้องการบันทึกราคาใหม่สำหรับนักเตะจำนวน ${previews.length} คน ใช่หรือไม่?\nการกระทำนี้จะส่งผลต่อตลาดซื้อขายทันที`
    );
    if (!confirmSave) return;

    setIsSaving(true);
    try {
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../../config/firebase');
      const commitFn = httpsCallable(functions, 'commitPlayerValues');
      const res = await commitFn({ previews });
      const result = res.data.result;

      setIsSaving(false);

      if (result.success) {
        alert(`บันทึกราคาใหม่สำเร็จ ${result.updatedCount} คน (ผ่าน ${result.batches} Batches)`);
        if (onClose) onClose();
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึก: ' + result.error?.message);
      }
    } catch (err) {
      setIsSaving(false);
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    }
  };

  return {
    config,
    setConfig,
    budgetConfig,
    previews,
    isCalculating,
    isSaving,
    hasCalculated,
    handleResetDefault,
    handleCalculate,
    handleSave,
    DEFAULT_CONFIG,
  };
};
