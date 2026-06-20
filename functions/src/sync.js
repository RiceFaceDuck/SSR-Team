const axios = require('axios');
const admin = require('firebase-admin');
const { API_KEY, API_HOST, LEAGUE_ID, SEASON } = require('./apiConfig');

const APP_ID = 'ssr-team';
const db = admin.firestore();

const api = axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    headers: {
        'x-apisports-key': API_KEY,
        'x-apisports-host': API_HOST
    }
});

const engine = require('./engine');

// ฟังก์ชันดึงข้อมูลแมตช์ที่กำลังเตะสด (Live Fixtures) หรือดึงข้อมูลรายวัน
async function syncLiveStats() {
    try {
        console.log('[SYNC] Checking for live matches...');
        
        // Fetch scoring rules for live points calculation
        const systemConfigDoc = await db.collection('public_data').doc('system_config').get();
        const scoringRules = systemConfigDoc.exists ? (systemConfigDoc.data().scoringRules || {}) : {};

        // ดึงรายการแมตช์ของลีกที่กำลังเตะสด
        const liveFixturesRes = await api.get('/fixtures', {
            params: {
                league: LEAGUE_ID,
                season: SEASON,
                live: 'all'
            }
        });

        const fixtures = liveFixturesRes.data.response;
        
        // ถ้าไม่มีคู่ไหนเตะอยู่ ให้ดึงข้อมูลของแมตช์ที่เพิ่งจบไปหมาดๆ ในวันนี้แทน (เผื่ออัปเดตตกหล่น)
        // เพื่อความง่ายในต้นแบบ จะข้ามไปก่อนถ้าไม่มี live
        if (!fixtures || fixtures.length === 0) {
            console.log('[SYNC] No live matches right now.');
            return { status: 'no_live_matches' };
        }

        console.log(`[SYNC] Found ${fixtures.length} live matches. Fetching player stats...`);
        let batch = db.batch();
        let updateCount = 0;

        for (const fixture of fixtures) {
            const fixtureId = fixture.fixture.id;
            // ดึงสถิตินักเตะในแมตช์นั้น
            const statsRes = await api.get('/fixtures/players', {
                params: { fixture: fixtureId }
            });

            const teamsStats = statsRes.data.response;
            if (!teamsStats) continue;

            for (const team of teamsStats) {
                for (const playerObj of team.players) {
                    const pInfo = playerObj.player;
                    const pStats = playerObj.statistics[0]; // stats for this specific match

                    if (!pStats) continue;

                    // ค้นหานักเตะใน Firestore ด้วย API ID
                    const sku = `API-${pInfo.id}`;
                    const playerRef = db.collection(`artifacts/${APP_ID}/public/data/players`).doc(sku);
                    
                    // Fetch current position from existing doc (cached ideally, but here we do a read)
                    // Note: In a highly optimized version, we'd cache the player positions beforehand to save Reads.
                    // To save reads, we can use the position from API-Football. But API-Football returns position like 'Attacker', 'Midfielder', 'Defender', 'Goalkeeper'
                    // We map it to our format: FWD, MID, DEF, GK
                    let pos = 'MID';
                    if (pStats.games.position === 'Attacker') pos = 'FWD';
                    else if (pStats.games.position === 'Defender') pos = 'DEF';
                    else if (pStats.games.position === 'Goalkeeper') pos = 'GK';

                    const newStats = {
                        minutes: pStats.games.minutes || 0,
                        goals: pStats.goals.total || 0,
                        assists: pStats.goals.assists || 0,
                        cleanSheets: (pStats.goals.conceded === 0 && pStats.games.minutes >= 60) ? 1 : 0,
                        yellowCards: pStats.cards.yellow || 0,
                        redCards: pStats.cards.red || 0,
                        saves: pStats.goals.saves || 0,
                        tackles: pStats.tackles.total || 0,
                        passes: pStats.passes.total || 0,
                        rating: parseFloat(pStats.games.rating || 0)
                    };

                    const livePoints = engine.calculatePlayerPoints(newStats, pos, scoringRules);

                    batch.set(playerRef, {
                        stats: newStats,
                        totalPoints: livePoints, // Live Event Point Calculation!
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    updateCount++;

                    // Firestore batch limit is 500
                    if (updateCount === 490) {
                        await batch.commit();
                        batch = db.batch();
                        updateCount = 0;
                    }
                }
            }
        }

        if (updateCount > 0) {
            await batch.commit();
            console.log(`[SYNC] Successfully updated ${updateCount} players live stats.`);
        }

        return { status: 'success', updated: updateCount };
    } catch (error) {
        console.error('[SYNC] Error syncing live stats:', error.message);
        throw error;
    }
}

module.exports = {
    syncLiveStats
};
