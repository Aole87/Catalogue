import { CustomerType } from '@prisma/client';
export interface CreateUserData {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    displayName?: string;
    customerType?: CustomerType;
}
export declare class UserRepository {
    static findById(id: string): Promise<({
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
    }) | null>;
    static findByEmail(email: string): Promise<({
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
    }) | null>;
    static createWithCustomer(data: CreateUserData, roleId: string): Promise<{
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
    }>;
    static updatePassword(userId: string, newPasswordHash: string): Promise<{
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
    }>;
    static updateLastLogin(userId: string): Promise<{
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
    }>;
}
