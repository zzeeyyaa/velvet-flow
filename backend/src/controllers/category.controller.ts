import { Context } from "hono";
import { AppError } from "../utils/app_errors";
import { createCategory, getListCategory, deleteCategory as deleteCategoryService } from "../services/category.service";
import { sendError, sendSuccess } from "../utils/response";

export const addCategory = async (c: Context) => {
    try {
        const { name, description } = await c.req.json();
        if (!name || !description) {
            return sendError(c, "All fields are required.", 400);
        }
        const category = await createCategory(name, description);
        return sendSuccess(c, category, "Category created successfully", 201);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}

export const listCategory = async (c: Context) => {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    try {
        const result = await getListCategory(page, limit);
        return sendSuccess(c, result, "Category list fetched successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}

export const deleteCategory = async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
        return sendError(c, "Category id is required.", 400);
    }
    try {
        const category = await deleteCategoryService(id);
        return sendSuccess(c, category, "Category deleted successfully", 200);
    } catch (error: any) {
        console.error(error);
        if (error instanceof AppError) {
            return sendError(c, error.message, error.statusCode);
        }
        return sendError(c, "Internal server error occurred.", 500);
    }
}