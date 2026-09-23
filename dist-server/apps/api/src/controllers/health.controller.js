"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const database_1 = require("@car-parts/database");
class HealthController {
    static async getHealth(_request, reply) {
        return reply.status(200).send({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            service: 'car-parts-api',
            version: '1.0.0',
        });
    }
    static async getReady(_request, reply) {
        try {
            await database_1.prisma.$queryRaw `SELECT 1;`;
            return reply.status(200).send({
                status: 'ready',
                database: 'connected',
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            return reply.status(503).send({
                status: 'not_ready',
                database: 'disconnected',
                error: err.message || 'Database ping failed',
            });
        }
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=health.controller.js.map