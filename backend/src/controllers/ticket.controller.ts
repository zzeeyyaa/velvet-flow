import { Context } from "hono";
import { buyTicketResilient, buyTicketSemiResilient, buyTicketVulnerable } from "../services/ticket.service";
import { AppError } from "../utils/app_errors";

export const bookTicket = async (c: Context) => {
    // Ambil payload body dari request
    const body = await c.req.json();
    const { ticket_id, simulated_user_id, quantity, strategy } = body;

    // Ambil strategy alternatif dari header jika body.strategy kosong
    const selectedStrategy = strategy || c.req.header("x-lock-strategy") || "vulnerable";

    let result;

    // Eksekusi logic sesuai strategy
    switch (selectedStrategy) {
        case "vulnerable":
            result = await buyTicketVulnerable(ticket_id, quantity, simulated_user_id);
            break;
        case "semi_resilient":
            result = await buyTicketSemiResilient(ticket_id, quantity, simulated_user_id);
            break;
        case "resilient":
            result = await buyTicketResilient(ticket_id, quantity, simulated_user_id);
            break;
        default:
            throw new AppError(400, "Invalid strategy");
    }

    return c.json({
        data: result,
        strategy: selectedStrategy,
    })
}