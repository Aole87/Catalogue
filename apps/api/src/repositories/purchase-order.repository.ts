import { prisma, Prisma, PurchaseOrder, PurchaseOrderStatus } from '@car-parts/database';

export interface PurchaseOrderQueryParams {
  status?: PurchaseOrderStatus;
  supplierId?: string;
  destinationWarehouseId?: string;
  poNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'expectedDeliveryDate' | 'grandTotal' | 'poNumber' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export class PurchaseOrderRepository {
  static async findPurchaseOrders(params: PurchaseOrderQueryParams = {}, tx: Prisma.TransactionClient = prisma) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseOrderWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.supplierId) {
      where.supplierId = params.supplierId;
    }

    if (params.destinationWarehouseId) {
      where.destinationWarehouseId = params.destinationWarehouseId;
    }

    if (params.poNumber) {
      where.poNumber = { contains: params.poNumber.trim(), mode: 'insensitive' };
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = params.dateFrom;
      if (params.dateTo) where.createdAt.lte = params.dateTo;
    }

    const orderByField = params.sortBy || 'createdAt';
    const orderDirection = params.sortOrder || 'desc';

    const [orders, total] = await Promise.all([
      tx.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          destinationWarehouse: true,
          createdByUser: {
            select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
          },
          approvedByUser: {
            select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
          },
          _count: {
            select: {
              items: true,
              goodsReceipts: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [orderByField]: orderDirection },
      }),
      tx.purchaseOrder.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findById(id: string, tx: Prisma.TransactionClient = prisma) {
    return tx.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        destinationWarehouse: true,
        createdByUser: {
          select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
        },
        approvedByUser: {
          select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
        },
        rejectedByUser: {
          select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
        },
        sentByUser: {
          select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
        },
        cancelledByUser: {
          select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
        },
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
            supplierProduct: true,
          },
        },
        goodsReceipts: {
          include: {
            items: true,
            warehouse: true,
            receivedByUser: {
              select: { id: true, displayName: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { receivedAt: 'desc' },
        },
      },
    });
  }

  static async findByIdWithLock(id: string, tx: Prisma.TransactionClient) {
    // Acquire row-level lock on purchase_orders
    const rows = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "purchase_orders" WHERE id = ${id}::uuid FOR UPDATE
    `;
    if (!rows || rows.length === 0) {
      return null;
    }
    return this.findById(id, tx);
  }

  static async findByPoNumber(poNumber: string, tx: Prisma.TransactionClient = prisma) {
    return tx.purchaseOrder.findUnique({
      where: { poNumber: poNumber.trim().toUpperCase() },
      include: {
        supplier: true,
        destinationWarehouse: true,
        items: true,
      },
    });
  }

  static async create(data: Prisma.PurchaseOrderUncheckedCreateInput, items: Prisma.PurchaseOrderItemUncheckedCreateWithoutPurchaseOrderInput[], tx: Prisma.TransactionClient = prisma) {
    return tx.purchaseOrder.create({
      data: {
        ...data,
        items: {
          create: items,
        },
      },
      include: {
        supplier: true,
        destinationWarehouse: true,
        items: true,
      },
    });
  }

  static async update(id: string, data: Prisma.PurchaseOrderUncheckedUpdateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.purchaseOrder.update({
      where: { id },
      data,
      include: {
        supplier: true,
        destinationWarehouse: true,
        items: true,
      },
    });
  }

  static async generatePoNumber(tx: Prisma.TransactionClient = prisma): Promise<string> {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const prefix = `PO-${dateStr}-`;

    const latest = await tx.purchaseOrder.findFirst({
      where: {
        poNumber: { startsWith: prefix },
      },
      orderBy: { poNumber: 'desc' },
      select: { poNumber: true },
    });

    let sequence = 1;
    if (latest && latest.poNumber) {
      const parts = latest.poNumber.split('-');
      if (parts.length === 3) {
        const parsedSeq = parseInt(parts[2], 10);
        if (!isNaN(parsedSeq)) {
          sequence = parsedSeq + 1;
        }
      }
    }

    const paddedSeq = sequence.toString().padStart(5, '0');
    return `${prefix}${paddedSeq}`;
  }
}
