import { useUserStore } from '../../../store/useUserStore';
import { useMarketStore } from '../../../store/useMarketStore';
import { validateSellPlayer } from '../../../utils/squadValidator';
import { toast } from '../../../utils/toast';
import { formatPlayerName } from '../../../utils/formatters';
import { playSound } from '../../../config/theme';

export const useMarketActions = (setBottomSheetConfig, setModalConfig, modalConfig) => {
  const { startPlacement, sellPlayer, mySquad } = useUserStore();
  const { players } = useMarketStore();

  const handleBuyPlayer = (player) => {
    playSound('click');

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }

    const result = startPlacement(player);

    if (result.success) {
      toast.success(result.message);
      setBottomSheetConfig({ isOpen: false, player: null });

      window.dispatchEvent(new CustomEvent('switchTab', { detail: 'pitch' }));
    } else {
      toast.error(result.message);
    }
  };

  const handleConfirmSell = (player) => {
    const currentSquadObjects = mySquad
      .map((sq) => players.find((p) => String(p.sku) === String(sq.playerId)))
      .filter(Boolean);

    if (modalConfig?.actionType === 'sell') {
      const validation = validateSellPlayer(player, currentSquadObjects);
      if (validation.isValid) {
        sellPlayer(player);
        toast.success(`ขาย ${formatPlayerName(player.name)} ออกจากทีมเรียบร้อย`);
      } else {
        toast.error(validation.message);
      }
    }

    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    handleBuyPlayer,
    handleConfirmSell,
  };
};
