import { Context } from "hono";
import { AppError } from "../utils/app_errors";
import { sendError, sendSuccess } from "../utils/response";
import { resetSimulation as resetSimulationService } from "../services/simulation.service";

export const resetSimulation = async (c: Context) => {
    try {
        const reset = await resetSimulationService();
        return sendSuccess(c, reset, "Reset simulation successfully", 200);
    } catch (error) {
        console.log(error)
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}