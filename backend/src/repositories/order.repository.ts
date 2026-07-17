import { sql } from "../db"

export const findAllOrders = async (limit: number, offset: number, lock_strategy?: string, status?: string) => {
    // Contoh jika status juga perlu difilter
    const filter = lock_strategy && status
        ? sql`WHERE lock_strategy = ${lock_strategy} AND status = ${status}`
        : lock_strategy
            ? sql`WHERE lock_strategy = ${lock_strategy}`
            : status
                ? sql`WHERE status = ${status}`
                : sql``;

    const listOrder = await sql`SELECT * FROM orders ${filter} LIMIT ${limit} OFFSET ${offset}`;
    return listOrder;
}

export const countOrders = async (lock_strategy?: string, status?: string) => {
    const filter = lock_strategy && status
        ? sql`WHERE lock_strategy = ${lock_strategy} AND status = ${status}`
        : lock_strategy
            ? sql`WHERE lock_strategy = ${lock_strategy}`
            : status
                ? sql`WHERE status = ${status}`
                : sql``;

    const [result] = await sql`SELECT COUNT(*)::int AS total FROM orders ${filter}`;
    return result.total;
}

export const findOrderById = async (id: string) => {
    const [detailOrder] = await sql`SELECT * FROM orders WHERE id = ${id}`;
    return detailOrder;
}

export const updateOrderStatus = async (id: string, status: string) => {
    const [updateOrder] = await sql`UPDATE orders SET status = ${status} WHERE id = ${id} RETURNING *`;
    return updateOrder;
}
