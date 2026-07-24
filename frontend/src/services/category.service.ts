import { fetchApi } from "@/lib/apiClient"
import { BaseResponse, CategoryData } from "@/types/api"

export const getCategories = async () => {
    return fetchApi<BaseResponse<CategoryData[]>>("/categories");
}

export const createCategory = async (category: CategoryData) => {
    return fetchApi<BaseResponse<CategoryData>>('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
    });
}

export const deleteCategory = async (id: string) => {
    return fetchApi<BaseResponse<CategoryData>>(`/categories/${id}`, {
        method: "DELETE",
    });
}

export const updateCategory = async (id: string, category: CategoryData) => {
    return fetchApi<BaseResponse<CategoryData>>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(category),
    });
}