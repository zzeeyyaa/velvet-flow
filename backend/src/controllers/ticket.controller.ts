import { Context } from "hono";
import {
    buyTicketResilient,
    buyTicketSemiResilient,
    buyTicketVulnerable,
    createTicket,
    getDetailTicket,
    getListTicket,
} from "../services/ticket.service";
import { AppError } from "../utils/app_errors";

export const listTickets = async (c: Context) => {
    const tickets = await getListTicket();
    return c.json({
        success: true,
        data: tickets,
    });
};

export const detailTicket = async (c: Context) => {
    const id = c.req.param("id");
    const ticket = await getDetailTicket(`${id}`);
    return c.json({
        success: true,
        data: ticket,
    });
};

export const addTicket = async (c: Context) => {
    const body = await c.req.json();
    const { name, event_id, category_id, total_capacity, price } = body;

    if (!name || !event_id || !category_id || !total_capacity || !price) {
        throw new AppError(400, "Semua field wajib diisi.", "MISSING_FIELDS");
    }

    const ticket = await createTicket(name, event_id, category_id, Number(total_capacity), Number(price));
    return c.json({
        success: true,
        data: ticket,
    }, 201);
};

export const bookTicket = async (c: Context) => {
    // Ambil payload body dari request
    const body = await c.req.json();
    const { ticket_id, simulated_user_id, quantity, strategy, idempotency_key } = body;

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
            result = await buyTicketResilient(ticket_id, quantity, simulated_user_id, idempotency_key);
            break;
        default:
            throw new AppError(400, "Invalid strategy");
    }

    return c.json({
        success: true,
        data: result,
        strategy: selectedStrategy,
    });
};