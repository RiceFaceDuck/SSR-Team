import { toast } from '../../../utils/toast';
import { useUserStore } from '../../../store/useUserStore';
import { normalizePosition } from '../../../utils/squadValidator';
import { formatPlayerName } from '../../../utils/formatters';

export const usePitchHandlers = ({
  enrichedStarters,
  enrichedBench,
  pendingPlacement,
  selectedPlayer,
  setSelectedPlayer,
  setPopupPlayer,
  setPowerCardPlayer,
}) => {
  const {
    confirmPlacement,
    assignPlayerToSlot,
    swapPlayer,
    setCaptain,
    setViceCaptain,
    sellPlayer,
    resetSquad,
  } = useUserStore.getState();
  const captainId = useUserStore.getState().captainId;
  const viceCaptainId = useUserStore.getState().viceCaptainId;

  const handleSlotClick = (slotId, category) => {
    if (pendingPlacement) {
      const result = confirmPlacement(slotId);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
      setSelectedPlayer(null);
    } else if (selectedPlayer) {
      assignPlayerToSlot(selectedPlayer.playerId, slotId);
      setSelectedPlayer(null);
    } else {
      useUserStore.getState().setPendingTargetSlot(slotId);
      useUserStore.getState().setMarketFilterPos(category);
      window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
      const posNames = { FW: 'กองหน้า', MF: 'กองกลาง', DF: 'กองหลัง', GK: 'ผู้รักษาประตู' };
      toast.info(`กำลังพาไปยังตลาดเพื่อหา ${posNames[category] || category}...`);
    }
  };

  const handleReset = () => {
    resetSquad();
    console.log('Squad reset successfully!');
  };

  const handlePlayerClick = (player) => {
    if (pendingPlacement) {
      const pendingPos = normalizePosition(pendingPlacement.position);
      const clickedPos = normalizePosition(player.position);

      if (pendingPos === clickedPos) {
        const result = confirmPlacement(player.id);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
        setSelectedPlayer(null);
      } else {
        toast.error(`ไม่สามารถวางนักเตะตำแหน่ง ${pendingPos} แทนที่ตำแหน่ง ${clickedPos} ได้`);
      }
      return;
    }

    if (selectedPlayer) {
      if (selectedPlayer.playerId === player.playerId) {
        setSelectedPlayer(null);
      } else {
        const p1 =
          enrichedStarters.find((p) => p.playerId === selectedPlayer.playerId) ||
          enrichedBench.find((p) => p.playerId === selectedPlayer.playerId);
        if (p1 && p1.position !== player.position) {
          toast.error(`ไม่สามารถสลับข้ามตำแหน่งได้ (${p1.position} ไปยัง ${player.position})`);
          setSelectedPlayer(null);
          return;
        }
        swapPlayer(selectedPlayer.playerId, player.playerId);
        setSelectedPlayer(null);
      }
    } else {
      setPopupPlayer(player);
    }
  };

  const handleBenchSlotClick = (category) => {
    if (pendingPlacement) {
      const result = confirmPlacement('bench');
      if (result.success) toast.success('นำนักเตะพักที่ม้านั่งสำรองสำเร็จ!');
      else toast.error(result.message);
      setSelectedPlayer(null);
    } else if (selectedPlayer) {
      useUserStore.getState().removePlayerFromPitch(selectedPlayer.playerId);
      setSelectedPlayer(null);
    } else {
      useUserStore.getState().setPendingTargetSlot('bench');
      useUserStore.getState().setMarketFilterPos(category);
      window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
      const posNames = { FW: 'กองหน้า', MF: 'กองกลาง', DF: 'กองหลัง', GK: 'ผู้รักษาประตู' };
      toast.info(`กำลังพาไปยังตลาดเพื่อหา ${posNames[category] || category} สำรอง...`);
    }
  };

  const handlePopupAction = (action, popupPlayer) => {
    if (!popupPlayer) return;

    switch (action) {
      case 'CAPTAIN':
        setCaptain(popupPlayer.playerId);
        toast.success(`ตั้ง ${formatPlayerName(popupPlayer.name)} เป็นกัปตันทีมแล้ว!`);
        setPopupPlayer(null);
        break;
      case 'VICE_CAPTAIN':
        setViceCaptain(popupPlayer.playerId);
        toast.success(`ตั้ง ${formatPlayerName(popupPlayer.name)} เป็นรองกัปตันทีมแล้ว!`);
        setPopupPlayer(null);
        break;
      case 'SWAP':
        setSelectedPlayer({ playerId: popupPlayer.playerId });
        setPopupPlayer(null);
        toast.info(
          `เลือก ${formatPlayerName(popupPlayer.name)} แล้ว กดที่นักเตะคนอื่นหรือตำแหน่งว่างเพื่อสลับ`
        );
        break;
      case 'SUBSTITUTE':
        if (!popupPlayer.isStarting) {
          sellPlayer(popupPlayer.fullData);
          useUserStore.getState().setPendingTargetSlot('bench');
        } else {
          useUserStore.getState().setPendingTargetSlot(popupPlayer.id);
        }
        useUserStore.getState().setMarketFilterPos(popupPlayer.position);
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
        toast.info(`กำลังพาไปยังตลาดเพื่อหาตัวแทนตำแหน่ง ${popupPlayer.position}...`);
        setPopupPlayer(null);
        break;
      case 'REMOVE':
        if (captainId === popupPlayer.playerId) setCaptain(null);
        if (viceCaptainId === popupPlayer.playerId) setViceCaptain(null);
        sellPlayer(popupPlayer.fullData);
        setPopupPlayer(null);
        toast.success(`ลบ ${formatPlayerName(popupPlayer.name)} ออกจากทีมและคืนงบประมาณแล้ว`);
        break;
      case 'POWER_CARD':
        setPowerCardPlayer(popupPlayer);
        setPopupPlayer(null);
        break;
      case 'TOGGLE_LOCK':
        useUserStore.getState().togglePlayerLock(popupPlayer.playerId);
        toast.success(
          popupPlayer.isLocked
            ? `ปลดล็อค ${formatPlayerName(popupPlayer.name)} แล้ว`
            : `ล็อค ${formatPlayerName(popupPlayer.name)} แล้ว จะไม่ถูกลบเมื่อสุ่มใหม่`
        );
        setPopupPlayer(null);
        break;
      default:
        break;
    }
  };

  return {
    handleSlotClick,
    handlePlayerClick,
    handleBenchSlotClick,
    handlePopupAction,
  };
};
