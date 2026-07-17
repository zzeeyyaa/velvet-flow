import { fetchApi } from "../lib/apiClient";
import { Strategy } from "../types/api";

export const simulationService = {
    runLoadSimulation: async (ticketId: string, requestsCount: number, strategy: Strategy) => {
        const batchSize = 50;
        let completed = 0;
        const promises = [];

        for (let i = 0; i < requestsCount; i++) {
            const simulatedUserId = `user_sim_${Math.random().toString(36).substring(7)}`;
            const idempotencyKey = `idemp_${Math.random().toString(36).substring(7)}`;
            
            promises.push(
                fetchApi('/tickets/book', {
                    method: "POST",
                    body: JSON.stringify({ 
                        ticket_id: ticketId, 
                        quantity: 1,
                        simulated_user_id: simulatedUserId,
                        strategy,
                        idempotency_key: idempotencyKey
                    }),
                }).catch(() => null) // Ignore individual errors so Promise.all doesn't fail fast
            );

            if (promises.length >= batchSize || i === requestsCount - 1) {
                await Promise.all(promises);
                completed += promises.length;
                promises.length = 0; // clear array
            }
        }
        return completed;
    },

    resetSimulation: async () => {
        return fetchApi('/simulation/reset', {
            method: "POST",
        });
    }
};
