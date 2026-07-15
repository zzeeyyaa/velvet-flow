import { sql } from "../db"
import { AppError } from "../utils/app_errors";
import { getOffset } from "../utils/pagination";

export const getListOrder = async (page = 1, limit = 10, lock_strategy?: string) => {
    try {
        const offset = getOffset(page, limit);
        // Contoh jika status juga perlu difilter
        const filter = lock_strategy && status
            ? sql`WHERE lock_strategy = ${lock_strategy} AND status = ${status}`
            : lock_strategy
                ? sql`WHERE lock_strategy = ${lock_strategy}`
                : status
                    ? sql`WHERE status = ${status}`
                    : sql``;

        const listOrder = await sql`SELECT * FROM orders ${filter} LIMIT ${limit} OFFSET ${offset}`;
        if (listOrder.length <= 0) {
            throw new AppError(404, "Orders not found.");
        }
        return listOrder;
    } catch (error) {
        console.log(error);
        throw new AppError(500, "Failed to fetch orders.");
    }
}

export const getDetailOrder = async (id: string) => {
    try {
        const [detailOrder] = await sql`SELECT * FROM orders WHERE id = ${id}`;
        if (!detailOrder) {
            throw new AppError(404, "Order not found.");
        }
        return detailOrder;
    } catch (error) {
        console.log(error)
        throw new AppError(500, "Failed to fetch detail order.")
    }
}

export const updateStatusOrder = async (id: string, status: string) => {
    try {
        const [updateOrder] = await sql`UPDATE orders SET status = ${status} WHERE id = ${id} RETURNING *`;
        if (!updateOrder) {
            throw new AppError(404, "Order not found.");
        }
        return updateOrder;
    } catch (error) {
        console.log(error)
        throw new AppError(500, "Failed to update the order")
    }

}
