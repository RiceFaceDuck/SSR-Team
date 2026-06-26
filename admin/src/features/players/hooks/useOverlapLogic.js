import { useState, useMemo, useCallback } from 'react';
import { playerDatabase } from '../../../services/firebase/playerDatabase';

export const useOverlapLogic = (players, fetchPlayers) => {
  const [isResolving, setIsResolving] = useState(false);

  // คำนวณกลุ่มของนักเตะที่ซ้ำซ้อนกัน (โดยชื่อ หรือ SKU)
  const overlaps = useMemo(() => {
    if (!players) return [];

    const nameMap = {};
    const skuMap = {};

    const normalizeName = (name) => (name || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    players.forEach((p) => {
      // จัดกลุ่มตามชื่อ (Fuzzy Match)
      const nameKey = normalizeName(p.fullName || p.name);
      if (nameKey) {
        if (!nameMap[nameKey]) nameMap[nameKey] = [];
        nameMap[nameKey].push(p);
      }

      // จัดกลุ่มตาม SKU
      const skuKey = (p.sku || '').toLowerCase().trim();
      if (skuKey) {
        if (!skuMap[skuKey]) skuMap[skuKey] = [];
        skuMap[skuKey].push(p);
      }
    });

    const results = [];
    const processedIds = new Set();

    const addGroup = (title, items) => {
      // กรองเฉพาะคนที่ยังไม่ได้ถูกจัดกลุ่มไปแล้ว เพื่อป้องกันกลุ่มซ้ำซ้อน
      const newItems = items.filter((i) => !processedIds.has(i.id));
      if (newItems.length > 1) {
        results.push({ title, items: newItems });
        newItems.forEach((i) => processedIds.add(i.id));
      }
    };



    Object.keys(skuMap).forEach((key) => {
      if (skuMap[key].length > 1) addGroup(`SKU ซ้ำ: ${key}`, skuMap[key]);
    });

    Object.keys(nameMap).forEach((key) => {
      // เฉพาะกลุ่มชื่อซ้ำ ที่อาจจะมี SKU ต่างกัน
      if (nameMap[key].length > 1) addGroup(`ชื่ออาจซ้ำกัน: ${key}`, nameMap[key]);
    });

    return results;
  }, [players]);

  // ฟังก์ชันลบทีละรายการ (Manual Delete)
  const deleteSinglePlayer = useCallback(
    async (id) => {
      if (window.confirm('คุณแน่ใจว่าต้องการลบนักเตะคนนี้เพื่อแก้ปัญหาข้อมูลซ้ำ?')) {
        setIsResolving(true);
        try {
          await playerDatabase.deletePlayer(id);
          await fetchPlayers();
        } catch (err) {
          alert('Error: ' + err.message);
        } finally {
          setIsResolving(false);
        }
      }
    },
    [fetchPlayers]
  );

  // ฟังก์ชันแก้ปัญหาทั้งหมดอัตโนมัติ (Auto Resolve)
  const autoResolveAll = useCallback(async () => {
    if (!overlaps || overlaps.length === 0) return;

    const confirmMessage = `ระบบจะทำการรวมข้อมูลที่ซ้ำซ้อนกันอัตโนมัติ\nโดยยึดข้อมูลจาก API เป็นหลัก\n\nต้องการดำเนินการต่อหรือไม่?`;
    if (!window.confirm(confirmMessage)) return;

    setIsResolving(true);
    try {
      // ส่งเฉพาะ items ของแต่ละกลุ่มเข้าไปใน Service
      const groupsToResolve = overlaps.map((group) => group.items);
      const res = await playerDatabase.autoResolveOverlaps(groupsToResolve);

      if (res.success) {
        alert(
          `จัดการสำเร็จ!\nรวมข้อมูลเสร็จสิ้น ${res.resolvedCount} กลุ่ม\nลบข้อมูลที่ซ้ำซ้อนทิ้ง ${res.deletedCount} รายการ`
        );
        await fetchPlayers();
      } else {
        alert('เกิดข้อผิดพลาดในการรวมข้อมูล: ' + res.error?.message);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsResolving(false);
    }
  }, [overlaps, fetchPlayers]);

  return {
    overlaps,
    isResolving,
    deleteSinglePlayer,
    autoResolveAll,
  };
};
