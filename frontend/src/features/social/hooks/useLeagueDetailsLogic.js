import { useState, useEffect } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { leagueService } from '../../../services/firebase/leagueService';
import { showToast } from '../../../utils/toast';

export const useLeagueDetailsLogic = (league, onClose, onLeagueUpdated) => {
  const { userData } = useUserStore();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(league?.name || '');
  const [actionLoading, setActionLoading] = useState(false);

  const isCreator = userData?.uid === league?.creatorId;

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const data = await leagueService.getLeagueMembersData(league.members || []);
      const rankedData = data.map((m, index) => ({ ...m, rank: index + 1 }));
      setMembers(rankedData);
      setLoading(false);
    };
    if (league && league.members) {
      fetchMembers();
    }
  }, [league]);

  const handleCopyCode = () => {
    if (!league?.code) return;
    navigator.clipboard.writeText(league.code).then(() => {
      setCopied(true);
      if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveName = async () => {
    if (!editName.trim() || editName === league.name) {
      setIsEditing(false);
      return;
    }
    setActionLoading(true);
    const result = await leagueService.updateLeagueName(league.id, editName);
    if (result.success) {
      showToast('success', 'เปลี่ยนชื่อลีกสำเร็จ');
      setIsEditing(false);
      if (onLeagueUpdated) onLeagueUpdated();
    } else {
      showToast('error', result.message);
    }
    setActionLoading(false);
  };

  const handleLeave = async () => {
    if (!window.confirm('คุณต้องการออกจากลีกนี้ใช่หรือไม่?')) return;
    setActionLoading(true);
    const result = await leagueService.leaveLeague(league.id, userData.uid);
    if (result.success) {
      showToast('success', 'ออกจากลีกสำเร็จ');
      if (onLeagueUpdated) onLeagueUpdated();
      if (onClose) onClose();
    } else {
      showToast('error', result.message);
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('คุณต้องการ "ลบลีก" นี้ทิ้งถาวรใช่หรือไม่?\\n(ข้อมูลทั้งหมดจะถูกลบ ไม่สามารถกู้คืนได้)')) return;
    setActionLoading(true);
    const result = await leagueService.deleteLeague(league.id);
    if (result.success) {
      showToast('success', 'ลบลีกสำเร็จ');
      if (onLeagueUpdated) onLeagueUpdated();
      if (onClose) onClose();
    } else {
      showToast('error', result.message);
      setActionLoading(false);
    }
  };

  return {
    userData,
    members,
    loading,
    showSettings,
    setShowSettings,
    copied,
    isEditing,
    setIsEditing,
    editName,
    setEditName,
    actionLoading,
    isCreator,
    handleCopyCode,
    handleSaveName,
    handleLeave,
    handleDelete
  };
};
