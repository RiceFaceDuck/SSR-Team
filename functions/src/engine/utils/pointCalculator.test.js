const { describe, it, expect } = require('vitest');
const { calculatePlayerPoints, determineSquadMVP } = require('./pointCalculator');

describe('pointCalculator', () => {
    describe('calculatePlayerPoints', () => {
        it('should return 0 if no stats provided', () => {
            expect(calculatePlayerPoints(null, 'FWD')).toBe(0);
        });

        it('should calculate base play points correctly', () => {
            const stats = { minutes: 90 };
            expect(calculatePlayerPoints(stats, 'FWD')).toBe(200);
        });

        it('should calculate goal points correctly based on position', () => {
            const statsFwd = { goals: 1 };
            const statsMid = { goals: 1 };
            expect(calculatePlayerPoints(statsFwd, 'FWD')).toBe(200 + 800);
            expect(calculatePlayerPoints(statsMid, 'MID')).toBe(200 + 1000);
        });

        it('should handle yellow and red cards', () => {
            const stats = { yellowCards: 1, redCards: 1 };
            expect(calculatePlayerPoints(stats, 'DEF')).toBe(200 - 200 - 600);
        });

        it('should apply custom rules if provided', () => {
            const stats = { goals: 1 };
            const customRules = {
                goal: { FWD: 5000, isActive: true }
            };
            // 200 base + 5000 custom
            expect(calculatePlayerPoints(stats, 'FWD', customRules)).toBe(5200);
        });
    });

    describe('determineSquadMVP', () => {
        it('should return null for empty squad', () => {
            expect(determineSquadMVP([])).toBeNull();
        });

        it('should return the playerId with highest points among starters', () => {
            const squad = [
                { playerId: 'p1', isStarting: true, basePoints: 500 },
                { playerId: 'p2', isStarting: true, basePoints: 1200 },
                { playerId: 'p3', isStarting: false, basePoints: 5000 } // Not starting
            ];
            expect(determineSquadMVP(squad)).toBe('p2');
        });
    });
});
