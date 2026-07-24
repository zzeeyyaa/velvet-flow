import { insertCategory, findAllCategory, countCategories, softDeleteCategoryById, updateCategoryById } from "../repositories/category.repository";
import { AppError } from "../utils/app_errors";
import { getOffset, buildPagination } from "../utils/pagination";

export const createCategory = async (
    name: string,
    description: string
) => {
    const newCategory = await insertCategory(name, description);
    if (!newCategory) {
        throw new AppError(500, "Failed to create category.");
    }
    return newCategory;
}

export const getListCategory = async (page = 1, limit = 10) => {
    const offset = getOffset(page, limit);
    const [listCategory, total] = await Promise.all([
        findAllCategory(limit, offset),
        countCategories(),
    ]);

    if (!listCategory || listCategory.length <= 0) {
        throw new AppError(404, "List category not found.");
    }

    return {
        data: listCategory,
        pagination: buildPagination(total, page, limit),
    };
}

export const deleteCategory = async (id: string) => {
    const deleted = await softDeleteCategoryById(id);
    if (!deleted) {
        throw new AppError(404, "Category not found.");
    }
    return deleted;
}

export const updateCategory = async (id: string, name?: string | null, description?: string | null) => {
    const updatedCategory = await updateCategoryById(id, name, description);
    if (!updatedCategory) {
        throw new AppError(404, "Category not found.");
    }
    return updatedCategory;

}