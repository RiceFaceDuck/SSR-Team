global.localStorage = { getItem: () => null, setItem: () => {} };
import { apiFootballService } from './admin/src/services/api/apiFootballService.js';

async function findLatestSeason() {
  try {
    const seasons = ["2026", "2025", "2024", "2023"];
    for (const s of seasons) {
      console.log(`Checking season ${s}...`);
      apiFootballService.setConfig("73f575c169c87a030e5412387f2d3239", "39", s);
      try {
        const data = await apiFootballService.fetchPlayerById(306); // Salah
        if (data && data.statistics && data.statistics.length > 0 && data.statistics[0].games.appearences > 0) {
          console.log(`✅ Season ${s} has data! Played: ${data.statistics[0].games.appearences}`);
          return s;
        } else {
          console.log(`❌ Season ${s} has no stats yet.`);
        }
      } catch (err) {
        console.log(`⚠️ Season ${s} check failed: ${err.message}`);
      }
    }
  } catch (error) {
    console.error("Critical Error:", error);
  }
}

findLatestSeason();
