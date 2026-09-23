"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerActivityRepository = void 0;
const database_1 = require("@car-parts/database");
const client_1 = require("@prisma/client");
class CustomerActivityRepository {
    /**
     * Append-only log of customer activity.
     */
    static async recordActivity(data) {
        return database_1.prisma.customerActivity.create({
            data: {
                customerId: data.customerId || null,
                userId: data.userId || null,
                eventType: data.eventType,
                description: data.description,
                metadata: data.metadata || client_1.Prisma.JsonNull,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
            },
        });
    }
    /**
     * List customer activity timeline with pagination.
     */
    static async listByCustomerId(customerId, limit = 50, skip = 0) {
        return database_1.prisma.customerActivity.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
            select: {
                id: true,
                customerId: true,
                eventType: true,
                description: true,
                metadata: true,
                createdAt: true,
            },
        });
    }
    /**
     * List user activity timeline with pagination.
     */
    static async listByUserId(userId, limit = 50, skip = 0) {
        return database_1.prisma.customerActivity.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip,
            select: {
                id: true,
                userId: true,
                eventType: true,
                description: true,
                metadata: true,
                createdAt: true,
            },
        });
    }
}
exports.CustomerActivityRepository = CustomerActivityRepository;
//# sourceMappingURL=customer-activity.repository.js.map