import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@car-parts/database';

export class HealthController {
  static async getHealth(_request: FastifyRequest, reply: FastifyReply) {
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: 'car-parts-api',
      version: '1.0.0',
    });
  }

  static async getReady(_request: FastifyRequest, reply: FastifyReply) {
    try {
      await prisma.$queryRaw`SELECT 1;`;
      return reply.status(200).send({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return reply.status(503).send({
        status: 'not_ready',
        database: 'disconnected',
        error: err.message || 'Database ping failed',
      });
    }
  }
}
