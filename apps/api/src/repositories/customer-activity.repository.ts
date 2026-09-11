import { prisma } from '@car-parts/database';
import { CustomerActivityType, Prisma } from '@prisma/client';

export interface CreateCustomerActivityData {
  customerId?: string | null;
  userId?: string | null;
  eventType: CustomerActivityType;
  description: string;
  metadata?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class CustomerActivityRepository {
  /**
   * Append-only log of customer activity.
   */
  static async recordActivity(data: CreateCustomerActivityData) {
    return prisma.customerActivity.create({
      data: {
        customerId: data.customerId || null,
        userId: data.userId || null,
        eventType: data.eventType,
        description: data.description,
        metadata: data.metadata || Prisma.JsonNull,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
      },
    });
  }

  /**
   * List customer activity timeline with pagination.
   */
  static async listByCustomerId(customerId: string, limit = 50, skip = 0) {
    return prisma.customerActivity.findMany({
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
  static async listByUserId(userId: string, limit = 50, skip = 0) {
    return prisma.customerActivity.findMany({
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
