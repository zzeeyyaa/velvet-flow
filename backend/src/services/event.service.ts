import { sql } from "../db"
import { AppError } from "../utils/app_errors";

export const createEvent = async (
    name: string,
    description: string,
    sale_starts_at: Date
) => {

    if (sale_starts_at <= new Date()) {
        throw new AppError(400, "Sale start date cannot be in the past.");
    }
    const status = 'UPCOMING';

    const [newEvent] = await sql`INSERT INTO events
    (name, description, status, sale_starts_at)
    VALUES (${name}, ${description}, ${status}, ${sale_starts_at})
    RETURNING *`;

    if (!newEvent) {
        throw new AppError(500, "Failed to create event.");
    }

    return newEvent;
}

export const getListEvent = async () => {
    const listEvent = await sql`SELECT * FROM events`;
    if (!listEvent) {
        throw new AppError(500, "Failed to fetch events.");
    }
    return listEvent;
}

export const getDetailEvent = async (id: string) => {
    const [event] = await sql`SELECT * FROM events WHERE id = ${id}`;
    if (!event) {
        throw new AppError(404, "Event not found.");
    }
    return event;
}

export const updateEvent = async (id: string, name: string, description: string, sale_starts_at: Date, status: string) => {
    const [updatedEvent] = await sql`UPDATE events SET name = ${name}, description = ${description}, sale_starts_at = ${sale_starts_at}, status = ${status} WHERE id = ${id} RETURNING *`;
    if (!updatedEvent) {
        throw new AppError(404, "Event not found.");
    }
    return updatedEvent;
}

export const deleteEvent = async (id: string) => {
    const [deleteEvent] = await sql`UPDATE events SET status = 'CANCELLED' WHERE id = ${id} RETURNING *`;
    if (!deleteEvent) {
        throw new AppError(404, "Event not found.");
    }
    return deleteEvent;
}