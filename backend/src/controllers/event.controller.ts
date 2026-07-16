import { Context } from "hono";
import { AppError } from "../utils/app_errors";
import { createEvent, getDetailEvent, getListEvent } from "../services/event.service";
import { sendError, sendSuccess } from "../utils/response";

export const addEvent = async (c: Context) => {
    try {
        const { name, description, sale_starts_at } = await c.req.json();
        const event = await createEvent(name, description, new Date(sale_starts_at));
        return sendSuccess(c, event, "Event created successfully", 201);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}

export const listEvent = async (c: Context) => {
    try {
        const events = await getListEvent();
        return sendSuccess(c, events, "Event list fetched successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}

export const detailEvent = async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "Event id is required.", 400);
    }
    try {
        const detailEvent = await getDetailEvent(id);
        return sendSuccess(c, detailEvent, "Event details fetched successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}