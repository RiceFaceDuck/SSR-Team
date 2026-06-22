import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase-admin
vi.mock('firebase-admin', () => {
  const batchMock = {
    set: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    commit: vi.fn().mockResolvedValue(true)
  };
  
  const docMock = {
    get: vi.fn(),
    ref: 'mock-ref'
  };
  
  const collectionMock = {
    get: vi.fn()
  };

  const dbMock = {
    doc: vi.fn(() => docMock),
    collection: vi.fn(() => collectionMock),
    batch: vi.fn(() => batchMock)
  };

  return {
    initializeApp: vi.fn(),
    firestore: Object.assign(vi.fn(() => dbMock), {
      FieldValue: {
        serverTimestamp: vi.fn(() => 'mock-timestamp')
      }
    })
  };
});

const admin = require('firebase-admin');
const { gameweekCalculationService } = require('./gameweekCalculationService');

describe('gameweekCalculationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process gameweek successfully when no active users found', async () => {
    const db = admin.firestore();
    
    // Mock responses for Rules
    db.doc().get.mockResolvedValue({ data: () => ({}) }); 
    
    // Mock responses for Players and Users
    db.collection().get.mockResolvedValue({ 
      forEach: () => {}, 
      docs: [] 
    }); 
    
    const result = await gameweekCalculationService.processGameweek('gw-1');
    
    expect(result).toBe(true);
    // Even with no users, it should update the gameweek status to 'completed'
    expect(db.batch().commit).toHaveBeenCalled();
    expect(db.batch().set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: 'completed' }),
      { merge: true }
    );
  });
});
