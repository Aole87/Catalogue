import { FastifyInstance } from 'fastify';
import { HealthController } from '../controllers/health.controller';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', {
    schema: {
      description: 'Liveness health check endpoint',
      tags: ['System'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            service: { type: 'string' },
            version: { type: 'string' },
          },
        },
      },
    },
    handler: HealthController.getHealth,
  });

  app.get('/ready', {
    schema: {
      description: 'Readiness probe verifying database connectivity',
      tags: ['System'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            database: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    handler: HealthController.getReady,
  });
}
