/**
 * @file ModifierPipeline.js
 * @description ศูนย์กลางประมวลผลเอฟเฟกต์ต่างๆ ของทีม (Centralized Modifier Engine).
 * ควบคุมการไหลของข้อมูล (Pipeline) ตามหลัก SRP.
 */

const { captainRule } = require('./rules/captainRule');
const { mvpRule } = require('./rules/mvpRule');
const { powerCardRule } = require('./rules/powerCardRule');
const { synergyRule } = require('./rules/synergyRule');
const { managerRule } = require('./rules/managerRule');
const { underdogRule } = require('./rules/underdogRule');

class ModifierPipeline {
  constructor(context) {
    this.context = context;
    // ลำดับการประมวลผล (Order matters: การคูณทีหลังจะมีผลมากกว่า)
    this.playerRules = [
      powerCardRule,   // เอฟเฟกต์จากการ์ดที่ใส่ให้นักเตะ
      captainRule,     // คูณคะแนนกัปตัน
      mvpRule          // โบนัส MVP ทีม
    ];
    
    this.teamRules = [
      synergyRule,     // โบนัสทีมเดียวกัน
      managerRule,     // บัฟผู้จัดการทีม
      underdogRule     // ทีมรองบ่อน
    ];
  }

  /**
   * รัน Pipeline สำหรับหนึ่งทีม
   * @param {Array} squad นักเตะในทีมที่มี basePoints มาแล้ว
   * @param {Object} squadData ข้อมูลทีม (manager, budgetLeft, etc.)
   * @returns {Object} { processedSquad, totalGwPoints }
   */
  run(squad, squadData) {
    let processedSquad = [...squad];
    
    // 1. ประมวลผลระดับตัวบุคคล (Player-level modifiers)
    this.playerRules.forEach(rule => {
      processedSquad = rule.apply(processedSquad, { ...this.context, squadData });
    });

    // คำนวณคะแนนรวมเบื้องต้น
    let totalGwPoints = 0;
    const teamCounts = {};
    
    processedSquad.forEach(p => {
      // ถ้านักเตะลงสนาม หรือได้รับการ์ด BENCH_BOOST ให้คิดคะแนน
      if (p.isStarting || p.hasBenchBoost) { 
        totalGwPoints += p.pointsEarned;
        
        // สำหรับคำนวณ Synergy (นับเฉพาะตัวจริง)
        if (p.isStarting && this.context.synergyActive) {
           const team = p.team || 'UNK';
           teamCounts[team] = (teamCounts[team] || 0) + 1;
        }
      }
    });

    // 2. ประมวลผลระดับทีม (Team-level modifiers)
    let extraBonus = 0;
    this.teamRules.forEach(rule => {
      const bonus = rule.calculate(totalGwPoints, { ...this.context, squadData, teamCounts });
      extraBonus += bonus;
    });

    totalGwPoints += extraBonus;

    return { processedSquad, totalGwPoints };
  }
}

exports.ModifierPipeline = ModifierPipeline;
