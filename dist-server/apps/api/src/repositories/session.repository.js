"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionRepository = void 0;
const database_1 = require("@car-parts/database");
class SessionRepository {
    static async create(data) {
        return database_1.prisma.session.create({
            data: {
                userId: data.userId,
                tokenHash: data.tokenHash,
                expiresAt: data.expiresAt,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }
    static async findValidByTokenHash(tokenHash) {
        const session = await database_1.prisma.session.findUnique({
            where: { tokenHash },
            include: {
                user: {
                    include: {
                        roles: {
                            include: {
                                role: {
                                    include: {
                                        permissions: {
                                            include: {
                                                permission: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        customerProfile: true,
                    },
                },
            },
        });
        if (!session)
            return null;
        // Check expiration and revocation
        const now = new Date();
        if (session.revokedAt || session.expiresAt <= now) {
            return null;
        }
        return session;
    }
    static async touch(sessionId) {
        return database_1.prisma.session.update({
            where: { id: sessionId },
            data: { lastUsedAt: new Date() },
        });
    }
    static async revokeByTokenHash(tokenHash) {
        return database_1.prisma.session.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    static async revokeAllForUser(userId, exceptTokenHash) {
        return database_1.prisma.session.updateMany({
            where: {
                userId,
                revokedAt: null,
                ...(exceptTokenHash ? { NOT: { tokenHash: exceptTokenHash } } : {}),
            },
            data: { revokedAt: new Date() },
        });
    }
}
exports.SessionRepository = SessionRepository;
//# sourceMappingURL=session.repository.js.map