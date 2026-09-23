"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
const order_schema_1 = require("../schemas/order.schema");
class OrderController {
    // POST /api/v1/checkout
    static async checkout(request, reply) {
        const body = order_schema_1.checkoutSchema.parse(request.body);
        const userId = request.user?.id;
        const sessionToken = request.headers['x-session-token'] ||
            request.cookies?.cart_session_token ||
            undefined;
        const order = await order_service_1.OrderService.checkout({
            userId,
            sessionToken,
            shippingAddress: body.shippingAddress,
            customerNotes: body.customerNotes,
            paymentMethod: body.paymentMethod,
            couponCode: body.couponCode,
            loyaltyPointsToRedeem: body.loyaltyPointsToRedeem,
        });
        return reply.status(201).send({ data: order, message: 'Order created successfully' });
    }
    // GET /api/v1/orders/:id
    static async getById(request, reply) {
        const { id } = request.params;
        const userId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const order = await order_service_1.OrderService.getOrderById(id, userId, userRoles);
        return reply.status(200).send({ data: order });
    }
    // GET /api/v1/orders/by-number/:orderNumber
    static async getByOrderNumber(request, reply) {
        const { orderNumber } = request.params;
        const userId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const order = await order_service_1.OrderService.getOrderByNumber(orderNumber, userId, userRoles);
        return reply.status(200).send({ data: order });
    }
    // GET /api/v1/orders/my-orders
    static async getMyOrders(request, reply) {
        const userId = request.user?.id;
        if (!userId) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required to view order history' });
        }
        const query = order_schema_1.customerOrderQuerySchema.parse(request.query);
        const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
        const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
        const result = await order_service_1.OrderService.getCustomerOrders(userId, {
            ...query,
            dateFrom,
            dateTo,
        });
        return reply.status(200).send({ data: result.orders, pagination: result.pagination });
    }
    // GET /api/v1/orders/:id/timeline
    static async getOrderTimeline(request, reply) {
        const { id } = request.params;
        const userId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const timeline = await order_service_1.OrderService.getOrderTimeline(id, userId, userRoles);
        return reply.status(200).send({ data: timeline });
    }
    // POST /api/v1/orders/:id/cancel
    static async cancelOrder(request, reply) {
        const { id } = request.params;
        const body = order_schema_1.cancelOrderSchema.parse(request.body);
        const userId = request.user?.id;
        if (!userId) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required to cancel order' });
        }
        const order = await order_service_1.OrderService.cancelOrderByCustomer(id, body.reason, userId);
        return reply.status(200).send({ data: order, message: 'Order cancelled successfully' });
    }
    // POST /api/v1/orders/:id/return
    static async requestReturn(request, reply) {
        const { id } = request.params;
        const body = order_schema_1.returnOrderSchema.parse(request.body);
        const userId = request.user?.id;
        if (!userId) {
            return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required to request return' });
        }
        const order = await order_service_1.OrderService.requestReturn(id, body.reason, userId);
        return reply.status(200).send({ data: order, message: 'Return requested successfully' });
    }
    // GET /api/v1/admin/orders
    static async getAdminOrders(request, reply) {
        const query = order_schema_1.adminOrderQuerySchema.parse(request.query);
        const userRoles = request.user?.roles || [];
        const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
        const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
        const result = await order_service_1.OrderService.getAdminOrders({
            ...query,
            dateFrom,
            dateTo,
        }, userRoles);
        return reply.status(200).send({ data: result.orders, pagination: result.pagination });
    }
    // GET /api/v1/admin/orders/:id
    static async getAdminOrderById(request, reply) {
        const { id } = request.params;
        const userId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const order = await order_service_1.OrderService.getOrderById(id, userId, userRoles);
        return reply.status(200).send({ data: order });
    }
    // PATCH /api/v1/admin/orders/:id/status
    static async updateAdminOrderStatus(request, reply) {
        const { id } = request.params;
        const body = order_schema_1.updateOrderStatusSchema.parse(request.body);
        const staffUserId = request.user.id;
        const userRoles = request.user?.roles || [];
        const order = await order_service_1.OrderService.updateOrderStatusByStaff(id, body.toStatus, body.note, staffUserId, userRoles);
        return reply.status(200).send({ data: order, message: 'Order status updated successfully' });
    }
    // POST /api/v1/admin/orders/:id/cancel
    static async cancelAdminOrder(request, reply) {
        const { id } = request.params;
        const body = order_schema_1.cancelOrderSchema.parse(request.body);
        const staffUserId = request.user.id;
        const userRoles = request.user?.roles || [];
        const order = await order_service_1.OrderService.cancelOrderByStaff(id, body.reason, staffUserId, userRoles);
        return reply.status(200).send({ data: order, message: 'Order cancelled by staff' });
    }
    // POST /api/v1/admin/orders/:id/return-action
    static async handleAdminReturnAction(request, reply) {
        const { id } = request.params;
        const body = order_schema_1.returnActionSchema.parse(request.body);
        const staffUserId = request.user.id;
        const userRoles = request.user?.roles || [];
        const order = await order_service_1.OrderService.handleReturnActionByStaff(id, body.action, body.note, staffUserId, userRoles);
        return reply.status(200).send({ data: order, message: `Return ${body.action.toLowerCase()}ed successfully` });
    }
}
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map