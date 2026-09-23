"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("@car-parts/database");
const client_1 = require("@prisma/client");
class UserRepository {
    static async findById(id) {
        return database_1.prisma.user.findUnique({
            where: { id },
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
        });
    }
    static async findByEmail(email) {
        return database_1.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
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
        });
    }
    static async createWithCustomer(data, roleId) {
        return database_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email.toLowerCase().trim(),
                    passwordHash: data.passwordHash,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    displayName: data.displayName || `${data.firstName} ${data.lastName}`.trim(),
                    phone: data.phone,
                    isActive: true,
                    roles: {
                        create: {
                            roleId,
                        },
                    },
                    customerProfile: {
                        create: {
                            customerType: data.customerType || client_1.CustomerType.CUSTOMER,
                            phone: data.phone,
                        },
                    },
                },
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
            });
            return user;
        });
    }
    static async updatePassword(userId, newPasswordHash) {
        return database_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
    }
    static async updateLastLogin(userId) {
        return database_1.prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map