import { Context } from "hono";
import { sendError, sendSuccess } from "../utils/response";
import { AppError } from "../utils/app_errors";
import {
    getDetailOrder as getDetailOrderService,
    getListOrder as getListOrderService,
    updateStatusOrder as updateStatusOrderService,
} from "../services/order.service";

export const getListOrder = async (c: Context) => {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;
    const lock_strategy = c.req.query("lock_strategy");
    const status = c.req.query("status");

    try {
        const result = await getListOrderService(page, limit, lock_strategy, status);
        return sendSuccess(c, result, "Order list fetched successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}

export const getDetailOrder = async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "id must be provided.", 400);
    }

    try {
        const order = await getDetailOrderService(id);
        return sendSuccess(c, order, "Order details fetched successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}

export const updateStatusOrder = async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "id must be provided.", 400);
    }

    try {
        const { status } = await c.req.json();
        if (!status) {
            return sendError(c, "status is required.", 400);
        }
        const order = await updateStatusOrderService(id, status);
        return sendSuccess(c, order, "Order status updated successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}