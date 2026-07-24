// Interface umum untuk format response standard dari Backend Hono
export interface BaseResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

// Interface untuk data balasan saat kita berhasil beli tiket
export interface OrderData {
    order_id: string;
    event_id: string;
    quantity: number;
    status: string;
}

export type OrderStatus = "pending" | "success" | "failed";

// Interface untuk data balasan saat simulasi load test selesai
export interface SimulationData {
    total_processed: number;
    successful_orders: number;
    failed_orders: number;
    duration_ms: number;
}

export interface EventData {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    price: number;
    available_tickets: number;
}

export type Strategy = "vulnerable" | "semi_resilient" | "resilient";

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