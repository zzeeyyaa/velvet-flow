import { sql } from "../db";

export const resetSimulationRepo = async () => {
    await sql`TRUNCATE TABLE orders CASCADE`;
    await sql`TRUNCATE TABLE simulated_users CASCADE`;
    await sql`UPDATE tickets SET stock = total_capacity, is_active = TRUE`;

}