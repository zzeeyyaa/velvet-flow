import { luaBookingScriptSha, redis } from "../cache";
import { sql } from "../db";
import { AppError } from "../utils/app_errors";

export const createTicket = async (
    name: string,
    event_id: string,
    category_id: string,
    total_capacity: number,
    price: number
) => {
    const is_active = true;
    const [newTicket] = await sql`INSERT INTO tickets (
        name,
        event_id,
        category_id,
        total_capacity,
        price,
        stock,
        is_active
    ) VALUES (${name}, ${event_id}, ${category_id}, ${total_capacity}, ${price}, ${total_capacity}, ${is_active}) RETURNING *`;
    if (!newTicket) {
        throw new AppError(500, "Failed to create ticket.");
    }
    return newTicket;
}

export const getListTicket = async () => {
    const [tickets] = await sql`SELECT * FROM tickets`;
    if (!tickets) {
        throw new AppError(500, "Failed to fetch tickets.");
    }
    return tickets;
}

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
    var is_active = ticket.is_active;
    if (stock < quantity || !is_active) {
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
            var is_active = ticket.is_active;
            // 2. Validasi Stock
            if (currentStock < quantity || !is_active) {
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

export const buyTicketResilient = async (ticketId: string, quantity: number, simulatedUserId: string, idempotencyKey?: string) => {
    // Validasi quantity (tidak boleh kurang dari atau sama dengan 0)
    if (!quantity || quantity <= 0) {
        throw new AppError(400, "Jumlah Tiket Tidak Valid", "INVALID_QUANTITY");
    }

    // 0. Idempotency Check via Redis SETNX (Mencegah Double-Booking)
    if (idempotencyKey) {
        const lockKey = `idemp:${simulatedUserId}:${idempotencyKey}`;
        // Set key hanya jika belum ada (NX), dengan waktu kedaluwarsa 2000 ms (PX 2000)
        const lockResult = await redis.set(lockKey, 'locked', 'PX', 2000, 'NX');
        
        if (!lockResult) {
            // Nilai null berarti key sudah ada -> Request duplikat/dobel klik terdeteksi
            throw new AppError(409, "Permintaan sedang diproses. Jangan klik 2 kali.", "DOUBLE_BOOKING_PREVENTED");
        }
    }

    // 1. Eksekusi Lua Script di Redis (Atomic check-and-decrement)
    const result = await redis.evalsha(luaBookingScriptSha, 1, ticketId, quantity);

    // Cek Hasil dari Redis
    // Jika -1 artinya stok habis ATAU tiket dinonaktifkan (karena Lua script kita mengecek is_active)
    if (result === -1) {
        throw new AppError(400, "Tiket tidak tersedia atau stok habis", "TICKET_UNAVAILABLE");
    }

    try {
        // 2. Simpan ke Postgres dalam SATU Transaksi (Gagal satu, batal semua)
        await sql.begin(async (tx) => {
            // Catat Order (Termasuk idempotency_key sebagai rekam jejak)
            await tx`INSERT INTO orders
            ${tx({ 
                ticket_id: ticketId, 
                simulated_user_id: simulatedUserId, 
                quantity,
                idempotency_key: idempotencyKey || null,
                lock_strategy: 'resilient'
            })}`;

            // Sinkronisasi Sisa Stok
            await tx`UPDATE tickets
            SET stock = stock - ${quantity}
            WHERE id = ${ticketId}`;
        });

        return {
            message: "Tiket berhasil didapat",
        };
    } catch (error) {
        // 🚨 COMPENSATING TRANSACTION (ROLLBACK REDIS) 🚨
        // Jika insert/update PostgreSQL gagal (timeout/db down), kita WAJIB mengembalikan stok di Redis.
        // HINCRBY dengan nilai positif digunakan untuk membatalkan pengurangan sebelumnya.
        console.log('Error SQL Insert (Initiating Redis Rollback):', error);

        try {
            await redis.hincrby(ticketId, 'stock', quantity);
            console.log(`Rollback Redis berhasil untuk tiket ${ticketId}`);
        } catch (redisError) {
            // Critical Error: Postgres mati dan Redis juga gagal di-rollback!
            console.error('CRITICAL: Gagal rollback Redis (Ghost Stock terjadi)!', redisError);
        }

        // Jika errornya adalah AppError buatan kita sendiri (meski di blok ini jarang terjadi)
        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(500, 'Internal Server Error');
    }
};