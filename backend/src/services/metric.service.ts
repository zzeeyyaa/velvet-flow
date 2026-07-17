import {
    STRATEGIES,
    findAllTicketsWithStock,
    getRedisStock,
    getOrderAggregateByStrategy,
    countAllOrders,
} from "../repositories/metric.repository";
import type { Strategy } from "../repositories/metric.repository";

export interface StrategyMetric {
    strategy: Strategy;
    totalOrders: number;
    totalTicketsSold: number;
    successOrders: number;
    failedOrders: number;
}

export interface TicketMetric {
    ticketId: string;
    stockInDb: number;
    stockInRedis: number | null;
    isActive: boolean;
    totalCapacity: number;
}

export interface LiveMetric {
    perStrategy: StrategyMetric[];
    tickets: TicketMetric[];
    totalOrders: number;
}

export const getMetricLive = async (): Promise<LiveMetric> => {
    const tickets = await findAllTicketsWithStock();

    const ticketMetrics: TicketMetric[] = await Promise.all(
        tickets.map(async (ticket) => ({
            ticketId: ticket.id as string,
            stockInDb: ticket.stock as number,
            stockInRedis: await getRedisStock(ticket.id as string),
            isActive: ticket.is_active as boolean,
            totalCapacity: ticket.total_capacity as number,
        }))
    );

    const perStrategy: StrategyMetric[] = await Promise.all(
        STRATEGIES.map(async (strategy) => {
            const result = await getOrderAggregateByStrategy(strategy);
            return {
                strategy,
                totalOrders: result.total_orders,
                totalTicketsSold: result.total_tickets_sold,
                successOrders: result.success_orders,
                failedOrders: result.failed_orders,
            };
        })
    );

    const totalOrders = await countAllOrders();

    return { perStrategy, tickets: ticketMetrics, totalOrders };
}