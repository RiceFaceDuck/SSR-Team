import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { gameweekCalculationService } from '../../../services/engine/gameweekCalculationService';
import { leaderboardEngine } from '../../../services/engine/leaderboardEngine';
import { apiFootballService } from '../../../services/api/apiFootballService';

export const useDashboardData = () => {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gwHistory, setGwHistory] = useState([]);
  const [apiGameweeks, setApiGameweeks] = useState([]);
  const [isLoadingApiGw, setIsLoadingApiGw] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);

  useEffect(() => {
    fetchConfig();
    fetchHistory();
    loadApiGameweeks();
  }, []);

  const loadApiGameweeks = async () => {
    try {
      setIsLoadingApiGw(true);
      const rounds = await apiFootballService.fetchAvailableGameweeks();
      const formattedRounds = rounds.map(r => {
        const match = r.match(/\d+/);
        const num = match ? match[0] : '';
        return num ? `GW${num}` : r;
      });
      const uniqueRounds = [...new Set(formattedRounds)];
      uniqueRounds.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
      setApiGameweeks(uniqueRounds);
    } catch (err) {
      console.error('Error fetching API gameweeks:', err);
      setIsAutoMode(false);
    } finally {
      setIsLoadingApiGw(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const historyRef = collection(db, 'public_data', 'gameweeks', 'weeks');
      const q = query(historyRef);
      const snap = await getDocs(q);
      const historyData = [];
      snap.forEach(doc => {
        historyData.push({ id: doc.id, ...doc.data() });
      });
      historyData.sort((a, b) => b.id.localeCompare(a.id));
      setGwHistory(historyData);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'public_data', 'system_config');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      }
    } catch (err) {
      console.error('Error fetching system_config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSystemState = async (field, value) => {
    if (!config) return;
    setIsUpdating(true);
    try {
      const docRef = doc(db, 'public_data', 'system_config');
      await updateDoc(docRef, { [field]: value });
      setConfig(prev => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error('Error updating state:', err);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProcessGameweek = async (processGwId) => {
    if (!processGwId) return alert('กรุณาระบุ Gameweek ที่ต้องการบันทึก');
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าจะประมวลผลคะแนนและบันทึกผลของ ${processGwId}? (การกระทำนี้จะเปลี่ยนอันดับผู้เล่น)`)) return;
    
    try {
      setIsProcessing(true);
      const { httpsCallable } = require('firebase/functions');
      const { functions } = require('../../../config/firebase');
      const processGameweekFn = httpsCallable(functions, 'processGameweek');
      await processGameweekFn({ gameweekId: processGwId });
      alert(`บันทึกผลการแข่งขัน ${processGwId} สำเร็จ!`);
      fetchHistory(); 
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาดในการคำนวณและบันทึก กรุณาดู Console');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    config,
    setConfig,
    isLoading,
    isUpdating,
    isProcessing,
    gwHistory,
    apiGameweeks,
    isLoadingApiGw,
    isAutoMode,
    setIsAutoMode,
    updateSystemState,
    handleProcessGameweek
  };
};
