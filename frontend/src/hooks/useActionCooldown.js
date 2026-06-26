import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';

/**
 * Custom Hook สำหรับจัดการระบบ Cooldown และโฆษณาบนปุ่มกด (SRP)
 * @param {Object} initialCooldowns ค่าเริ่มต้นของปุ่มต่างๆ
 */
export const useActionCooldown = (initialCooldowns = { autoPick: 0, reset: 0, saveTeam: 0 }) => {
  const [cooldowns, setCooldowns] = useState(initialCooldowns);
  const buttonAdsConfig = useGameStore((state) => state.buttonAdsConfig);
  const isNoAdsMode = useGameStore((state) => state.isNoAdsMode);

  useEffect(() => {
    const checkCooldowns = () => {
      const now = Date.now();
      const btnIds = Object.keys(initialCooldowns);
      let newCooldowns = { ...cooldowns };
      let changed = false;

      btnIds.forEach((id) => {
        const endTime = parseInt(localStorage.getItem(`btnCooldownEnd_${id}`) || '0');
        if (endTime > now) {
          const remain = Math.ceil((endTime - now) / 1000);
          if (cooldowns[id] !== remain) {
            newCooldowns[id] = remain;
            changed = true;
          }
        } else if (cooldowns[id] !== 0) {
          newCooldowns[id] = 0;
          changed = true;
        }
      });

      if (changed) setCooldowns(newCooldowns);
    };

    checkCooldowns();
    const interval = setInterval(checkCooldowns, 1000);
    return () => clearInterval(interval);
  }, [cooldowns, initialCooldowns]);

  const executeActionWithCooldown = useCallback(
    (btnId, actionFn) => {
      const config = buttonAdsConfig?.[btnId] || {};
      const cd = cooldowns[btnId];

      if (cd > 0 && config.adLinkUrl && !isNoAdsMode) {
        window.open(config.adLinkUrl, '_blank');
        // แก้บั๊ก: หลังจากผู้เล่นยอมกดเปิดดูโฆษณาแล้ว ต้องเคลียร์คูลดาวน์ให้ทันที
        localStorage.removeItem(`btnCooldownEnd_${btnId}`);
        setCooldowns((prev) => ({ ...prev, [btnId]: 0 }));
        return;
      }

      actionFn();

      if (!isNoAdsMode) {
        const cdSeconds = config.cooldownSeconds || 0;
        if (cdSeconds > 0) {
          const endTime = Date.now() + cdSeconds * 1000;
          localStorage.setItem(`btnCooldownEnd_${btnId}`, endTime.toString());
          setCooldowns((prev) => ({ ...prev, [btnId]: cdSeconds }));
        }
      }
    },
    [cooldowns, buttonAdsConfig, isNoAdsMode]
  );

  return { cooldowns, executeActionWithCooldown, isNoAdsMode };
};
