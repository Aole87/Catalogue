"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepository = void 0;
const database_1 = require("@car-parts/database");
const client_1 = require("@prisma/client");
class AuditRepository {
    static async record(data) {
        try {
            return await database_1.prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    resource: data.resource,
                    resourceId: data.resourceId,
                    before: data.before ?? client_1.Prisma.JsonNull,
                    after: data.after ?? client_1.Prisma.JsonNull,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        }
        catch (err) {
            // Audit log failures should not crash the main business operation, but should be logged
            console.error('Failed to record audit log:', err);
            return null;
        }
    }
}
exports.AuditRepository = AuditRepository;
//# sourceMappingURL=audit.repository.js.map