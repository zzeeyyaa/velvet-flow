import { sql } from "../db";

export const insertTicket = async (
    name: string,
    event_id: string,
    category_id: string,
    total_capacity: number,
    price: number,
    is_active: boolean
) => {
    const [newTicket] = await sql`INSERT INTO tickets (
        name,
        event_id,
        category_id,
        total_capacity,
        price,
        stock,
        is_active
    ) VALUES (${name}, ${event_id}, ${category_id}, ${total_capacity}, ${price}, ${total_capacity}, ${is_active})
    RETURNING *`;
    return newTicket;
};

export const findAllTickets = async (limit: number, offset: number) => {
    const tickets = await sql`SELECT * FROM tickets LIMIT ${limit} OFFSET ${offset}`;
    return tickets;
};

export const countTickets = async () => {
    const [result] = await sql`SELECT COUNT(*)::int AS total FROM tickets`;
    return result.total;
};

export const findTicketById = async (id: string) => {
    const [ticket] = await sql`SELECT * FROM tickets WHERE id = ${id}`;
    return ticket;
};

// Query dengan row-level lock untuk digunakan di dalam transaksi
export const findTicketByIdForUpdate = async (tx: any, id: string) => {
    const [ticket] = await tx`
        SELECT stock, is_active FROM tickets
        WHERE id = ${id}
        FOR UPDATE
    `;
    return ticket;
};

export const findTicketStockById = async (id: string) => {
    const [ticket] = await sql`SELECT stock, is_active FROM tickets WHERE id = ${id}`;
    return ticket;
};

export const insertOrder = async (
    tx: any,
    data: {
        ticket_id: string;
        simulated_user_id: string;
        quantity: number;
        idempotency_key?: string | null;
        lock_strategy?: string;
    }
) => {
    await tx`INSERT INTO orders ${tx(data)}`;
};

export const updateTicketStock = async (tx: any, id: string, newStock: number) => {
    await tx`UPDATE tickets SET stock = ${newStock} WHERE id = ${id}`;
};

export const decrementTicketStock = async (tx: any, id: string, quantity: number) => {
    await tx`UPDATE tickets SET stock = stock - ${quantity} WHERE id = ${id}`;
};
