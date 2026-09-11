import { prisma, Prisma, SupplierProduct } from '@car-parts/database';

export interface SupplierProductQueryParams {
  supplierId?: string;
  productId?: string;
  isActive?: boolean;
  isPreferred?: boolean;
  page?: number;
  limit?: number;
}

export class SupplierProductRepository {
  static async findSupplierProducts(params: SupplierProductQueryParams = {}, tx: Prisma.TransactionClient = prisma) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SupplierProductWhereInput = {
      deletedAt: null,
      supplier: {
        deletedAt: null,
      },
      product: {
        deletedAt: null,
      },
    };

    if (params.supplierId) {
      where.supplierId = params.supplierId;
    }

    if (params.productId) {
      where.productId = params.productId;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params.isPreferred !== undefined) {
      where.isPreferred = params.isPreferred;
    }

    const [items, total] = await Promise.all([
      tx.supplierProduct.findMany({
        where,
        include: {
          supplier: true,
          product: {
            include: {
              brand: true,
              category: true,
              prices: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ isPreferred: 'desc' }, { createdAt: 'desc' }],
      }),
      tx.supplierProduct.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string, tx: Prisma.TransactionClient = prisma) {
    return tx.supplierProduct.findFirst({
      where: { id, deletedAt: null },
      include: {
        supplier: true,
        product: {
          include: {
            brand: true,
            category: true,
            prices: true,
          },
        },
      },
    });
  }

  static async findBySupplierAndProduct(supplierId: string, productId: string, tx: Prisma.TransactionClient = prisma) {
    return tx.supplierProduct.findFirst({
      where: {
        supplierId,
        productId,
        deletedAt: null,
      },
      include: {
        supplier: true,
        product: true,
      },
    });
  }

  static async create(data: Prisma.SupplierProductUncheckedCreateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.supplierProduct.create({
      data,
      include: {
        supplier: true,
        product: true,
      },
    });
  }

  static async update(id: string, data: Prisma.SupplierProductUpdateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.supplierProduct.update({
      where: { id },
      data,
      include: {
        supplier: true,
        product: true,
      },
    });
  }

  static async softDelete(id: string, tx: Prisma.TransactionClient = prisma) {
    return tx.supplierProduct.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
