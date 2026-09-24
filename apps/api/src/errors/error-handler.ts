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
  if (
    ('statusCode' in error && error.statusCode === 429) ||
    (error as any).code === 'FST_ERR_RATE_LIMIT_EXCEEDED' ||
    (error as any).error?.code === 'RATE_LIMIT_EXCEEDED'
  ) {
    const errorMsg = (error as any).error?.message || error.message || 'Too many requests. Please try again later.';
    return reply.status(429).send({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: errorMsg,
        requestId,
      },
    });
  }

  // 4.5 Fastify Payload Too Large Errors (413)
  if (('statusCode' in error && error.statusCode === 413) || (error as any).code === 'FST_ERR_CTP_BODY_TOO_LARGE') {
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

  // 6. Prisma Database Errors
  const prismaCode = (error as any).code;
  if (typeof prismaCode === 'string' && prismaCode.startsWith('P')) {
    if (prismaCode === 'P2023') {
      return reply.status(400).send({
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid ID or parameter format (UUID required)',
          requestId,
        },
      });
    }
    if (prismaCode === 'P2025') {
      return reply.status(404).send({
        error: {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found',
          requestId,
        },
      });
    }
    if (prismaCode === 'P2002') {
      const target = (error as any).meta?.target;
      const targetMsg = Array.isArray(target) ? ` on (${target.join(', ')})` : '';
      return reply.status(409).send({
        error: {
          code: 'CONFLICT',
          message: `A record with this identifier already exists${targetMsg}`,
          requestId,
        },
      });
    }
    if (prismaCode === 'P2003') {
      return reply.status(400).send({
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Referenced related record does not exist or cannot be deleted',
          requestId,
        },
      });
    }
  }

  // 7. CORS Errors
  if (error.message?.includes('CORS') || error.message?.includes('Not allowed by CORS')) {
    return reply.status(403).send({
      error: {
        code: 'CORS_ERROR',
        message: 'Origin or headers not permitted by CORS policy',
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
