import { useState, useMemo, useEffect } from 'react';
import { useUserStore } from '../../../store/useUserStore';
import { useMarketStore } from '../../../store/useMarketStore';
import { toast } from '../../../utils/toast';

export const usePitchLogic = () => {
  const { 
    mySquad, 
    formation, 
    setFormation,
    budgetLeft,
    manager,
    getEffectiveBudget,
    autoFillTeam,
    saveSquadToCloud,
    userData,
    pendingPlacement,
    cancelPlacement,
    confirmPlacement,
    assignPlayerToSlot,
    swapPlayer,
    captainId,
    setCaptain,
    sellPlayer,
    fetchCards,
    isCardsFetched,
    availableCards
  } = useUserStore();

  const { players: marketPlayers, fetchMarketPlayers, isDataFetched } = useMarketStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [popupPlayer, setPopupPlayer] = useState(null);
  const [powerCardPlayer, setPowerCardPlayer] = useState(null);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    if (!isDataFetched) {
      fetchMarketPlayers();
    }
    if (!isCardsFetched) {
      fetchCards();
    }
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [isDataFetched, fetchMarketPlayers, isCardsFetched, fetchCards]);

  const { enrichedStarters, enrichedBench } = useMemo(() => {
    const enriched = mySquad.map(squadPlayer => {
      const fullData = marketPlayers.find(p => String(p.sku) === String(squadPlayer.playerId));
      const appliedCard = availableCards.find(c => c.id === squadPlayer.appliedCardId);
      return {
        id: String(squadPlayer.slotIndex), 
        playerId: squadPlayer.playerId,
        name: fullData?.name || fullData?.fullName || 'Unknown',
        team: fullData?.team || 'UNK',
        position: squadPlayer.position,
        price: fullData?.price || 0,
        totalPoints: fullData?.totalPoints || 0,
        role: captainId === squadPlayer.playerId ? 'C' : null,
        isStarting: squadPlayer.isStarting,
        appliedCardId: squadPlayer.appliedCardId,
        appliedCardIcon: appliedCard?.icon || null,
        appliedCard: appliedCard || null,
        fullData: fullData 
      };
    });
    return {
      enrichedStarters: enriched.filter(p => p.isStarting),
      enrichedBench: enriched.filter(p => !p.isStarting)
    };
  }, [mySquad, marketPlayers, captainId, availableCards]);

  const handleClearPitch = () => {
    useUserStore.getState().clearSquad(marketPlayers);
    toast.success("รีเซ็ตทีมและคืนเงินทั้งหมดแล้ว!");
  };

  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    toast.info("🧠 AI กำลังวิเคราะห์ฟอร์มนักเตะเพื่อจัดทีมที่ดีที่สุด...", { duration: 1500 });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = autoFillTeam(marketPlayers);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setIsAutoFilling(false);
  };

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

  const handlePlayerClick = (player) => {
    if (pendingPlacement) {
      toast.error("กรุณาวางนักเตะที่เลือกไว้ลงในตำแหน่งที่ว่าง หรือกดยกเลิก");
      return;
    }
    
    if (selectedPlayer) {
      if (selectedPlayer.playerId === player.playerId) {
        setSelectedPlayer(null); 
      } else {
        const p1 = enrichedStarters.find(p => p.playerId === selectedPlayer.playerId) || enrichedBench.find(p => p.playerId === selectedPlayer.playerId);
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
      if (result.success) toast.success("นำนักเตะพักที่ม้านั่งสำรองสำเร็จ!");
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

  const handlePopupAction = (action) => {
    if (!popupPlayer) return;
    
    switch (action) {
      case 'CAPTAIN':
        setCaptain(popupPlayer.playerId);
        toast.success(`ตั้ง ${popupPlayer.name} เป็นกัปตันทีมแล้ว!`);
        setPopupPlayer(null);
        break;
      case 'SWAP':
        setSelectedPlayer({ playerId: popupPlayer.playerId });
        setPopupPlayer(null);
        toast.info(`เลือก ${popupPlayer.name} แล้ว กดที่นักเตะคนอื่นหรือตำแหน่งว่างเพื่อสลับ`);
        break;
      case 'SUBSTITUTE':
        useUserStore.getState().setPendingTargetSlot(popupPlayer.id);
        useUserStore.getState().setMarketFilterPos(popupPlayer.position);
        window.dispatchEvent(new CustomEvent('switchTab', { detail: 'market' }));
        toast.info(`กำลังพาไปยังตลาดเพื่อหาตัวแทนตำแหน่ง ${popupPlayer.position}...`);
        setPopupPlayer(null);
        break;
      case 'REMOVE':
        if (captainId === popupPlayer.playerId) setCaptain(null);
        sellPlayer(popupPlayer.fullData);
        setPopupPlayer(null);
        toast.success(`ลบ ${popupPlayer.name} ออกจากทีมและคืนงบประมาณแล้ว`);
        break;
      case 'POWER_CARD':
        setPowerCardPlayer(popupPlayer);
        setPopupPlayer(null);
        break;
      default:
        break;
    }
  };

  return {
    isLoading,
    isAutoFilling,
    enrichedStarters,
    enrichedBench,
    formation,
    budgetLeft,
    manager,
    userData,
    getEffectiveBudget,
    saveSquadToCloud,
    mySquad,
    pendingPlacement,
    cancelPlacement,
    selectedPlayer,
    setSelectedPlayer,
    popupPlayer,
    setPopupPlayer,
    powerCardPlayer,
    setPowerCardPlayer,
    actions: {
      handleAutoPick: handleAutoFill,
      handleReset: handleClearPitch,
      changeFormation: setFormation,
      handlePopupAction
    },
    handlers: {
      handleSlotClick,
      handlePlayerClick,
      handleBenchSlotClick
    }
  };
};
