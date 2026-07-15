import { Context } from "hono";
import { AppError } from "../utils/app_errors";
import { createEvent, getListEvent } from "../services/event.service";
import { sendSuccess } from "../utils/response";

export const addEvent = async (c: Context) => {
    try {
        const { name, description, sale_starts_at } = await c.req.json();
        const event = await createEvent(name, description, new Date(sale_starts_at));
        return sendSuccess(c, event, "Event created successfully", 201);
    } catch (error) {
        console.log(error)
        throw new AppError(500, "Internal server error occured.")
    }
}

export const listEvent = async (c: Context) => {
    try {
        const event = await getListEvent();
        return sendSuccess(c, event, "Event list fetch successfully", 200);
    } catch (error) {
        console.log(error);
        throw new AppError(500, "Internal server error occured.")
    }
}