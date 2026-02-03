export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

export interface PaginationResult {
    skip: number;
    take: number;
    page: number;
    pageSize: number;
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function calculatePagination(params: PaginationParams): PaginationResult {
    const page = Math.max(1, params.page || DEFAULT_PAGE);
    const pageSize = Math.min(
        MAX_PAGE_SIZE,
        Math.max(1, params.pageSize || DEFAULT_PAGE_SIZE)
    );

    return {
        skip: (page - 1) * pageSize,
        take: pageSize,
        page,
        pageSize,
    };
}

export function buildPaginationMeta(
    page: number,
    pageSize: number,
    total: number
): PaginationMeta {
    return {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
    };
}
