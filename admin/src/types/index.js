/**
 * @typedef {Object} Player
 * @property {string} id - Database Document ID
 * @property {number} apiId - API-Football Player ID
 * @property {string} name - Player name
 * @property {string} position - ATT, MID, DEF, GK
 * @property {string} team - Team name (e.g. 'Manchester City')
 * @property {number} price - Current market value
 * @property {string} photo - URL to player photo
 * @property {boolean} isActive - Is player active in the game
 */

/**
 * @typedef {Object} SquadMember
 * @property {number} playerId - API ID of the player
 * @property {string} position - Slot position
 * @property {boolean} isStarting - Starting XI or bench
 * @property {number} slotIndex - Slot position index
 * @property {number} purchasePrice - Price when bought
 */

/**
 * @typedef {Object} Manager
 * @property {string} id - Manager ID
 * @property {string} name - Manager name
 * @property {Object} effectLogic - Effect details
 * @property {string} effectLogic.type - Type of effect (e.g. 'BUDGET_BONUS')
 * @property {number} effectLogic.value - Value of effect
 */

/**
 * @typedef {Object} Team
 * @property {string} id - Database Document ID
 * @property {number} apiId - API-Football Team ID
 * @property {string} name - Team name
 * @property {string} logo - URL to team logo
 */

export {};
