"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const app_error_1 = require("./app-error");
const env_1 = __importDefault(require("../config/env"));
function errorHandler(error, request, reply) {
    const requestId = request.headers['x-request-id'] || request.id || 'unknown';
    // 1. Custom Application Errors
    if (error instanceof app_error_1.AppError) {
        return reply.status(error.statusCode).send({
            error: {
                code: error.code,
                message: error.message,
                requestId,
                ...(error.details ? { details: error.details } : {}),
            },
        });
    }
    // 2. Zod Runtime Validation Errors
    if (error instanceof zod_1.ZodError || error.name === 'ZodError') {
        const issues = error.issues || error.errors || [];
        const formattedErrors = issues.map((err) => ({
            field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || 'query'),
            message: err.message,
            rule: err.code || 'custom',
        }));
        return reply.status(422).send({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request payload or query parameters',
                requestId,
                details: formattedErrors,
            },
        });
    }
    // 3. Fastify JSON Schema Validation Errors (Ajv)
    if ('validation' in error && Array.isArray(error.validation)) {
        const formattedErrors = error.validation.map((err) => ({
            field: err.instancePath ? err.instancePath.replace(/^\//, '') : err.params?.missingProperty || 'body',
            message: err.message || 'Validation failed',
            rule: err.keyword || 'schema',
        }));
        return reply.status(422).send({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request payload',
                requestId,
                details: formattedErrors,
            },
        });
    }
    // 4. Fastify Rate Limit Errors (429)
    if ('statusCode' in error && error.statusCode === 429) {
        return reply.status(429).send({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please try again later.',
                requestId,
            },
        });
    }
    // 4.5 Fastify Payload Too Large Errors (413)
    if (('statusCode' in error && error.statusCode === 413) || error.code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
        return reply.status(413).send({
            error: {
                code: 'PAYLOAD_TOO_LARGE',
                message: 'Request payload is too large. Please use smaller images or files.',
                requestId,
            },
        });
    }
    // 5. Fastify Body Parsing / Malformed Syntax Errors (400)
    if ('statusCode' in error && error.statusCode === 400) {
        return reply.status(400).send({
            error: {
                code: 'BAD_REQUEST',
                message: error.message || 'Malformed request syntax',
                requestId,
            },
        });
    }
    // 5. Unhandled / Internal Server Errors (500)
    // Log full error on server
    request.log.error({ err: error, requestId }, 'Unhandled Server Error');
    return reply.status(500).send({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected internal server error occurred',
            requestId,
            ...(env_1.default.NODE_ENV !== 'production' ? { debug: error.message } : {}),
        },
    });
}
//# sourceMappingURL=error-handler.js.map