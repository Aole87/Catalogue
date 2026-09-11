import { prisma } from '@car-parts/database';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { OrderStateMachine } from '../services/order/order-state-machine';
import { BadRequestException, NotFoundException } from '../errors/app-error';

export interface CreateOrderParams {
  orderNumber: string;
  customerId?: string | null;
  userId?: string | null;
  currency?: string;
  subtotal: string;
  discountTotal: string;
  shippingTotal: string;
  taxTotal: string;
  grandTotal: string;
  customerNotes?: string | null;
  adminNotes?: string | null;
  paymentMethod?: string;
  promotionId?: string | null;
  couponCode?: string | null;
  loyaltyPointsRedeemed?: number;
  loyaltyPointsEarned?: number;
  promotionSnapshot?: any;
  items: {
    productId: string;
    sku: string;
    productName: string;
    unitPrice: string;
    quantity: number;
    discountTotal: string;
    taxTotal: string;
    lineTotal: string;
    productSnapshot: any;
  }[];
}

export interface AdminOrderQueryParams {
  q?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shipmentStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  customerId?: string;
  sortBy?: 'createdAt' | 'orderNumber' | 'grandTotal' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CustomerOrderQueryParams {
  status?: OrderStatus;
  q?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export class OrderRepository {
  private static orderIncludes = {
    items: {
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            images: true,
          },
        },
      },
    },
    customer: {
      include: {
        user: true,
        addresses: true,
      },
    },
    statusHistory: {
      include: {
        changedByUser: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' as const },
    },
    payments: {
      include: {
        events: {
          orderBy: { createdAt: 'asc' as const },
        },
        slips: true,
        refunds: true,
      },
      orderBy: { createdAt: 'desc' as const },
    },
    shipments: {
      include: {
        shippingMethod: true,
        events: {
          orderBy: { occurredAt: 'asc' as const },
        },
      },
      orderBy: { createdAt: 'desc' as const },
    },
    couponRedemptions: {
      include: {
        coupon: true,
      },
    },
    loyaltyTransactions: true,
  };

  /**
   * Atomically creates an Order, OrderItems, initial OrderStatusHistory, and Payment draft.
   */
  static async createOrder(params: CreateOrderParams, clientTx?: Prisma.TransactionClient) {
    const runner = async (tx: Prisma.TransactionClient) => {
      const order = await tx.order.create({
        data: {
          orderNumber: params.orderNumber,
          customerId: params.customerId || null,
          currency: params.currency || 'THB',
          status: OrderStatus.PENDING_PAYMENT,
          subtotal: params.subtotal,
          discountTotal: params.discountTotal,
          shippingTotal: params.shippingTotal,
          taxTotal: params.taxTotal,
          grandTotal: params.grandTotal,
          promotionId: params.promotionId || null,
          couponCode: params.couponCode || null,
          loyaltyPointsRedeemed: params.loyaltyPointsRedeemed || 0,
          loyaltyPointsEarned: params.loyaltyPointsEarned || 0,
          promotionSnapshot: params.promotionSnapshot || Prisma.JsonNull,
          customerNotes: params.customerNotes || null,
          adminNotes: params.adminNotes || null,
          items: {
            create: params.items.map((item) => ({
              productId: item.productId,
              sku: item.sku,
              productName: item.productName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              discountTotal: item.discountTotal,
              taxTotal: item.taxTotal,
              lineTotal: item.lineTotal,
              productSnapshot: item.productSnapshot,
            })),
          },
          statusHistory: {
            create: {
              fromStatus: null,
              toStatus: OrderStatus.PENDING_PAYMENT,
              note: 'Order placed via storefront checkout',
              changedByUserId: params.userId || null,
            },
          },
          payments: {
            create: {
              provider: params.paymentMethod || 'PROMPTPAY',
              method: 'QR',
              status: PaymentStatus.PENDING,
              amount: params.grandTotal,
              currency: params.currency || 'THB',
            },
          },
        },
        include: this.orderIncludes,
      });

      return order;
    };

    if (clientTx) {
      return runner(clientTx);
    }
    return prisma.$transaction(runner);
  }

