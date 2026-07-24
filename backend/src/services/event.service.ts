import { AppError } from "../utils/app_errors";
import { getOffset, buildPagination } from "../utils/pagination";
import {
    insertEvent,
    findAllEvents,
    countEvents,
    findEventById,
    updateEventById,
    softDeleteEventById,
} from "../repositories/event.repository";

export const createEvent = async (
    name: string,
    description: string,
    sale_starts_at: Date
) => {
    if (sale_starts_at <= new Date()) {
        throw new AppError(400, "Sale start date cannot be in the past.");
    }

    const status = 'UPCOMING';
    const newEvent = await insertEvent(name, description, status, sale_starts_at);

    if (!newEvent) {
        throw new AppError(500, "Failed to create event.");
    }

    return newEvent;
};

export const getListEvent = async (page = 1, limit = 10) => {
    const offset = getOffset(page, limit);
    const [events, total] = await Promise.all([
        findAllEvents(limit, offset),
        countEvents(),
    ]);

    if (!events) {
        throw new AppError(500, "Failed to fetch events.");
    }

    return {
        data: events,
        pagination: buildPagination(total, page, limit),
    };
};

export const getDetailEvent = async (id: string) => {
    const event = await findEventById(id);

    if (!event) {
        throw new AppError(404, "Event not found.");
    }

    return event;
};

export const updateEvent = async (
    id: string,
    name: string,
    description: string,
    sale_starts_at: Date,
    status: string,
    category_id: string,
) => {
    const updatedEvent = await updateEventById(id, name, description, sale_starts_at, status, category_id);

    if (!updatedEvent) {
        throw new AppError(404, "Event not found.");
    }

    return updatedEvent;
};

export const deleteEvent = async (id: string) => {
    const deletedEvent = await softDeleteEventById(id);

    if (!deletedEvent) {
        throw new AppError(404, "Event not found.");
    }

    return deletedEvent;
};