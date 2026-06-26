/**
 * Quota Test Runner Service
 * Used to calculate and simulate Firebase Read/Write quotas based on detailed user scenarios.
 */

// Define atomic actions and their baseline Firebase Read/Write costs
export const ATOMIC_ACTIONS = {
  // 1. Authentication & Initial Load
  login: {
    id: 'login',
    label: 'เข้าสู่ระบบ (Login & Initial Sync)',
    category: 'monetization',
    defaultReads: 5, // User, Inventory, Squad, Friends, System Config
    defaultWrites: 1, // Update lastLoginAt
  },
  // 2. Core Dashboard
  viewDashboard: {
    id: 'viewDashboard',
    label: 'เปิดหน้าแดชบอร์ดหลัก',
    category: 'coreEngine',
    defaultReads: 3, // System Config, Active Gameweek, Game Rules
    defaultWrites: 0,
  },
  // 3. Squad Management
  viewSquad: {
    id: 'viewSquad',
    label: 'เปิดหน้าจัดการทีม',
    category: 'coreEngine',
    defaultReads: 15, // 1 Squad doc + ~14 Player docs
    defaultWrites: 0,
  },
  saveSquad: {
    id: 'saveSquad',
    label: 'บันทึกการจัดทีม (Save Squad)',
    category: 'coreEngine',
    defaultReads: 1, // Verify squad before write
    defaultWrites: 1, // Write Squad doc
  },
  // 4. Market & Transfers
  viewMarket: {
    id: 'viewMarket',
    label: 'ค้นหา/โหลดหน้าตลาดนักเตะ (ต่อ 1 หน้า)',
    category: 'coreEngine',
    defaultReads: 20, // Load 20 players per pagination
    defaultWrites: 0,
  },
  buyPlayer: {
    id: 'buyPlayer',
    label: 'ทำรายการซื้อนักเตะ (Transaction)',
    category: 'monetization',
    defaultReads: 3, // Read User (Balance), Squad, Player
    defaultWrites: 3, // Update User, Update Squad, Create Transaction Log
  },
  sellPlayer: {
    id: 'sellPlayer',
    label: 'ทำรายการขายนักเตะ (Transaction)',
    category: 'monetization',
    defaultReads: 3,
    defaultWrites: 3,
  },
  // 5. Social & Live
  viewLiveMatch: {
    id: 'viewLiveMatch',
    label: 'ดู Live Score (ประเมิน 10 นาที)',
    category: 'adminOps',
    defaultReads: 25, // Live match doc, events, and 22 player stats updates
    defaultWrites: 0,
  },
  sendChat: {
    id: 'sendChat',
    label: 'ส่งข้อความแชท Global',
    category: 'adminOps',
    defaultReads: 0,
    defaultWrites: 1,
  },
};

/**
 * Simulates a user session and calculates total reads/writes based on selected actions.
 * @param {Object} scenarioConfig - Key-value pair of actionId -> count
 * @returns {Object} - Total reads and writes grouped by categories
 */
export const runQuotaSimulation = (scenarioConfig) => {
  const result = {
    totalReads: 0,
    totalWrites: 0,
    categories: {
      coreEngine: { reads: 0, writes: 0 },
      security: { reads: 0, writes: 0 },
      adminOps: { reads: 0, writes: 0 },
      monetization: { reads: 0, writes: 0 },
    },
    details: [], // For detailed breakdown
  };

  Object.entries(scenarioConfig).forEach(([actionId, count]) => {
    if (count > 0 && ATOMIC_ACTIONS[actionId]) {
      const action = ATOMIC_ACTIONS[actionId];
      const actionReads = action.defaultReads * count;
      const actionWrites = action.defaultWrites * count;

      result.totalReads += actionReads;
      result.totalWrites += actionWrites;

      if (result.categories[action.category]) {
        result.categories[action.category].reads += actionReads;
        result.categories[action.category].writes += actionWrites;
      }

      result.details.push({
        label: action.label,
        count,
        reads: actionReads,
        writes: actionWrites,
      });
    }
  });

  return result;
};
