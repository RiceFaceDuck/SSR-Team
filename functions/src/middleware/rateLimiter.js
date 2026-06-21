const admin = require('firebase-admin');

// In-memory simple rate limit cache (Works per function instance)
// Key: userId_action, Value: timestamp
const memoryCache = new Map();

/**
 * Basic rate limiter
 * @param {string} userId - User ID
 * @param {string} action - Action name (e.g., 'sendChatMessage')
 * @param {number} limitMs - Minimum milliseconds between actions
 */
const checkRateLimit = (userId, action, limitMs = 2000) => {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const lastAction = memoryCache.get(key);

    if (lastAction && (now - lastAction) < limitMs) {
        throw new Error(`Rate limit exceeded for action: ${action}. Please wait before trying again.`);
    }

    memoryCache.set(key, now);

    // Clean up old entries occasionally to prevent memory leak
    if (memoryCache.size > 1000) {
        memoryCache.clear();
    }
};

module.exports = {
    checkRateLimit
};
