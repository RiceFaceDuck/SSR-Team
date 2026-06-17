import { useState } from 'react';
import { apiFootballService } from '../../../services/api/apiFootballService';

export const usePlayerSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  /**
   * ดึงข้อมูลนักเตะ 1 คนมาเปรียบเทียบ (ยังไม่เซฟลง Database)
   */
  const checkPlayerUpdate = async (player) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      // 🌟 นำอักขระพิเศษออกให้เหลือแค่ตัวอักษรและช่องว่าง (เช่น ลบจุด .)
      const searchQuery = (player.fullName || player.name).replace(/[^a-zA-Z0-9\s]/g, '').trim();
      
      const apiPlayers = await apiFootballService.fetchPlayers(searchQuery);
      
      if (!apiPlayers || apiPlayers.length === 0) {
        throw new Error("ไม่พบข้อมูลนักเตะนี้ในระบบ API-Football");
      }

      const mappedData = apiFootballService.mapApiDataToSchema(apiPlayers[0]);
      if (!mappedData) throw new Error("ไม่สามารถแมพข้อมูล API ได้");

      // หารายการอัปเดต (Diff)
      const updates = {};
      let hasChanges = false;
      
      if (mappedData.stats.goals !== player.stats?.goals) { updates.goals = mappedData.stats.goals; hasChanges = true; }
      if (mappedData.stats.assists !== player.stats?.assists) { updates.assists = mappedData.stats.assists; hasChanges = true; }
      if (mappedData.stats.cleanSheets !== player.stats?.cleanSheets) { updates.cleanSheets = mappedData.stats.cleanSheets; hasChanges = true; }
      if (mappedData.team && mappedData.team !== player.team) { updates.team = mappedData.team; hasChanges = true; }
      if (mappedData.status !== player.status) { updates.status = mappedData.status; hasChanges = true; }
      // 🌟 นำการอัปเดต SKU ออก เพื่อไม่ให้กระทบ Document ID (Immutable)

      return { success: true, data: mappedData, updates, hasChanges };
    } catch (err) {
      console.error("Sync API Error:", err);
      setSyncError(err.message || "เกิดข้อผิดพลาดในการเช็คอัปเดตนักเตะ");
      return { success: false, error: err };
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * เช็คอัปเดตแบบกลุ่ม (คำนวณทั้งหมด หรือ ดึงทีมใหม่จาก API)
   */
  const checkBulkUpdates = async (playersList, teamName = 'All') => {
    setIsSyncing(true);
    setSyncError(null);
    let newUpdatesCount = 0;
    const bulkUpdates = [];

    try {
      // 1. ถ้ามีการเลือกทีม ให้ใช้ API แบบดึงทั้งทีมมาเลย (ประหยัดและเร็วกว่า)
      if (teamName !== 'All') {
        // ดึง Team ID
        const { teamDatabase } = await import('../../../services/firebase/teamDatabase');
        const teams = await teamDatabase.getAllTeams();
        const teamObj = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
        
        let teamId = null;
        if (teamObj && teamObj.logo) {
          const match = teamObj.logo.match(/\/(\d+)\.png/);
          if (match) teamId = match[1];
        }

        if (teamId) {
          const apiPlayers = await apiFootballService.fetchTeamPlayers(teamId);
          for (const apiP of apiPlayers) {
            const mappedData = apiFootballService.mapApiDataToSchema(apiP);
            if (mappedData) {
              // เช็คว่ามีในระบบอยู่แล้วหรือไม่
              const existingPlayer = playersList.find(p => p.sku === mappedData.sku || p.fullName === mappedData.fullName);
              
              if (existingPlayer) {
                // เช็คอัปเดต
                const updates = {};
                let hasChanges = false;
                if (mappedData.stats.goals !== existingPlayer.stats?.goals) { updates.goals = mappedData.stats.goals; hasChanges = true; }
                if (mappedData.stats.assists !== existingPlayer.stats?.assists) { updates.assists = mappedData.stats.assists; hasChanges = true; }
                if (mappedData.stats.cleanSheets !== existingPlayer.stats?.cleanSheets) { updates.cleanSheets = mappedData.stats.cleanSheets; hasChanges = true; }
                // 🌟 ป้องกัน Schema ทับซ้อน
                const finalTeamName = teamName !== 'All' ? teamName : existingPlayer.team;
                
                if (finalTeamName !== existingPlayer.team) { 
                  updates.team = finalTeamName; 
                  hasChanges = true; 
                }

                if (mappedData.status !== existingPlayer.status) { updates.status = mappedData.status; hasChanges = true; }
                
                // 🌟 Force update if totalPoints is missing or 0 (and the player has some stats to calculate)
                const hasPlayed = mappedData.stats?.minutes > 0 || mappedData.stats?.played > 0;
                if (hasPlayed && (existingPlayer.totalPoints === undefined || existingPlayer.totalPoints === 0)) {
                  updates.totalPoints = "Need Recalculation";
                  hasChanges = true;
                }
                
                // 🌟 นำการอัปเดต SKU ออก เพื่อไม่ให้กระทบ Document ID

                if (hasChanges) {
                  newUpdatesCount++;
                  // แก้ไข apiData.team กลับให้ตรงกับระบบเรา
                  const fixedApiData = { ...mappedData, team: finalTeamName };
                  bulkUpdates.push({ player: existingPlayer, apiData: fixedApiData, updates });
                }
              } else {
                // เป็นนักเตะใหม่ที่ยังไม่มีใน Database
                newUpdatesCount++;
                // ใส่ราคาเริ่มต้น 5.0m
                mappedData.price = 5.0;
                mappedData.displayPrice = "5.0m";
                
                const finalTeamName = teamName !== 'All' ? teamName : mappedData.team;
                mappedData.team = finalTeamName;

                bulkUpdates.push({ 
                  player: { id: `new_${mappedData.sku}`, isNew: true, name: mappedData.name, team: finalTeamName, stats: {} }, 
                  apiData: mappedData, 
                  updates: { status: 'New Player (เพิ่มใหม่)', ...mappedData.stats } 
                });
              }
            }
          }
          return { success: true, count: newUpdatesCount, updates: bulkUpdates };
        }
      }

      // 2. ถ้าไม่ได้เลือกทีม หรือหาทีมไม่เจอ ให้ดึงตามลิสต์ทีละคนเหมือนเดิม
      for (const player of playersList) {
        try {
          const searchQuery = (player.fullName || player.name).replace(/[^a-zA-Z0-9\s]/g, '').trim();
          const apiPlayers = await apiFootballService.fetchPlayers(searchQuery);
          if (apiPlayers && apiPlayers.length > 0) {
            const mappedData = apiFootballService.mapApiDataToSchema(apiPlayers[0]);
            if (mappedData) {
              const updates = {};
              let hasChanges = false;
              
              if (mappedData.stats.goals !== player.stats?.goals) { updates.goals = mappedData.stats.goals; hasChanges = true; }
              if (mappedData.stats.assists !== player.stats?.assists) { updates.assists = mappedData.stats.assists; hasChanges = true; }
              if (mappedData.stats.cleanSheets !== player.stats?.cleanSheets) { updates.cleanSheets = mappedData.stats.cleanSheets; hasChanges = true; }
              if (mappedData.team && mappedData.team !== player.team) { updates.team = mappedData.team; hasChanges = true; }
              if (mappedData.status !== player.status) { updates.status = mappedData.status; hasChanges = true; }
              
              // 🌟 Force update if totalPoints is missing or 0
              const hasPlayed = mappedData.stats?.minutes > 0 || mappedData.stats?.played > 0;
              if (hasPlayed && (player.totalPoints === undefined || player.totalPoints === 0)) {
                updates.totalPoints = "Need Recalculation";
                hasChanges = true;
              }
              
              // 🌟 นำการอัปเดต SKU ออก เพื่อไม่ให้กระทบ Document ID

              if (hasChanges) {
                newUpdatesCount++;
                bulkUpdates.push({ player, apiData: mappedData, updates });
              }
            }
          }
        } catch (e) {
          console.warn(`Failed to check update for ${player.name}`);
        }
      }
      return { success: true, count: newUpdatesCount, updates: bulkUpdates };
    } catch (err) {
      console.error("Bulk Sync Error:", err);
      setSyncError("เกิดข้อผิดพลาดในการเช็คอัปเดตกลุ่ม");
      return { success: false, error: err };
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncError,
    checkPlayerUpdate,
    checkBulkUpdates
  };
};
