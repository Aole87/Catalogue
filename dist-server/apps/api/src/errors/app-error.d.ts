export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown | undefined;
    constructor(statusCode: number, code: string, message: string, details?: unknown | undefined);
}
export declare class BadRequestError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class ValidationError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string, code?: string, details?: unknown);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string, code?: string, details?: unknown);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class ConflictError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class RateLimitError extends AppError {
    constructor(message?: string, details?: unknown);
}
export declare class InternalServerError extends AppError {
    constructor(message?: string, details?: unknown);
}
export { BadRequestError as BadRequestException, ValidationError as ValidationException, UnauthorizedError as UnauthorizedException, ForbiddenError as ForbiddenException, NotFoundError as NotFoundException, ConflictError as ConflictException, RateLimitError as RateLimitException, InternalServerError as InternalServerException, };
