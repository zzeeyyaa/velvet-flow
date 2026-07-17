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
import { sendError, sendSuccess } from "../utils/response";

export const listTickets = async (c: Context) => {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    try {
        const result = await getListTicket(page, limit);
        return sendSuccess(c, result, "Ticket list fetched successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
};

export const detailTicket = async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "Ticket id is required.", 400);
    }
    try {
        const ticket = await getDetailTicket(id);
        return sendSuccess(c, ticket, "Ticket details fetched successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
};

export const addTicket = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { name, event_id, category_id, total_capacity, price } = body;

        if (!name || !event_id || !category_id || !total_capacity || !price) {
            return sendError(c, "All fields are required.", 400);
        }

        const ticket = await createTicket(name, event_id, category_id, Number(total_capacity), Number(price));
        return sendSuccess(c, ticket, "Ticket created successfully", 201);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
};

export const bookTicket = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { ticket_id, simulated_user_id, quantity, strategy, idempotency_key } = body;

        // Ambil strategy alternatif dari header jika body.strategy kosong
        const selectedStrategy = strategy || c.req.header("x-lock-strategy") || "vulnerable";

        let result;

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
                return sendError(c, "Invalid strategy.", 400);
        }

        return sendSuccess(c, { data: result, strategy: selectedStrategy }, "Ticket booked successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
};