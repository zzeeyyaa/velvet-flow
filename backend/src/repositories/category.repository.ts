import { sql } from "../db";

export const insertCategory = async (
    name: string,
    description: string
) => {
    const [newCategory] = await sql`INSERT INTO categories (name, description) VALUES (${name}, ${description}) RETURNING *`;
    return newCategory;
}

export const findAllCategory = async (limit: number, offset: number) => {
    const listCategory = await sql`SELECT * FROM categories LIMIT ${limit} OFFSET ${offset}`;
    return listCategory;
}

export const countCategories = async () => {
    const [result] = await sql`SELECT COUNT(*)::int AS total FROM categories`;
    return result.total;
}

export const softDeleteCategoryById = async (id: string) => {
    const [deletedCategory] = await sql`UPDATE categories SET status = 'DELETED' WHERE id = ${id} RETURNING *`;
    return deletedCategory;
}

export const updateCategoryById = async (id: string, name?: string | null, description?: string | null) => {
    const [updatedCategory] = await sql`UPDATE categories
    SET name = COALESCE(${name ?? null}, name), description = COALESCE(${description ?? null}, description) WHERE id=${id} RETURNING *`;
    return updatedCategory;
}