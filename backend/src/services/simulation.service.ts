import { redis } from "../cache";
import { resetSimulationRepo } from "../repositories/simulation.repository";
import { AppError } from "../utils/app_errors";

export const resetSimulation = async () => {
    try {
        const reset = await resetSimulationRepo();
        await redis.flushall();
        return reset;
    } catch (error) {
        console.log(error);
        throw new AppError(500, "Failed to reset simulation.");
    }
}