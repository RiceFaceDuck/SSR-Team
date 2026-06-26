/**
 * @file synergyAnalyzer.js
 * @description Strategy สำหรับวิเคราะห์ว่านักเตะคนไหนเมื่อเติมเข้าทีมแล้วจะทำให้เกิด Synergy มากที่สุด
 */

export const synergyAnalyzer = {
  /**
   * ตรวจสอบว่าควรเลือกรักษาฐานทีมไหนไว้บ้าง
   */
  evaluateBestTeamSynergy: (teamCounts) => {
    let bestTeam = null;
    let maxCount = 0;

    for (const team in teamCounts) {
      if (teamCounts[team] > maxCount && teamCounts[team] < 3) {
        maxCount = teamCounts[team];
        bestTeam = team;
      }
    }
    return bestTeam;
  },
};
