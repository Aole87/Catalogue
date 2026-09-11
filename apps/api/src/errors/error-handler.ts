import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './app-error';
import config from '../config/env';

export function errorHandler(error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) {
  const requestId = (request.headers['x-request-id'] as string) || request.id || 'unknown';

  // 1. Custom Application Errors
  if (error instanceof AppError) {
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
  if (error instanceof ZodError || (error as any).name === 'ZodError') {
    const issues = (error as any).issues || (error as any).errors || [];
    const formattedErrors = issues.map((err: any) => ({
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
  if ('validation' in error && Array.isArray((error as any).validation)) {
    const formattedErrors = (error as any).validation.map((err: any) => ({
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
      ...(config.NODE_ENV !== 'production' ? { debug: error.message } : {}),
    },
  });
}
