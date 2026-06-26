export const powerCardRule = {
  apply: (squad, context) => {
    return squad.map((p) => {
      // ตรวจสอบว่านักเตะมีการใช้การ์ด (appliedCard) หรือไม่
      if (p.appliedCard && p.appliedCard.effectLogic) {
        const effect = p.appliedCard.effectLogic;

        switch (effect.type) {
          case 'TRIPLE_CAPTAIN':
            if (p.isStarting) {
              p.pointsEarned = p.basePoints * 3;
              p.hasTripleCaptain = true;
            }
            break;

          case 'BENCH_BOOST':
            // ถ้าเป็นตัวสำรอง จะได้คะแนนด้วย (ModifierPipeline จะเช็ค flag นี้)
            if (!p.isStarting) {
              p.hasBenchBoost = true;
            }
            break;

          case 'IMMUNE_YELLOW':
            // สมมติว่าใบเหลืองหัก -200 (ต้องดู scoring rules ถ้ามี)
            // เช็คว่านักเตะได้ใบเหลืองไหม ถ้าได้ คืนคะแนนกลับมา
            if (p.yellowCards > 0) {
              // ดึงค่าหักลบจาก context.scoringRules ถ้าส่งมา (ในที่นี้ทำแบบ Fixed หรือคำนวณใหม่)
              const yellowPenalty = context.scoringRules?.yellowCard?.value || -200;
              p.pointsEarned += Math.abs(yellowPenalty * p.yellowCards);
              p.isImmuneYellow = true;
            }
            break;

          case 'POINTS_MULTIPLIER':
            if (p.isStarting) {
              const multiplier = parseFloat(effect.value) || 1.5;
              p.pointsEarned = Math.round(p.basePoints * multiplier);
            }
            break;

          // การ์ดอื่นๆ เพิ่ม Case ที่นี่
        }
      }
      return p;
    });
  },
};
