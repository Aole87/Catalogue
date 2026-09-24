import { prisma } from '@car-parts/database';
import { CustomerType, User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  displayName?: string;
  customerType?: CustomerType;
  companyName?: string;
  taxId?: string;
  emailVerifiedAt?: Date | null;
}

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({
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

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
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

  static async createWithCustomer(data: CreateUserData, roleId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: data.displayName || `${data.firstName} ${data.lastName}`.trim(),
          phone: data.phone,
          isActive: true,
          emailVerifiedAt: data.emailVerifiedAt ?? null,
          roles: {
            create: {
              roleId,
            },
          },
          customerProfile: {
            create: {
              customerType: data.customerType || CustomerType.CUSTOMER,
              companyName: data.companyName || null,
              taxId: data.taxId || null,
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

  static async updatePassword(userId: string, newPasswordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  static async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
