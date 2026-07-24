import { fetchApi } from "../lib/apiClient";

export const ticketService = {
    buyTicket: async (eventId: string, quantity: number) => {
        return fetchApi('/orders', {
            method: "POST",
            body: JSON.stringify({ event_id: eventId, quantity }),
        });
    }
};
