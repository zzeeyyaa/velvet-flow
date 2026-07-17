import { fetchApi } from "../lib/apiClient";
import type { BaseResponse, EventData } from "../types/api";


export const getEvents = async () => {
    return fetchApi<BaseResponse<EventData[]>>("/events");
}

export const createEvent = async (event: EventData) => {
    return fetchApi<BaseResponse<EventData>>("/events", {
        method: "POST",
        body: JSON.stringify(event),
    })
}

export const updateEvent = async (event: EventData) => {
    return fetchApi<BaseResponse<EventData>>(`/events/${event.id}`, {
        method: "PUT",
        body: JSON.stringify(event),
    })
}

export const deleteEvent = async (id: string) => {
    return fetchApi<BaseResponse<EventData>>(`/events/${id}`, {
        method: "DELETE",
    })
}

export const getDetailEvent = async (id: string) => {
    return fetchApi<BaseResponse<EventData>>(`/events/${id}`);
}

export const getDetailEventBySlug = async (slug: string) => {
    return fetchApi<BaseResponse<EventData>>(`/events/slug/${slug}`);
}