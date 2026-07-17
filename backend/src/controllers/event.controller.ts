import { Context } from "hono";
import { AppError } from "../utils/app_errors";
import { createEvent, deleteEvent, getDetailEvent, getListEvent, updateEvent } from "../services/event.service";
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
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    try {
        const result = await getListEvent(page, limit);
        return sendSuccess(c, result, "Event list fetched successfully", 200);
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

export const updateEventbyId = async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "Event id is required.", 400);
    }
    try {
        const { name, description, sale_starts_at, status } = await c.req.json();
        const event = await updateEvent(id, name, description, new Date(sale_starts_at), status);
        return sendSuccess(c, event, "Event updated successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}

export const deleteEventById = async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "Event id is required.", 400);
    }
    try {
        const event = await deleteEvent(id);
        return sendSuccess(c, event, "Event deleted successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}