import { luaBookingScriptSha, redis } from "../cache";
import { sql } from "../db";
import { AppError } from "../utils/app_errors";

export const buyTicketVulnerable = async (ticketId: string, quantity: number, simulatedUserId: string) => {
    // Validasi Input (Minimal harus ada Quantity)
    if (!quantity || quantity <= 0) {
        throw new AppError(400, "Jumlah Tiket Tidak Valid", "INVALID_QUANTITY");
    }

    // Cek Stok Awal di Database
    const [ticket] = await sql`SELECT stock FROM tickets WHERE id = ${ticketId}`;

    if (!ticket) {
        throw new AppError(400, "Tiket tidak ditemukan", "TICKET_NOT_FOUND");
    }

    var stock = ticket?.stock ?? 0;

    if (stock < quantity) {
        throw new AppError(400, "Stok habis", "STOCK_EXHAUSTED");
    }
    stock -= quantity

    //Simpan ke db
    try {
        // Simpan Order di PostgreSQL
        await sql`INSERT INTO orders
        ${sql({ ticket_id: ticketId, simulated_user_id: simulatedUserId, quantity })}`
        // Simpan new stock di PostgreSQL
        await sql`UPDATE tickets
        SET stock = ${stock}
        WHERE id = ${ticketId}`
    } catch (error) {
        console.log('Error SQL Insert', error)
        throw new AppError(500, 'Internal Server Error')
    }

    return {
        message: "Tiket berhasil didapat",
    };
};

export const buyTicketSemiResilient = async (ticketId: string, quantity: number, simulatedUserId: string) => {
    // Validasi Input (Minimal harus ada Quantity)
    if (!quantity || quantity <= 0) {
        throw new AppError(400, "Jumlah Tiket Tidak Valid", "INVALID_QUANTITY");
    }

    try {
        // Mulai Transaksi
        const result = await sql.begin(async (tx) => {
            // 1. Baca stok dengan kunci (FOR UPDATE)
            // Ini yang dinamakan "gembok", request lain harus menunggu sampai transaksi ini selesai
            const [ticket] = await tx`
                SELECT stock FROM tickets 
                WHERE id = ${ticketId} 
                FOR UPDATE
            `;

            if (!ticket) {
                throw new AppError(400, "Tiket tidak ditemukan", "TICKET_NOT_FOUND");
            }

            const currentStock = ticket.stock;

            // 2. Validasi Stock
            if (currentStock < quantity) {
                throw new AppError(400, "Stok habis", "STOCK_EXHAUSTED");
            }

            const newStock = currentStock - quantity;

            // 3. Simpan Order di PostgreSQL (menggunakan tx, bukan sql)
            await tx`INSERT INTO orders
            ${tx({ ticket_id: ticketId, simulated_user_id: simulatedUserId, quantity })}`

            // 4. Simpan new stock di PostgreSQL (menggunakan tx, dan nama kolom stock huruf kecil)
            await tx`UPDATE tickets
            SET stock = ${newStock}
            WHERE id = ${ticketId}`

            return {
                message: "Tiket berhasil didapat",
            };
        });

        return result;

    } catch (error) {
        console.log('Error SQL Transaction:', error);
        // Jika ada error (termasuk AppError), postgres.js akan otomatis melakukan ROLLBACK (gembok dilepas)
        throw error;
    }
};

export const buyTicketResilient = async (ticketId: string, quantity: number, simulatedUserId: string) => {
    // Validasi quantity (tidak boleh kurang dari atau sama dengan 0)
    if (!quantity || quantity <= 0) {
        throw new AppError(400, "Jumlah Tiket Tidak Valid", "INVALID_QUANTITY");
    }

    try {
        // 1. Eksekusi Lua Script di Redis (langsung potong stock secara atomic di memori RAM)
        const result = await redis.evalsha(luaBookingScriptSha, 1, ticketId, quantity)

        // Cek Hasil dari Redis
        // Jika -1 artinya stok tidak cukup
        if (result === -1) {
            throw new AppError(400, "Stok habis", "STOCK_EXHAUSTED");
        }

        // 2. Simpan order ke Postgres (database permanen)
        // Kita tidak memakai redis.hset karena riwayat pembelian resmi harus dicatat di PostgreSQL
        await sql`INSERT INTO orders
        ${sql({ ticket_id: ticketId, simulated_user_id: simulatedUserId, quantity })}`;

        // 3. Sinkronisasikan sisa stok ke Postgres (opsional tapi disarankan di blueprint)
        // Agar data stok di PostgreSQL tetap sama dengan stok di Redis
        await sql`UPDATE tickets
        SET stock = stock - ${quantity}
        WHERE id = ${ticketId}`;

        return {
            message: "Tiket berhasil didapat",
        };
    } catch (error) {
        // Jika errornya adalah AppError buatan kita sendiri (misal STOCK_EXHAUSTED)
        // Langsung lempar kembali agar tidak tertutup menjadi error 500
        if (error instanceof AppError) {
            throw error;
        }

        console.log('Error Redis or SQL Insert:', error);
        throw new AppError(500, 'Internal Server Error');
    }
};