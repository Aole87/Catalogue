import { prisma, Prisma, Supplier } from '@car-parts/database';

export interface SupplierQueryParams {
  q?: string;
  search?: string;
  code?: string;
  name?: string;
  isActive?: boolean;
  page?: number;
  offset?: number;
  limit?: number;
  sortBy?: 'name' | 'code' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export class SupplierRepository {
  static async findSuppliers(params: SupplierQueryParams = {}, tx: Prisma.TransactionClient = prisma) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = params.offset !== undefined ? params.offset : (page - 1) * limit;

    const where: Prisma.SupplierWhereInput = {
      deletedAt: null,
    };

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.code) {
      where.code = { contains: params.code.trim(), mode: 'insensitive' };
    }

    if (params.name) {
      where.name = { contains: params.name.trim(), mode: 'insensitive' };
    }

    const searchQuery = (params.q || params.search)?.trim();
    if (searchQuery) {
      where.OR = [
        { code: { contains: searchQuery, mode: 'insensitive' } },
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { displayName: { contains: searchQuery, mode: 'insensitive' } },
        { contactName: { contains: searchQuery, mode: 'insensitive' } },
        { email: { contains: searchQuery, mode: 'insensitive' } },
        { phone: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const orderByField = params.sortBy || 'createdAt';
    const orderDirection = params.sortOrder || 'desc';

    const [suppliers, total] = await Promise.all([
      tx.supplier.findMany({
        where,
        include: {
          _count: {
            select: {
              supplierProducts: true,
              purchaseOrders: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [orderByField]: orderDirection },
      }),
      tx.supplier.count({ where }),
    ]);

    return {
      suppliers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string, tx: Prisma.TransactionClient = prisma) {
    return tx.supplier.findFirst({
      where: { id, deletedAt: null },
      include: {
        supplierProducts: {
          where: { deletedAt: null },
          include: {
            product: {
              include: {
                brand: true,
                category: true,
                prices: true,
              },
            },
          },
        },
        _count: {
          select: {
            purchaseOrders: true,
          },
        },
      },
    });
  }

  static async findByCode(code: string, tx: Prisma.TransactionClient = prisma) {
    return tx.supplier.findFirst({
      where: { code: code.trim().toUpperCase(), deletedAt: null },
    });
  }

  static async create(data: Prisma.SupplierCreateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.supplier.create({
      data: {
        ...data,
        code: data.code.trim().toUpperCase(),
      },
    });
  }

  static async update(id: string, data: Prisma.SupplierUpdateInput, tx: Prisma.TransactionClient = prisma) {
    const updateData = { ...data };
    if (typeof updateData.code === 'string') {
      updateData.code = updateData.code.trim().toUpperCase();
    }
    return tx.supplier.update({
      where: { id },
      data: updateData,
    });
  }

  static async softDelete(id: string, tx: Prisma.TransactionClient = prisma) {
    return tx.supplier.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
