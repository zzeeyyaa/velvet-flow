import { sql } from "../db";

export const insertEvent = async (
    name: string,
    description: string,
    status: string,
    sale_starts_at: Date
) => {
    const [newEvent] = await sql`INSERT INTO events
    (name, description, status, sale_starts_at)
    VALUES (${name}, ${description}, ${status}, ${sale_starts_at})
    RETURNING *`;
    return newEvent;
};

export const findAllEvents = async () => {
    const events = await sql`SELECT * FROM events`;
    return events;
};

export const findEventById = async (id: string) => {
    const [event] = await sql`SELECT * FROM events WHERE id = ${id}`;
    return event;
};

export const updateEventById = async (
    id: string,
    name: string,
    description: string,
    sale_starts_at: Date,
    status: string
) => {
    const [updatedEvent] = await sql`UPDATE events
    SET name = ${name}, description = ${description}, sale_starts_at = ${sale_starts_at}, status = ${status}
    WHERE id = ${id}
    RETURNING *`;
    return updatedEvent;
};

export const softDeleteEventById = async (id: string) => {
    const [deletedEvent] = await sql`UPDATE events
    SET status = 'CANCELLED'
    WHERE id = ${id}
    RETURNING *`;
    return deletedEvent;
};
