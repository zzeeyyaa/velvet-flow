import { sql } from "../db";
import { AppError } from "../utils/app_errors";

export const createCategory = async (
    name: string,
    description: string

) => {
    const [newCategory] = await sql`INSERT INTO categories (name, description) VALUES (${name}, ${description}) RETURNING *`;
    if (!newCategory) {
        throw new AppError(500, "Failed to create category.");
    }
    return newCategory;
}

export const getListCategory = async () => {
    const listCategory = await sql`SELECT * FROM categories`;
    if (!listCategory || listCategory.length <= 0) {
        throw new AppError(404, "List category not found.");
    }
    return listCategory;
}

export const deleteCategory = async (id: string) => {
    try {
        const [deleteCategory] = await sql`UPDATE categories SET status = 'DELETED' WHERE id = ${id} RETURNING *`;
        if (!deleteCategory) {
            throw new AppError(404, "Category not found.");
        }
        return deleteCategory;
    } catch (error) {
        console.log(error)
        throw new AppError(500, "Failed to delete category")
    }
}