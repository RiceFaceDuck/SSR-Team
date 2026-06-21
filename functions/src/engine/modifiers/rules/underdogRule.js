exports.underdogRule = {
  calculate: (totalGwPoints, context) => {
    const { gameRules, squadData } = context;
    const startingBudget = gameRules?.startingBudget?.value || 100;
    const budgetLeft = squadData?.budgetLeft || 0;
    
    // คำนวณมูลค่าทีมที่ใช้ไป
    const budgetSpent = startingBudget - budgetLeft;
    
    // ถ้าทีมนี้น้อยกว่าครึ่งนึงของงบ ถือเป็น Underdog
    const isUnderdog = budgetSpent < (startingBudget * 0.5);

    if (isUnderdog) {
      return Math.round(totalGwPoints * 0.1); // +10% Bonus
    }
    return 0;
  }
};
