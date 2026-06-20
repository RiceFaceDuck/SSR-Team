import { useState } from 'react';
import { leagueService } from '../../../services/firebase/leagueService';
import { showToast } from '../../../utils/toast';

export const useLeagueForm = (userData, onLeagueAdded) => {
  const [modalType, setModalType] = useState(null); // 'create' or 'join'
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState('classic'); // 'classic' or 'duel'
  const [customRules, setCustomRules] = useState({ captainMultiplier: 2, goal: 800, assist: 600 });
  const [loading, setLoading] = useState(false);

  const openModal = (type) => {
    setModalType(type);
    setInputValue('');
    setMode('classic');
  };

  const closeModal = () => {
    setModalType(null);
    setInputValue('');
  };

  const handleAction = async () => {
    if (!userData || !userData.uid) {
      showToast('error', 'กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    setLoading(true);
    let result;
    
    try {
      if (modalType === 'create') {
        result = await leagueService.createLeague(userData, inputValue, { mode, customRules });
        if (result.success) {
          showToast('success', `สร้างลีกสำเร็จ! รหัสเข้าร่วมคือ ${result.code}`);
        }
      } else if (modalType === 'join') {
        result = await leagueService.joinLeague(userData, inputValue);
        if (result.success) {
          showToast('success', `เข้าร่วมลีก ${result.leagueName} สำเร็จ!`);
        }
      }

      if (result && result.success) {
        closeModal();
        if (onLeagueAdded) onLeagueAdded();
      } else if (result) {
        showToast('error', result.message);
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'เกิดข้อผิดพลาดในการดำเนินการ');
    } finally {
      setLoading(false);
    }
  };

  return {
    modalType,
    inputValue,
    setInputValue,
    loading,
    mode,
    setMode,
    customRules,
    setCustomRules,
    openModal,
    closeModal,
    handleAction
  };
};
