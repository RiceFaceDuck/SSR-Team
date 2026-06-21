const { z } = require('zod');
const functions = require('firebase-functions');

/**
 * Higher-order function to validate input data before executing a Cloud Function handler.
 * @param {z.ZodSchema} schema - The Zod schema to validate against.
 * @param {Function} handler - The actual function logic (async (data, context) => {...})
 */
const withValidation = (schema, handler) => {
    return async (data, context) => {
        try {
            // Validate data
            schema.parse(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                throw new functions.https.HttpsError('invalid-argument', `Validation failed: ${errorMessage}`);
            }
            throw new functions.https.HttpsError('internal', 'Internal validation error');
        }

        // Run the original handler
        return handler(data, context);
    };
};

module.exports = {
    withValidation
};
