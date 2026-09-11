import { prisma } from '@car-parts/database';

export interface CreateSessionData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class SessionRepository {
  static async create(data: CreateSessionData) {
    return prisma.session.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  static async findValidByTokenHash(tokenHash: string) {
    const session = await prisma.session.findUnique({
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

    if (!session) return null;

    // Check expiration and revocation
    const now = new Date();
    if (session.revokedAt || session.expiresAt <= now) {
      return null;
    }

    return session;
  }

  static async touch(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() },
    });
  }

  static async revokeByTokenHash(tokenHash: string) {
    return prisma.session.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  static async revokeAllForUser(userId: string, exceptTokenHash?: string) {
    return prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptTokenHash ? { NOT: { tokenHash: exceptTokenHash } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  }
}
