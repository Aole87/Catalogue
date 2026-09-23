"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const database_1 = require("@car-parts/database");
const client_1 = require("@prisma/client");
const order_state_machine_1 = require("../services/order/order-state-machine");
const app_error_1 = require("../errors/app-error");
class OrderRepository {
    static orderIncludes = {
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
            orderBy: { createdAt: 'asc' },
        },
        payments: {
            include: {
                events: {
                    orderBy: { createdAt: 'asc' },
                },
                slips: true,
                refunds: true,
            },
            orderBy: { createdAt: 'desc' },
        },
        shipments: {
            include: {
                shippingMethod: true,
                events: {
                    orderBy: { occurredAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
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
    static async createOrder(params, clientTx) {
        const runner = async (tx) => {
            const order = await tx.order.create({
                data: {
                    orderNumber: params.orderNumber,
                    customerId: params.customerId || null,
                    currency: params.currency || 'THB',
                    status: client_1.OrderStatus.PENDING_PAYMENT,
                    subtotal: params.subtotal,
                    discountTotal: params.discountTotal,
                    shippingTotal: params.shippingTotal,
                    taxTotal: params.taxTotal,
                    grandTotal: params.grandTotal,
                    promotionId: params.promotionId || null,
                    couponCode: params.couponCode || null,
                    loyaltyPointsRedeemed: params.loyaltyPointsRedeemed || 0,
                    loyaltyPointsEarned: params.loyaltyPointsEarned || 0,
                    promotionSnapshot: params.promotionSnapshot || client_1.Prisma.JsonNull,
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
                            toStatus: client_1.OrderStatus.PENDING_PAYMENT,
                            note: 'Order placed via storefront checkout',
                            changedByUserId: params.userId || null,
                        },
                    },
                    payments: {
                        create: {
                            provider: params.paymentMethod || 'PROMPTPAY',
                            method: 'QR',
                            status: client_1.PaymentStatus.PENDING,
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
        return database_1.prisma.$transaction(runner);
    }
    /**
     * Finds an order by its UUID ID.
     */
    static async findById(id) {
        return database_1.prisma.order.findUnique({
            where: { id },
            include: this.orderIncludes,
        });
    }
    /**
     * Finds an order by human-readable orderNumber (e.g. ORD-20260908-XXXX).
     */
    static async findByOrderNumber(orderNumber) {
        return database_1.prisma.order.findUnique({
            where: { orderNumber },
            include: this.orderIncludes,
        });
    }
    /**
     * Retrieves orders for a specific customer with optional filters and pagination.
     */
    static async findByCustomerId(customerId, params = {}) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        const where = { customerId };
        if (params.status) {
            where.status = params.status;
        }
        if (params.q) {
            where.orderNumber = { contains: params.q.trim(), mode: 'insensitive' };
        }
        if (params.dateFrom || params.dateTo) {
            where.createdAt = {};
            if (params.dateFrom)
                where.createdAt.gte = params.dateFrom;
            if (params.dateTo)
                where.createdAt.lte = params.dateTo;
        }
        const [orders, total] = await Promise.all([
            database_1.prisma.order.findMany({
                where,
                include: this.orderIncludes,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.order.count({ where }),
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
    static async findAdminOrders(params = {}) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(100, Math.max(1, params.limit || 20));
        const skip = (page - 1) * limit;
        const where = {};
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
                some: { status: params.shipmentStatus },
            };
        }
        if (params.customerId) {
            where.customerId = params.customerId;
        }
        // 3. Date Filters
        if (params.dateFrom || params.dateTo) {
            where.createdAt = {};
            if (params.dateFrom)
                where.createdAt.gte = params.dateFrom;
            if (params.dateTo)
                where.createdAt.lte = params.dateTo;
        }
        // 4. Safe Whitelist Sorting
        const sortFieldMap = {
            createdAt: 'createdAt',
            orderNumber: 'orderNumber',
            grandTotal: 'grandTotal',
            totalAmount: 'grandTotal',
            status: 'status',
        };
        const sortField = (params.sortBy && sortFieldMap[params.sortBy]) || 'createdAt';
        const sortDirection = params.sortOrder === 'asc' ? 'asc' : 'desc';
        const orderBy = { [sortField]: sortDirection };
        const [orders, total] = await Promise.all([
            database_1.prisma.order.findMany({
                where,
                include: this.orderIncludes,
                orderBy,
                skip,
                take: limit,
            }),
            database_1.prisma.order.count({ where }),
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
    static async updateOrderStatus(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: params.orderId },
                include: { shipments: true },
            });
            if (!order) {
                throw new app_error_1.NotFoundException('Order not found');
            }
            if (order.status === params.toStatus) {
                return tx.order.findUnique({
                    where: { id: params.orderId },
                    include: this.orderIncludes,
                });
            }
            // Validate transition
            order_state_machine_1.OrderStateMachine.validateTransition(order.status, params.toStatus);
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
    static async cancelOrder(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: params.orderId },
                include: { shipments: true, payments: true },
            });
            if (!order) {
                throw new app_error_1.NotFoundException('Order not found');
            }
            if (order.status === client_1.OrderStatus.CANCELLED) {
                return tx.order.findUnique({
                    where: { id: params.orderId },
                    include: this.orderIncludes,
                });
            }
            // Check cancellation policy
            if (params.isCustomerAction) {
                const check = order_state_machine_1.OrderStateMachine.canCustomerCancel(order.status, order.shipments);
                if (!check.allowed) {
                    throw new app_error_1.BadRequestException(check.reason || 'Order cannot be cancelled by customer');
                }
            }
            else {
                const check = order_state_machine_1.OrderStateMachine.canStaffCancel(order.status, order.shipments);
                if (!check.allowed) {
                    throw new app_error_1.BadRequestException(check.reason || 'Order cannot be cancelled');
                }
            }
            // Validate transition
            order_state_machine_1.OrderStateMachine.validateTransition(order.status, client_1.OrderStatus.CANCELLED);
            const isPaid = order.payments.some((p) => p.status === client_1.PaymentStatus.PAID);
            const historyNote = isPaid
                ? `${params.reason} (Paid order cancelled — marked eligible for refund under M7 Payment authority)`
                : params.reason;
            await tx.order.update({
                where: { id: order.id },
                data: { status: client_1.OrderStatus.CANCELLED },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    fromStatus: order.status,
                    toStatus: client_1.OrderStatus.CANCELLED,
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
    static async requestReturn(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: params.orderId },
                include: { shipments: true },
            });
            if (!order) {
                throw new app_error_1.NotFoundException('Order not found');
            }
            const check = order_state_machine_1.OrderStateMachine.canRequestReturn(order.status, order.shipments);
            if (!check.allowed) {
                throw new app_error_1.BadRequestException(check.reason || 'Cannot request return for this order');
            }
            order_state_machine_1.OrderStateMachine.validateTransition(order.status, client_1.OrderStatus.RETURN_REQUESTED);
            await tx.order.update({
                where: { id: order.id },
                data: { status: client_1.OrderStatus.RETURN_REQUESTED },
            });
            await tx.orderStatusHistory.create({
                data: {
                    orderId: order.id,
                    fromStatus: order.status,
                    toStatus: client_1.OrderStatus.RETURN_REQUESTED,
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
    static async handleReturnAction(params) {
        return database_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: params.orderId },
            });
            if (!order) {
                throw new app_error_1.NotFoundException('Order not found');
            }
            if (order.status !== client_1.OrderStatus.RETURN_REQUESTED) {
                throw new app_error_1.BadRequestException(`Cannot process return action for order in status '${order.status}'`);
            }
            const targetStatus = params.action === 'APPROVE' ? client_1.OrderStatus.RETURNED : client_1.OrderStatus.DELIVERED;
            order_state_machine_1.OrderStateMachine.validateTransition(order.status, targetStatus);
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
        return database_1.prisma.order.count();
    }
}
exports.OrderRepository = OrderRepository;
//# sourceMappingURL=order.repository.js.map