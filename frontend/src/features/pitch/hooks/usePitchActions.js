import { toast } from '../../../utils/toast';
import { useUserStore } from '../../../store/useUserStore';

export const usePitchActions = () => {
  const handleClearPitch = (marketPlayers) => {
    useUserStore.getState().clearSquad(marketPlayers);
    toast.success("รีเซ็ตทีมและคืนเงินทั้งหมดแล้ว!");
  };

  const handleAutoFill = async (marketPlayers, setIsAutoFilling) => {
    setIsAutoFilling(true);
    toast.info("🧠 AI กำลังวิเคราะห์ฟอร์มนักเตะเพื่อจัดทีมที่ดีที่สุด...", { duration: 1500 });
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = useUserStore.getState().autoFillTeam(marketPlayers);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    setIsAutoFilling(false);
  };

  return {
    handleClearPitch,
    handleAutoFill
  };
};
