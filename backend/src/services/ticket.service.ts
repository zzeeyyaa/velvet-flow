import { luaBookingScriptSha, redis } from "../cache";
import { sql } from "../db";
import { AppError } from "../utils/app_errors";
import { getOffset, buildPagination } from "../utils/pagination";
import {
    insertTicket,
    findAllTickets,
    countTickets,
    findTicketById,
    findTicketStockById,
    findTicketByIdForUpdate,
    insertOrder,
    updateTicketStock,
    decrementTicketStock,
} from "../repositories/ticket.repository";

export const createTicket = async (
    name: string,
    event_id: string,
    category_id: string,
    total_capacity: number,
    price: number
) => {
    const is_active = true;
    const newTicket = await insertTicket(name, event_id, category_id, total_capacity, price, is_active);

    if (!newTicket) {
        throw new AppError(500, "Failed to create ticket.");
    }

    return newTicket;
};

export const getListTicket = async (page = 1, limit = 10) => {
    const offset = getOffset(page, limit);
    const [tickets, total] = await Promise.all([
        findAllTickets(limit, offset),
        countTickets(),
    ]);

    if (!tickets || tickets.length === 0) {
        throw new AppError(404, "No tickets found.");
    }

    return {
        data: tickets,
        pagination: buildPagination(total, page, limit),
    };
};

export const getDetailTicket = async (id: string) => {
    const ticket = await findTicketById(id);

    if (!ticket) {
        throw new AppError(404, "Ticket not found.", "TICKET_NOT_FOUND");
    }

    return ticket;
};

export const buyTicketVulnerable = async (ticketId: string, quantity: number, simulatedUserId: string) => {
    if (!quantity || quantity <= 0) {
        throw new AppError(400, "Jumlah Tiket Tidak Valid", "INVALID_QUANTITY");
    }

    // Cek Stok Awal di Database
    const ticket = await findTicketStockById(ticketId);

    if (!ticket) {
        throw new AppError(400, "Tiket tidak ditemukan", "TICKET_NOT_FOUND");
    }

    const stock = ticket.stock ?? 0;
    const is_active = ticket.is_active;

    if (stock < quantity || !is_active) {
        throw new AppError(400, "Stok habis", "STOCK_EXHAUSTED");
    }

    const newStock = stock - quantity;

    // Simpan ke db (tanpa transaksi — vulnerable by design)
    try {
        await sql.begin(async (tx) => {
            await insertOrder(tx, { 
                ticket_id: ticketId, 
                simulated_user_id: simulatedUserId, 
                quantity,
                lock_strategy: 'vulnerable'
            });
            await updateTicketStock(tx, ticketId, newStock);
        });
    } catch (error) {
        console.error('Error SQL Insert:', error);
        throw new AppError(500, 'Internal Server Error');
    }

    return { message: "Tiket berhasil didapat" };
};

export const buyTicketSemiResilient = async (ticketId: string, quantity: number, simulatedUserId: string) => {
    if (!quantity || quantity <= 0) {
        throw new AppError(400, "Jumlah Tiket Tidak Valid", "INVALID_QUANTITY");
    }

    try {
        // Mulai Transaksi dengan row-level lock (FOR UPDATE)
        const result = await sql.begin(async (tx) => {
            // 1. Baca stok dengan kunci (FOR UPDATE)
            const ticket = await findTicketByIdForUpdate(tx, ticketId);

            if (!ticket) {
                throw new AppError(400, "Tiket tidak ditemukan", "TICKET_NOT_FOUND");
            }

            const currentStock = ticket.stock;
            const is_active = ticket.is_active;

            // 2. Validasi Stock
            if (currentStock < quantity || !is_active) {
                throw new AppError(400, "Stok habis", "STOCK_EXHAUSTED");
            }

            const newStock = currentStock - quantity;

            // 3. Simpan Order
            await insertOrder(tx, { 
                ticket_id: ticketId, 
                simulated_user_id: simulatedUserId, 
                quantity,
                lock_strategy: 'semi_resilient'
            });

            // 4. Update stok
            await updateTicketStock(tx, ticketId, newStock);

            return { message: "Tiket berhasil didapat" };
        });

        return result;
    } catch (error) {
        console.error('Error SQL Transaction:', error);
        // Jika ada error (termasuk AppError), postgres.js akan otomatis melakukan ROLLBACK
        throw error;
    }
};

export const buyTicketResilient = async (ticketId: string, quantity: number, simulatedUserId: string, idempotencyKey?: string) => {
    if (!quantity || quantity <= 0) {
        throw new AppError(400, "Jumlah Tiket Tidak Valid", "INVALID_QUANTITY");
    }

    // 0. Idempotency Check via Redis SETNX (Mencegah Double-Booking)
    if (idempotencyKey) {
        const lockKey = `idemp:${simulatedUserId}:${idempotencyKey}`;
        const lockResult = await redis.set(lockKey, 'locked', 'PX', 2000, 'NX');

        if (!lockResult) {
            throw new AppError(409, "Permintaan sedang diproses. Jangan klik 2 kali.", "DOUBLE_BOOKING_PREVENTED");
        }
    }

    // 1. Eksekusi Lua Script di Redis (Atomic check-and-decrement)
    const result = await redis.evalsha(luaBookingScriptSha, 1, ticketId, quantity);

    if (result === -1) {
        throw new AppError(400, "Tiket tidak tersedia atau stok habis", "TICKET_UNAVAILABLE");
    }

    try {
        // 2. Simpan ke Postgres dalam SATU Transaksi
        await sql.begin(async (tx) => {
            await insertOrder(tx, {
                ticket_id: ticketId,
                simulated_user_id: simulatedUserId,
                quantity,
                idempotency_key: idempotencyKey || null,
                lock_strategy: 'resilient',
            });

            await decrementTicketStock(tx, ticketId, quantity);
        });

        return { message: "Tiket berhasil didapat" };
    } catch (error) {
        // 🚨 COMPENSATING TRANSACTION (ROLLBACK REDIS) 🚨
        console.error('Error SQL Insert (Initiating Redis Rollback):', error);

        try {
            await redis.hincrby(ticketId, 'stock', quantity);
            console.log(`Rollback Redis berhasil untuk tiket ${ticketId}`);
        } catch (redisError) {
            console.error('CRITICAL: Gagal rollback Redis (Ghost Stock terjadi)!', redisError);
        }

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(500, 'Internal Server Error');
    }
};