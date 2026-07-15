export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    }
}

export const getOffset = (page: number, limit: number): number => {
    return (page - 1) * limit;
}

export const buildPagination = (total: number, page: number, limit: number) => {
    return {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
    }
}