  /**
   * Finds an order by its UUID ID.
   */
  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: this.orderIncludes,
    });
  }

  /**
   * Finds an order by human-readable orderNumber (e.g. ORD-20260908-XXXX).
   */
  static async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: this.orderIncludes,
    });
  }

  /**
   * Retrieves orders for a specific customer with optional filters and pagination.
   */
  static async findByCustomerId(customerId: string, params: CustomerOrderQueryParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { customerId };

    if (params.status) {
      where.status = params.status;
    }

    if (params.q) {
      where.orderNumber = { contains: params.q.trim(), mode: 'insensitive' };
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = params.dateFrom;
      if (params.dateTo) where.createdAt.lte = params.dateTo;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: this.orderIncludes,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Staff/Admin query with multi-field search, status filters, date ranges, whitelist sorting, and pagination.
   */
  static async findAdminOrders(params: AdminOrderQueryParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    // 1. Search Query (orderNumber, customer name/email/phone, payment reference, tracking number)
    if (params.q && params.q.trim()) {
      const q = params.q.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerNotes: { contains: q, mode: 'insensitive' } },
        {
          customer: {
            OR: [
              { companyName: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
              {
                user: {
                  OR: [
                    { email: { contains: q, mode: 'insensitive' } },
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { displayName: { contains: q, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          },
        },
        {
          payments: {
            some: {
              OR: [
                { internalReference: { contains: q, mode: 'insensitive' } },
                { providerReference: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          shipments: {
            some: {
              OR: [
                { trackingNumber: { contains: q, mode: 'insensitive' } },
                { shipmentNumber: { contains: q, mode: 'insensitive' } },
                { recipientName: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    // 2. Status Filters
    if (params.status) {
      where.status = params.status;
    }

    if (params.paymentStatus) {
      where.payments = {
        some: { status: params.paymentStatus },
      };
    }

    if (params.shipmentStatus) {
      where.shipments = {
        some: { status: params.shipmentStatus as any },
      };
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    // 3. Date Filters
    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = params.dateFrom;
      if (params.dateTo) where.createdAt.lte = params.dateTo;
    }

    // 4. Safe Whitelist Sorting
    const sortFieldMap: Record<string, string> = {
      createdAt: 'createdAt',
      orderNumber: 'orderNumber',
      grandTotal: 'grandTotal',
      totalAmount: 'grandTotal',
      status: 'status',
    };

    const sortField = (params.sortBy && sortFieldMap[params.sortBy]) || 'createdAt';
    const sortDirection = params.sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.OrderOrderByWithRelationInput = { [sortField]: sortDirection };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: this.orderIncludes,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Atomically updates order status through state machine validation and writes status history.
   */
  static async updateOrderStatus(params: {
    orderId: string;
    toStatus: OrderStatus;
    note?: string;
    actorId?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { shipments: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === params.toStatus) {
        return tx.order.findUnique({
          where: { id: params.orderId },
          include: this.orderIncludes,
        });
      }

      // Validate transition
      OrderStateMachine.validateTransition(order.status, params.toStatus);

      await tx.order.update({
        where: { id: order.id },
        data: { status: params.toStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: params.toStatus,
          note: params.note || `Order status updated to ${params.toStatus}`,
          changedByUserId: params.actorId || null,
        },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: this.orderIncludes,
      });
    });
  }

  /**
   * Atomically cancels an order with reason and history.
   */
  static async cancelOrder(params: {
    orderId: string;
    reason: string;
    actorId?: string | null;
    isCustomerAction?: boolean;
  }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { shipments: true, payments: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status === OrderStatus.CANCELLED) {
        return tx.order.findUnique({
          where: { id: params.orderId },
          include: this.orderIncludes,
        });
      }

      // Check cancellation policy
      if (params.isCustomerAction) {
        const check = OrderStateMachine.canCustomerCancel(order.status, order.shipments);
        if (!check.allowed) {
          throw new BadRequestException(check.reason || 'Order cannot be cancelled by customer');
        }
      } else {
        const check = OrderStateMachine.canStaffCancel(order.status, order.shipments);
        if (!check.allowed) {
          throw new BadRequestException(check.reason || 'Order cannot be cancelled');
        }
      }

      // Validate transition
      OrderStateMachine.validateTransition(order.status, OrderStatus.CANCELLED);

      const isPaid = order.payments.some((p) => p.status === PaymentStatus.PAID);
      const historyNote = isPaid
        ? `${params.reason} (Paid order cancelled — marked eligible for refund under M7 Payment authority)`
        : params.reason;

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: OrderStatus.CANCELLED,
          note: historyNote,
          changedByUserId: params.actorId || null,
        },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: this.orderIncludes,
      });
    });
  }

  /**
   * Atomically requests a return for a delivered order.
   */
  static async requestReturn(params: {
    orderId: string;
    reason: string;
    actorId?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
        include: { shipments: true },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const check = OrderStateMachine.canRequestReturn(order.status, order.shipments);
      if (!check.allowed) {
        throw new BadRequestException(check.reason || 'Cannot request return for this order');
      }

      OrderStateMachine.validateTransition(order.status, OrderStatus.RETURN_REQUESTED);

      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.RETURN_REQUESTED },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: OrderStatus.RETURN_REQUESTED,
          note: `Return requested: ${params.reason}`,
          changedByUserId: params.actorId || null,
        },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: this.orderIncludes,
      });
    });
  }

  /**
   * Handles staff return approval or rejection.
   */
  static async handleReturnAction(params: {
    orderId: string;
    action: 'APPROVE' | 'REJECT';
    note?: string;
    actorId?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.orderId },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== OrderStatus.RETURN_REQUESTED) {
        throw new BadRequestException(`Cannot process return action for order in status '${order.status}'`);
      }

      const targetStatus = params.action === 'APPROVE' ? OrderStatus.RETURNED : OrderStatus.DELIVERED;
      OrderStateMachine.validateTransition(order.status, targetStatus);

      await tx.order.update({
        where: { id: order.id },
        data: { status: targetStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: targetStatus,
          note: params.note || `Return ${params.action === 'APPROVE' ? 'Approved' : 'Rejected'} by staff`,
          changedByUserId: params.actorId || null,
        },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: this.orderIncludes,
      });
    });
  }

  /**
   * Counts total orders.
   */
  static async countOrders() {
    return prisma.order.count();
  }
}
