import { Context } from "hono";
import { sendError, sendSuccess } from "../utils/response";
import { AppError } from "../utils/app_errors";
import { getMetricLive as getMetricLiveService } from "../services/metric.service";

export const getMetricLive = async (c: Context) => {
    try {
        const result = await getMetricLiveService();
        return sendSuccess(c, result, "Live metrics fetched successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}