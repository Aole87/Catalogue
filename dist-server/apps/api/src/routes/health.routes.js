"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoutes = healthRoutes;
const health_controller_1 = require("../controllers/health.controller");
async function healthRoutes(app) {
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
        handler: health_controller_1.HealthController.getHealth,
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
        handler: health_controller_1.HealthController.getReady,
    });
}
//# sourceMappingURL=health.routes.js.map