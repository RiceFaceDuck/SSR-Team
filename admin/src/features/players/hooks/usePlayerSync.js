import { useState } from 'react';
import { apiFootballService } from '../../../services/api/apiFootballService';
import { teamDatabase } from '../../../services/firebase/teamDatabase';

const normalizeName = (name) => (name || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

export const usePlayerSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  /**
   * ดึงข้อมูลนักเตะ 1 คนมาเปรียบเทียบ (ยังไม่เซฟลง Database)
   */
  const checkPlayerUpdate = async (player, syncOptions = { stats: true, status: true, team: true }) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      // 🌟 นำอักขระพิเศษออกให้เหลือแค่ตัวอักษรและช่องว่าง (เช่น ลบจุด .)
      const searchQuery = (player.fullName || player.name).replace(/[^a-zA-Z0-9\s]/g, '').trim();

      const apiPlayers = await apiFootballService.fetchPlayers(searchQuery);

      if (!apiPlayers || apiPlayers.length === 0) {
        throw new Error('ไม่พบข้อมูลนักเตะนี้ในระบบ API-Football');
      }

      const mappedData = apiFootballService.mapApiDataToSchema(apiPlayers[0]);
      if (!mappedData) throw new Error('ไม่สามารถแมพข้อมูล API ได้');

      // หารายการอัปเดต (Diff)
      const updates = {};
      let hasChanges = false;

      if (syncOptions.stats) {
        if (mappedData.stats.goals !== player.stats?.goals) {
          updates.goals = mappedData.stats.goals;
          hasChanges = true;
        }
        if (mappedData.stats.assists !== player.stats?.assists) {
          updates.assists = mappedData.stats.assists;
          hasChanges = true;
        }
        if (mappedData.stats.cleanSheets !== player.stats?.cleanSheets) {
          updates.cleanSheets = mappedData.stats.cleanSheets;
          hasChanges = true;
        }
      }
      
      if (syncOptions.team && mappedData.team && mappedData.team !== player.team) {
        updates.team = mappedData.team;
        hasChanges = true;
      }
      
      if (syncOptions.status && mappedData.status !== player.status) {
        updates.status = mappedData.status;
        hasChanges = true;
      }

      return { success: true, data: mappedData, updates, hasChanges };
    } catch (err) {
      console.error('Sync API Error:', err);
      setSyncError(err.message || 'เกิดข้อผิดพลาดในการเช็คอัปเดตนักเตะ');
      return { success: false, error: err };
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * เช็คอัปเดตแบบกลุ่ม (คำนวณทั้งหมด หรือ ดึงทีมใหม่จาก API)
   */
  const checkBulkUpdates = async (playersList, teamName = 'All', syncOptions = { stats: true, status: true, team: true }) => {
    setIsSyncing(true);
    setSyncError(null);
    let newUpdatesCount = 0;
    const bulkUpdates = [];

    try {
      const teams = await teamDatabase.getAllTeams();
      
      // Determine which teams to fetch
      const teamsToFetch = [];
      if (teamName !== 'All') {
        const teamObj = teams.find((t) => t.name.toLowerCase() === teamName.toLowerCase());
        if (teamObj?.apiTeamId) {
          teamsToFetch.push({ name: teamObj.name, apiTeamId: teamObj.apiTeamId });
        } else if (teamObj?.logo) {
          // Fallback just in case apiTeamId is not set yet
          const match = teamObj.logo.match(/\/(\d+)\.png/);
          if (match) teamsToFetch.push({ name: teamObj.name, apiTeamId: match[1] });
        }
      } else {
        // Group players by team to avoid N+1
        const uniqueTeamNames = [...new Set(playersList.map((p) => p.team).filter(Boolean))];
        for (const tName of uniqueTeamNames) {
          const teamObj = teams.find((t) => t.name.toLowerCase() === tName.toLowerCase());
          if (teamObj?.apiTeamId) {
            teamsToFetch.push({ name: teamObj.name, apiTeamId: teamObj.apiTeamId });
          } else if (teamObj?.logo) {
            const match = teamObj.logo.match(/\/(\d+)\.png/);
            if (match) teamsToFetch.push({ name: teamObj.name, apiTeamId: match[1] });
          }
        }
      }

      // Process each team once (Batching to avoid N+1)
      for (const targetTeam of teamsToFetch) {
        try {
          const apiPlayers = await apiFootballService.fetchTeamPlayers(targetTeam.apiTeamId);
          
          for (const apiP of apiPlayers) {
            const mappedData = apiFootballService.mapApiDataToSchema(apiP);
            if (!mappedData) continue;
            
            const existingPlayer = playersList.find((p) => p.sku === mappedData.sku);

            if (existingPlayer) {
              const updates = {};
              let hasChanges = false;
              
              if (syncOptions.stats) {
                if (mappedData.stats.goals !== existingPlayer.stats?.goals) {
                  updates.goals = mappedData.stats.goals;
                  hasChanges = true;
                }
                if (mappedData.stats.assists !== existingPlayer.stats?.assists) {
                  updates.assists = mappedData.stats.assists;
                  hasChanges = true;
                }
                if (mappedData.stats.cleanSheets !== existingPlayer.stats?.cleanSheets) {
                  updates.cleanSheets = mappedData.stats.cleanSheets;
                  hasChanges = true;
                }
              }

              const finalTeamName = targetTeam.name;
              if (syncOptions.team && finalTeamName !== existingPlayer.team) {
                updates.team = finalTeamName;
                hasChanges = true;
              }

              if (syncOptions.status && mappedData.status !== existingPlayer.status) {
                updates.status = mappedData.status;
                hasChanges = true;
              }

              const hasPlayed = mappedData.stats?.minutes > 0 || mappedData.stats?.played > 0;
              if (
                syncOptions.stats &&
                hasPlayed &&
                (existingPlayer.totalPoints === undefined || existingPlayer.totalPoints === 0)
              ) {
                updates.totalPoints = 'Need Recalculation';
                hasChanges = true;
              }

              if (hasChanges) {
                newUpdatesCount++;
                // Preserve the manual short name or image from local existingPlayer during actual sync by omitting them in apiData (or letting sync handler ignore them)
                const fixedApiData = { ...mappedData, team: finalTeamName };
                // Also carry over current local name/imageUrl so they don't get overwritten
                fixedApiData.name = existingPlayer.name; 
                if (existingPlayer.imageUrl) fixedApiData.imageUrl = existingPlayer.imageUrl;
                if (existingPlayer.shortName) fixedApiData.shortName = existingPlayer.shortName;

                bulkUpdates.push({ player: existingPlayer, apiData: fixedApiData, updates });
              }
            } else if (teamName !== 'All') { 
              // Only add new players if we are checking a specific team
              newUpdatesCount++;
              mappedData.price = 5.0;
              mappedData.displayPrice = '5.0m';
              const finalTeamName = targetTeam.name;
              mappedData.team = finalTeamName;

              bulkUpdates.push({
                player: {
                  id: `new_${mappedData.sku}`,
                  isNew: true,
                  name: mappedData.name,
                  team: finalTeamName,
                  stats: {},
                },
                apiData: mappedData,
                updates: { status: 'New Player (เพิ่มใหม่)', ...mappedData.stats },
              });
            }
          }
        } catch (e) {
          console.warn(`Failed to fetch team players for ${targetTeam.name}`, e);
        }
      }

      // If we couldn't resolve any team, and we still want to sync 'All', fallback to individual but log warning
      if (teamsToFetch.length === 0 && playersList.length > 0 && teamName === 'All') {
        console.warn('No teams found with apiTeamId. Syncing might be skipped to prevent rate limit.');
        // We skip individual looping to prevent N+1 API ban. The admin must setup teams properly.
        alert('ไม่สามารถอัปเดตได้: ไม่พบ API Team ID ในข้อมูลสโมสร กรุณาตรวจสอบข้อมูลสโมสรก่อน');
      }

      return { success: true, count: newUpdatesCount, updates: bulkUpdates };
    } catch (err) {
      console.error('Bulk Sync Error:', err);
      setSyncError('เกิดข้อผิดพลาดในการเช็คอัปเดตกลุ่ม');
      return { success: false, error: err };
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    syncError,
    checkPlayerUpdate,
    checkBulkUpdates,
  };
};
