import { determineSquadMVP } from '../../utils/pointCalculator';

export const mvpRule = {
  apply: (squad, context) => {
    // หา MVP ของทีมในสัปดาห์นี้
    const mvpId = determineSquadMVP(squad);

    if (mvpId) {
      return squad.map((p) => {
        if (p.playerId === mvpId && p.isStarting) {
          p.pointsEarned += 500;
          p.isMvp = true;
        }
        return p;
      });
    }

    return squad;
  },
};
