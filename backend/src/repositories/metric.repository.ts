import { redis } from "../cache";
import { sql } from "../db"

const STRATEGIES = ['vulnerable', 'semi_resilient', 'resilient'] as const;
export type Strategy = typeof STRATEGIES[number];

export { STRATEGIES };

export const findAllTicketsWithStock = async () => {
    return await sql`
        SELECT id, stock, total_capacity, is_active
        FROM tickets
    `;
}

export const getRedisStock = async (ticketId: string): Promise<number | null> => {
    const stock = await redis.hget(ticketId, 'stock');
    return stock !== null ? parseInt(stock) : null;
}

export const getOrderAggregateByStrategy = async (strategy: Strategy) => {
    const [result] = await sql`
        SELECT
            COUNT(*)::int                                    AS total_orders,
            COALESCE(SUM(quantity), 0)::int                  AS total_tickets_sold,
            COUNT(*) FILTER (WHERE status = 'SUCCESS')::int  AS success_orders,
            COUNT(*) FILTER (WHERE status = 'FAILED')::int   AS failed_orders
        FROM orders
        WHERE lock_strategy = ${strategy}
    `;
    return result;
}

export const countAllOrders = async (): Promise<number> => {
    const [result] = await sql`SELECT COUNT(*)::int AS total FROM orders`;
    return result.total;
}
