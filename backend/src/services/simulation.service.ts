import { redis } from "../cache";
import { sql } from "../db";
import { AppError } from "../utils/app_errors";

export const resetSimulation = async () => {
    try {
        await sql`TRUNCATE TABLE orders CASCADE`;
        await sql`TRUNCATE TABLE simulated_users CASCADE`;
        await sql`UPDATE tickets SET stock = total_capacity, is_active = TRUE`;
        await redis.flushall();
        return {
            message: "Reset simulation successfully.",
        };
    } catch (error) {
        console.log(error);
        throw new AppError(500, "Failed to reset simulation.");
    }
}