export interface CreateSessionData {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
}
export declare class SessionRepository {
    static create(data: CreateSessionData): Promise<{
        tokenHash: string;
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        revokedAt: Date | null;
        lastUsedAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    static findValidByTokenHash(tokenHash: string): Promise<({
        user: {
            customerProfile: {
                id: string;
                phone: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                userId: string | null;
                notes: string | null;
                customerType: import(".prisma/client").$Enums.CustomerType;
                companyName: string | null;
                taxId: string | null;
                isVerified: boolean;
            } | null;
            roles: ({
                role: {
                    permissions: ({
                        permission: {
                            description: string | null;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            action: string;
                            resource: string;
                        };
                    } & {
                        id: string;
                        createdAt: Date;
                        roleId: string;
                        permissionId: string;
                    })[];
                } & {
                    description: string | null;
                    name: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                createdAt: Date;
                userId: string;
                roleId: string;
            })[];
        } & {
            passwordHash: string;
            id: string;
            email: string;
            phone: string | null;
            firstName: string;
            lastName: string;
            displayName: string | null;
            isActive: boolean;
            emailVerifiedAt: Date | null;
            phoneVerifiedAt: Date | null;
            lastLoginAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
        };
    } & {
        tokenHash: string;
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        revokedAt: Date | null;
        lastUsedAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }) | null>;
    static touch(sessionId: string): Promise<{
        tokenHash: string;
        id: string;
        createdAt: Date;
        userId: string;
        expiresAt: Date;
        revokedAt: Date | null;
        lastUsedAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    static revokeByTokenHash(tokenHash: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    static revokeAllForUser(userId: string, exceptTokenHash?: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
