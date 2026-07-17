import { AppError } from "../utils/app_errors";
import { getOffset, buildPagination } from "../utils/pagination";
import { findAllOrders, countOrders, findOrderById, updateOrderStatus } from "../repositories/order.repository";

export const getListOrder = async (page = 1, limit = 10, lock_strategy?: string, status?: string) => {
    const offset = getOffset(page, limit);
    const [listOrder, total] = await Promise.all([
        findAllOrders(limit, offset, lock_strategy, status),
        countOrders(lock_strategy, status),
    ]);

    if (!listOrder || listOrder.length <= 0) {
        throw new AppError(404, "Orders not found.");
    }

    return {
        data: listOrder,
        pagination: buildPagination(total, page, limit),
    };
}

export const getDetailOrder = async (id: string) => {
    const detailOrder = await findOrderById(id);
    if (!detailOrder) {
        throw new AppError(404, "Order not found.");
    }
    return detailOrder;
}

export const updateStatusOrder = async (id: string, status: string) => {
    const updateOrder = await updateOrderStatus(id, status);
    if (!updateOrder) {
        throw new AppError(404, "Order not found.");
    }
    return updateOrder;
}
