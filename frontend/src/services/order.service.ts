import { fetchApi } from "@/lib/apiClient"
import { BaseResponse, EventData, OrderData, OrderStatus } from "@/types/api"

export const getOrders = async () => {
    return fetchApi<BaseResponse<OrderData[]>>('/orders');
}

export const getOrderById = async (id: string) => {
    return fetchApi<BaseResponse<OrderData>>(`/orders/${id}`);
}

export const updateStatusOrder = async (id: string, status: OrderStatus) => {
    return fetchApi<BaseResponse<OrderData>>(`/orders/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(status)
        }
    )

}