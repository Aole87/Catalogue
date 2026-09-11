import { FastifyRequest, FastifyReply } from 'fastify';
import { OrderService } from '../services/order.service';
import {
  checkoutSchema,
  cancelOrderSchema,
  returnOrderSchema,
  returnActionSchema,
  updateOrderStatusSchema,
  customerOrderQuerySchema,
  adminOrderQuerySchema,
} from '../schemas/order.schema';

export class OrderController {
  // POST /api/v1/checkout
  static async checkout(request: FastifyRequest, reply: FastifyReply) {
    const body = checkoutSchema.parse(request.body);
    const userId = request.user?.id;
    const sessionToken =
      (request.headers['x-session-token'] as string) ||
      request.cookies?.cart_session_token ||
      undefined;

    const order = await OrderService.checkout({
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
  static async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const order = await OrderService.getOrderById(id, userId, userRoles);
    return reply.status(200).send({ data: order });
  }

  // GET /api/v1/orders/by-number/:orderNumber
  static async getByOrderNumber(request: FastifyRequest, reply: FastifyReply) {
    const { orderNumber } = request.params as { orderNumber: string };
    const userId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const order = await OrderService.getOrderByNumber(orderNumber, userId, userRoles);
    return reply.status(200).send({ data: order });
  }

  // GET /api/v1/orders/my-orders
  static async getMyOrders(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required to view order history' });
    }

    const query = customerOrderQuerySchema.parse(request.query);
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    const result = await OrderService.getCustomerOrders(userId, {
      ...query,
      dateFrom,
      dateTo,
    });

    return reply.status(200).send({ data: result.orders, pagination: result.pagination });
  }

  // GET /api/v1/orders/:id/timeline
  static async getOrderTimeline(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const timeline = await OrderService.getOrderTimeline(id, userId, userRoles);
    return reply.status(200).send({ data: timeline });
  }

  // POST /api/v1/orders/:id/cancel
  static async cancelOrder(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = cancelOrderSchema.parse(request.body);
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required to cancel order' });
    }

    const order = await OrderService.cancelOrderByCustomer(id, body.reason, userId);
    return reply.status(200).send({ data: order, message: 'Order cancelled successfully' });
  }

  // POST /api/v1/orders/:id/return
  static async requestReturn(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = returnOrderSchema.parse(request.body);
    const userId = request.user?.id;

    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required to request return' });
    }

    const order = await OrderService.requestReturn(id, body.reason, userId);
    return reply.status(200).send({ data: order, message: 'Return requested successfully' });
  }

  // GET /api/v1/admin/orders
  static async getAdminOrders(request: FastifyRequest, reply: FastifyReply) {
    const query = adminOrderQuerySchema.parse(request.query);
    const userRoles = request.user?.roles || [];
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    const result = await OrderService.getAdminOrders(
      {
        ...query,
        dateFrom,
        dateTo,
      },
      userRoles
    );

    return reply.status(200).send({ data: result.orders, pagination: result.pagination });
  }

  // GET /api/v1/admin/orders/:id
  static async getAdminOrderById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const userId = request.user?.id;
    const userRoles = request.user?.roles || [];

    const order = await OrderService.getOrderById(id, userId, userRoles);
    return reply.status(200).send({ data: order });
  }

  // PATCH /api/v1/admin/orders/:id/status
  static async updateAdminOrderStatus(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateOrderStatusSchema.parse(request.body);
    const staffUserId = request.user!.id;
    const userRoles = request.user?.roles || [];

    const order = await OrderService.updateOrderStatusByStaff(id, body.toStatus, body.note, staffUserId, userRoles);
    return reply.status(200).send({ data: order, message: 'Order status updated successfully' });
  }

  // POST /api/v1/admin/orders/:id/cancel
  static async cancelAdminOrder(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = cancelOrderSchema.parse(request.body);
    const staffUserId = request.user!.id;
    const userRoles = request.user?.roles || [];

    const order = await OrderService.cancelOrderByStaff(id, body.reason, staffUserId, userRoles);
    return reply.status(200).send({ data: order, message: 'Order cancelled by staff' });
  }

  // POST /api/v1/admin/orders/:id/return-action
  static async handleAdminReturnAction(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = returnActionSchema.parse(request.body);
    const staffUserId = request.user!.id;
    const userRoles = request.user?.roles || [];

    const order = await OrderService.handleReturnActionByStaff(id, body.action, body.note, staffUserId, userRoles);
    return reply.status(200).send({ data: order, message: `Return ${body.action.toLowerCase()}ed successfully` });
  }
}
