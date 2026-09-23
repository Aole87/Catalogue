"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerException = exports.RateLimitException = exports.ConflictException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.ValidationException = exports.BadRequestException = exports.InternalServerError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.BadRequestError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class BadRequestError extends AppError {
    constructor(message = 'Bad Request', details) {
        super(400, 'BAD_REQUEST', message, details);
    }
}
exports.BadRequestError = BadRequestError;
exports.BadRequestException = BadRequestError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed', details) {
        super(422, 'VALIDATION_ERROR', message, details);
    }
}
exports.ValidationError = ValidationError;
exports.ValidationException = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required', code = 'UNAUTHORIZED', details) {
        super(401, code, message, details);
    }
}
exports.UnauthorizedError = UnauthorizedError;
exports.UnauthorizedException = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Access denied: insufficient permissions', code = 'FORBIDDEN', details) {
        super(403, code, message, details);
    }
}
exports.ForbiddenError = ForbiddenError;
exports.ForbiddenException = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found', details) {
        super(404, 'NOT_FOUND', message, details);
    }
}
exports.NotFoundError = NotFoundError;
exports.NotFoundException = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists', details) {
        super(409, 'CONFLICT', message, details);
    }
}
exports.ConflictError = ConflictError;
exports.ConflictException = ConflictError;
class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later', details) {
        super(429, 'RATE_LIMIT_EXCEEDED', message, details);
    }
}
exports.RateLimitError = RateLimitError;
exports.RateLimitException = RateLimitError;
class InternalServerError extends AppError {
    constructor(message = 'Internal server error', details) {
        super(500, 'INTERNAL_SERVER_ERROR', message, details);
    }
}
exports.InternalServerError = InternalServerError;
exports.InternalServerException = InternalServerError;
//# sourceMappingURL=app-error.js.map