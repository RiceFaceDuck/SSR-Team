const functions = require('firebase-functions');

const BASE_URL = 'https://v3.football.api-sports.io';

const fetchApiFootballData = functions.https.onCall(async (data, context) => {
    // Both frontend (normal users) and admin dashboard need fixtures and player stats
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }

    const { endpoint, params = {} } = data;
    
    if (!endpoint) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing endpoint parameter.');
    }

    // Retrieve API Key from Firebase Config or Environment Variables
    const apiKey = process.env.API_FOOTBALL_KEY || functions.config().apifootball?.key || '73f575c169c87a030e5412387f2d3239'; 

    try {
        const queryParams = new URLSearchParams(params).toString();
        const url = `${BASE_URL}${endpoint}${queryParams ? '?' + queryParams : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-apisports-key': apiKey,
                'x-rapidapi-host': 'v3.football.api-sports.io',
            },
        });

        const result = await response.json();

        if (result.errors && Object.keys(result.errors).length > 0) {
            throw new Error(Object.values(result.errors)[0]);
        }

        return {
            response: result.response || [],
            paging: result.paging || { current: 1, total: 1 }
        };
    } catch (error) {
        throw new functions.https.HttpsError('internal', `API Error: ${error.message}`);
    }
});

module.exports = {
    fetchApiFootballData
};
