import { redis } from "../cache";
import { sql } from "../db"

const STRATEGIES = ['vulnerable', 'semi_resilient', 'resilient'] as const;
type Strategy = typeof STRATEGIES[number];

export interface StrategyMetric {
    strategy: Strategy;
    totalOrders: number;
    totalTicketsSold: number;
    successOrders: number;
    failedOrders: number;
}

export interface LiveMetric {
    perStrategy: StrategyMetric[];
    tickets: {
        ticketId: string;
        stockInDb: number;
        stockInRedis: number | null;
        isActive: boolean;
        totalCapacity: number;
    }[];
    totalOrders: number;
}

export const getMetricLive = async (): Promise<LiveMetric> => {
    // 1. Ambil semua tiket dari DB
    const tickets = await sql`
        SELECT id, stock, total_capacity, is_active
        FROM tickets
    `;

    // 2. Untuk setiap tiket, ambil stok dari Redis (disimpan sebagai Hash dengan field 'stock')
    const ticketMetrics = await Promise.all(
        tickets.map(async (ticket) => {
            const redisStock = await redis.hget(ticket.id, 'stock');
            return {
                ticketId: ticket.id as string,
                stockInDb: ticket.stock as number,
                stockInRedis: redisStock !== null ? parseInt(redisStock) : null,
                isActive: ticket.is_active as boolean,
                totalCapacity: ticket.total_capacity as number,
            };
        })
    );

    // 3. Ambil metrik per strategi dari tabel orders
    const perStrategy = await Promise.all(
        STRATEGIES.map(async (strategy) => {
            const [result] = await sql`
                SELECT
                    COUNT(*)                                                          AS total_orders,
                    COALESCE(SUM(quantity), 0)                                        AS total_tickets_sold,
                    COUNT(*) FILTER (WHERE status = 'SUCCESS')                        AS success_orders,
                    COUNT(*) FILTER (WHERE status = 'FAILED')                         AS failed_orders
                FROM orders
                WHERE lock_strategy = ${strategy}
            `;

            return {
                strategy,
                totalOrders:      parseInt(result.total_orders),
                totalTicketsSold: parseInt(result.total_tickets_sold),
                successOrders:    parseInt(result.success_orders),
                failedOrders:     parseInt(result.failed_orders),
            } satisfies StrategyMetric;
        })
    );

    // 4. Total semua order
    const [totalResult] = await sql`SELECT COUNT(*) AS total FROM orders`;

    return {
        perStrategy,
        tickets: ticketMetrics,
        totalOrders: parseInt(totalResult.total),
    };
};