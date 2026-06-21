import { runAutoFillEngine } from './AutoFillOrchestrator';

self.onmessage = (e) => {
    try {
        const { marketPlayers, mySquad, formation, budgetLeft, effectiveBudget } = e.data;
        const result = runAutoFillEngine({
            marketPlayers,
            mySquad,
            formation,
            budgetLeft,
            effectiveBudget
        });
        self.postMessage({ type: 'SUCCESS', result });
    } catch (error) {
        self.postMessage({ type: 'ERROR', message: error.message });
    }
};
