const axios = require('axios');
const admin = require('firebase-admin');
const { API_KEY, API_HOST, LEAGUE_ID, SEASON } = require('../apiConfig');

const APP_ID = 'ssr-team';
const db = admin.firestore();

const api = axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    headers: {
        'x-apisports-key': API_KEY,
        'x-apisports-host': API_HOST
    }
});

const engine = require('./utils/pointCalculator'); // Adjusted path

// ฟังก์ชันดึงข้อมูลแมตช์ที่กำลังเตะสด (Live Fixtures)
async function syncLiveStats() {
    try {
        console.log('[SYNC] Checking for live matches...');
        
        // Fetch scoring rules for live points calculation
        const systemConfigDoc = await db.collection('public_data').doc('system_config').get();
        const sysData = systemConfigDoc.exists ? systemConfigDoc.data() : {};
        const scoringRules = sysData.scoringRules || {};
        
        // Dynamic Polling Optimization:
        // If the market is open, it usually means there are no matches going on.
        // We can skip fetching the API to save quota and Firebase reads.
        if (sysData.isMarketOpen === true) {
            console.log('[SYNC] Market is open. Skipping live sync to save API quota.');
            return { status: 'skipped_market_open' };
        }

        // ดึงรายการแมตช์ของลีกที่กำลังเตะสด
        const liveFixturesRes = await api.get('/fixtures', {
            params: {
                league: LEAGUE_ID,
                season: SEASON,
                live: 'all'
            }
        });

        const fixtures = liveFixturesRes.data.response;
        
        if (!fixtures || fixtures.length === 0) {
            console.log('[SYNC] No live matches right now.');
            // อัปเดตสถานะ live_match เป็นไม่มีเตะสด เพื่อให้ Client รู้
            await db.collection('public_data').doc('live_match').set({ status: 'upcoming', updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
            return { status: 'no_live_matches' };
        }

        console.log(`[SYNC] Found ${fixtures.length} live matches. Fetching player stats...`);
        let batch = db.batch();
        let updateCount = 0;

        // เลือกคู่ที่น่าสนใจสุดมาตั้งเป็น Main Live Match (คู่แรก)
        const mainMatch = fixtures[0];
        const liveMatchRef = db.collection('public_data').doc('live_match');
        
        batch.set(liveMatchRef, {
            homeTeam: { code: mainMatch.teams.home.name.substring(0,3).toUpperCase(), logo: mainMatch.teams.home.logo, name: mainMatch.teams.home.name },
            awayTeam: { code: mainMatch.teams.away.name.substring(0,3).toUpperCase(), logo: mainMatch.teams.away.logo, name: mainMatch.teams.away.name },
            homeScore: mainMatch.goals.home || 0,
            awayScore: mainMatch.goals.away || 0,
            minute: mainMatch.fixture.status.elapsed + "'",
            status: 'LIVE',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        updateCount++;

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
                    const pStats = playerObj.statistics[0]; 

                    if (!pStats) continue;

                    const sku = `API-${pInfo.id}`;
                    
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

                    // อัปเดตที่ public_data/live_gameweek_stats/{sku} แทนที่จะเป็น players/{sku} เพื่อลดโหลด Reads ฝั่ง Client
                    const liveStatRef = db.collection('public_data/live_gameweek_stats/players').doc(sku);
                    
                    batch.set(liveStatRef, {
                        ...newStats,
                        gwPoints: livePoints,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    updateCount++;

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
            console.log(`[SYNC] Successfully updated ${updateCount} records in live_gameweek_stats.`);
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
