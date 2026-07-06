import { Context } from "hono";

/**
 * Mengirimkan response sukses yang terstandarisasi untuk Hono
 * @param c Context dari Hono handler
 * @param data Data payload yang akan dikirim ke klien
 * @param statusCode HTTP Status Code (default: 200)
 */
export const sendSuccess = (c: Context, data: any, statusCode: number = 200) => {
    return c.json(
        {
            success: true,
            data,
        },
        statusCode as any
    );
};

/**
 * Mengirimkan response error yang terstandarisasi untuk Hono
 * @param c Context dari Hono handler
 * @param error Error object yang akan dikirim ke klien
 * @param statusCode HTTP Status Code (default: 500)
 */
export const sendError = (c: Context, error: any, statusCode: number = 500) => {
    return c.json(
        {
            success: false,
            error,
        },
        statusCode as any
    );
};
