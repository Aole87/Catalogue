import { prisma } from '@car-parts/database';
import { CustomerType, Prisma } from '@prisma/client';

export interface CustomerQueryParams {
  search?: string;
  customerType?: CustomerType;
  segmentId?: string;
  tagId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'lifetimeValue' | 'orderCount' | 'lastOrderDate';
  sortOrder?: 'asc' | 'desc';
}

export class CrmRepository {
  /**
   * Finds customer profile with user details, tags, segments, loyalty, and calculated metrics.
   */
  static async findCustomerById(id: string) {
    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            phone: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        tagAssignments: {
          include: {
            tag: true,
          },
        },
        segmentMemberships: {
          include: {
            segment: true,
          },
        },
        loyaltyAccount: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            grandTotal: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) return null;

    // Calculate authoritative metrics across orders
    const metrics = await this.calculateCustomerMetrics(customer.id);

    return {
      ...customer,
      metrics,
    };
  }

  /**
   * Finds customer profile by user ID.
   */
  static async findCustomerByUserId(userId: string) {
    return prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            phone: true,
          },
        },
        addresses: true,
        tagAssignments: {
          include: {
            tag: true,
          },
        },
        segmentMemberships: {
          include: {
            segment: true,
          },
        },
        loyaltyAccount: true,
      },
    });
  }

  /**
   * Calculates lifetime value, total orders, last order date, and days since last order.
   */
  static async calculateCustomerMetrics(customerId: string) {
    const orders = await prisma.order.findMany({
      where: {
        customerId,
        status: {
          notIn: ['CANCELLED', 'DRAFT'],
        },
      },
      select: {
        grandTotal: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const orderCount = orders.length;
    const lifetimeValue = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
    const lastOrderDate = orders[0]?.createdAt || null;
    const daysSinceLastOrder = lastOrderDate
      ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      orderCount,
      lifetimeValue: Number(lifetimeValue.toFixed(2)),
      lastOrderDate,
      daysSinceLastOrder,
    };
  }

  /**
   * Query customers with pagination, search, segment, and tag filters.
   */
  static async queryCustomers(params: CustomerQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerProfileWhereInput = {
      deletedAt: null,
    };

    if (params.customerType) {
      where.customerType = params.customerType;
    }

    if (params.segmentId) {
      where.segmentMemberships = {
        some: { segmentId: params.segmentId },
      };
    }

    if (params.tagId) {
      where.tagAssignments = {
        some: { tagId: params.tagId },
      };
    }

    if (params.search) {
      const search = params.search.trim();
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { taxId: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { displayName: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customerProfile.count({ where }),
      prisma.customerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true,
              phone: true,
              isActive: true,
            },
          },
          tagAssignments: {
            include: { tag: true },
          },
          segmentMemberships: {
            include: { segment: true },
          },
          loyaltyAccount: true,
        },
      }),
    ]);

    // Enhance customers with calculated metrics
    const enhancedCustomers = await Promise.all(
      customers.map(async (c) => {
        const metrics = await this.calculateCustomerMetrics(c.id);
        return {
          ...c,
          metrics,
        };
      })
    );

    return {
      data: enhancedCustomers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update customer profile and linked user.
   */
  static async updateCustomerProfile(id: string, data: {
    customerType?: CustomerType;
    companyName?: string | null;
    taxId?: string | null;
    phone?: string | null;
    notes?: string | null;
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
  }) {
    const { isActive, firstName, lastName, email, ...profileData } = data;
    
    return prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.customerProfile.update({
        where: { id },
        data: profileData,
      });

      if (updatedProfile.userId && (isActive !== undefined || firstName || lastName || email || data.phone)) {
        const userData: Prisma.UserUpdateInput = {};
        if (isActive !== undefined) userData.isActive = isActive;
        if (firstName !== undefined) userData.firstName = firstName;
        if (lastName !== undefined) userData.lastName = lastName;
        if (email !== undefined) userData.email = email;
        if (data.phone !== undefined) userData.phone = data.phone;

        await tx.user.update({
          where: { id: updatedProfile.userId },
          data: userData,
        });
      }

      return tx.customerProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              displayName: true,
              phone: true,
              isActive: true,
            },
          },
        },
      });
    });
  }

  /**
   * Soft-delete customer profile and linked user.
   */
  static async deleteCustomer(id: string) {
    const customer = await prisma.customerProfile.findUnique({ where: { id } });
    if (!customer) return null;

    return prisma.$transaction(async (tx) => {
      const now = new Date();
      if (customer.userId) {
        await tx.user.update({
          where: { id: customer.userId },
          data: {
            deletedAt: now,
            isActive: false,
          },
        });
      }

      return tx.customerProfile.update({
        where: { id },
        data: { deletedAt: now },
      });
    });
  }

  /**
   * Tags CRUD & Assignments
   */
  static async listTags() {
    return prisma.customerTag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });
  }

  static async createTag(name: string, color = '#3B82F6', description?: string) {
    return prisma.customerTag.create({
      data: { name: name.trim(), color, description },
    });
  }

  static async assignTag(customerId: string, tagId: string) {
    return prisma.customerTagAssignment.upsert({
      where: {
        customerId_tagId: { customerId, tagId },
      },
      create: { customerId, tagId },
      update: {},
    });
  }

  static async removeTag(customerId: string, tagId: string) {
    return prisma.customerTagAssignment.deleteMany({
      where: { customerId, tagId },
    });
  }

  /**
   * Segments & Rules CRUD
   */
  static async listSegments() {
    return prisma.customerSegment.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        rules: true,
        _count: {
          select: { memberships: true },
        },
      },
    });
  }

  static async findSegmentById(id: string) {
    return prisma.customerSegment.findFirst({
      where: { id, deletedAt: null },
      include: {
        rules: true,
        memberships: {
          include: {
            customer: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async createSegment(data: {
    name: string;
    code: string;
    description?: string | null;
    isActive?: boolean;
    isAutomatic?: boolean;
    rules?: { field: string; operator: string; value: string }[];
  }) {
    return prisma.customerSegment.create({
      data: {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description || null,
        isActive: data.isActive ?? true,
        isAutomatic: data.isAutomatic ?? true,
        rules: data.rules
          ? {
              create: data.rules.map((r) => ({
                field: r.field,
                operator: r.operator,
                value: String(r.value),
              })),
            }
          : undefined,
      },
      include: { rules: true },
    });
  }

  static async updateSegment(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
      isAutomatic?: boolean;
      rules?: { field: string; operator: string; value: string }[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.rules) {
        await tx.customerSegmentRule.deleteMany({ where: { segmentId: id } });
        await tx.customerSegmentRule.createMany({
          data: data.rules.map((r) => ({
            segmentId: id,
            field: r.field,
            operator: r.operator,
            value: String(r.value),
          })),
        });
      }

      return tx.customerSegment.update({
        where: { id },
        data: {
          name: data.name?.trim(),
          description: data.description,
          isActive: data.isActive,
          isAutomatic: data.isAutomatic,
        },
        include: { rules: true },
      });
    });
  }

  static async deleteSegment(id: string) {
    return prisma.customerSegment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async syncSegmentMembers(segmentId: string, customerIds: string[]) {
    return prisma.$transaction(async (tx) => {
      // Remove memberships not in customerIds
      await tx.customerSegmentMembership.deleteMany({
        where: {
          segmentId,
          customerId: { notIn: customerIds },
        },
      });

      // Upsert existing/new
      for (const cid of customerIds) {
        await tx.customerSegmentMembership.upsert({
          where: {
            customerId_segmentId: { customerId: cid, segmentId },
          },
          create: { customerId: cid, segmentId },
          update: {},
        });
      }
    });
  }
}
