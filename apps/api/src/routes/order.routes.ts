import { FastifyInstance } from 'fastify';
import { OrderController } from '../controllers/order.controller';
import { authenticateOptional, authenticate, requireRole } from '../middleware/auth';

export async function orderRoutes(app: FastifyInstance) {
  // 1. Checkout & Public Order Lookup
  app.post('/checkout', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Execute atomic checkout from active cart with server-calculated prices and address snapshot',
      tags: ['Orders & Checkout'],
    },
    handler: OrderController.checkout,
  });

  app.get('/orders/by-number/:orderNumber', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get order details and item snapshots by public order number (e.g. ORD-20260908-1001)',
      tags: ['Orders & Checkout'],
    },
    handler: OrderController.getByOrderNumber,
  });

  app.get('/orders/:id', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get order details and item snapshots by UUID',
      tags: ['Orders & Checkout'],
    },
    handler: OrderController.getById,
  });

  // 2. Customer Order Management & Timeline
  app.get('/orders/my-orders', {
    preHandler: [authenticate],
    schema: {
      description: 'List order history for authenticated customer with filters and pagination',
      tags: ['Orders & Checkout'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: OrderController.getMyOrders,
  });

  app.get('/orders/:id/timeline', {
    preHandler: [authenticateOptional],
    schema: {
      description: 'Get authoritative chronological order timeline',
      tags: ['Orders & Checkout'],
    },
    handler: OrderController.getOrderTimeline,
  });

  app.post('/orders/:id/cancel', {
    preHandler: [authenticate],
    schema: {
      description: 'Customer cancels an unfulfilled order within allowed cancellation policy',
      tags: ['Orders & Checkout'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: OrderController.cancelOrder,
  });

  app.post('/orders/:id/return', {
    preHandler: [authenticate],
    schema: {
      description: 'Customer requests a return for a delivered order',
      tags: ['Orders & Checkout'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: OrderController.requestReturn,
  });

  // 3. Staff Order Management & Actions
  app.get('/admin/orders', {
    preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'])],
    schema: {
      description: 'Staff query orders with search, multi-field filters, sorting, and pagination',
      tags: ['Staff Order Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: OrderController.getAdminOrders,
  });

  app.get('/admin/orders/:id', {
    preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'])],
    schema: {
      description: 'Staff get full order details',
      tags: ['Staff Order Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: OrderController.getAdminOrderById,
  });

  app.patch('/admin/orders/:id/status', {
    preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'])],
    schema: {
      description: 'Staff update order status explicitly via state machine validation',
      tags: ['Staff Order Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: OrderController.updateAdminOrderStatus,
  });

  app.post('/admin/orders/:id/cancel', {
    preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP'])],
    schema: {
      description: 'Staff cancel order with reason and audit trail',
      tags: ['Staff Order Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: OrderController.cancelAdminOrder,
  });

  app.post('/admin/orders/:id/return-action', {
    preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'])],
    schema: {
      description: 'Staff approve or reject return request',
      tags: ['Staff Order Management'],
      security: [{ cookieAuth: [] }, { bearerAuth: [] }],
    },
    handler: OrderController.handleAdminReturnAction,
  });
}
