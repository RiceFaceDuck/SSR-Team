```javascript
const { db } = require('../config/firebaseAdmin');

/**
 * AI Snippet: Safe Firestore Transaction (For Economy/Critical Data)
 * Always use this pattern for modifying Balls or critical stats.
 */
exports.runSafeTransaction = async (docId, updateLogic) => {
  const docRef = db.collection('your_collection').doc(docId);

  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) {
        throw new Error("Document does not exist!");
      }

      const data = doc.data();
      // TODO: Perform validation (e.g., check if user has enough Balls)
      // if (data.balls < cost) throw new Error("Insufficient balls");

      // TODO: Calculate new values
      const newUpdates = updateLogic(data);

      transaction.update(docRef, newUpdates);
      return { success: true, updatedData: newUpdates };
    });
    
    return result;
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw error;
  }
};
```
