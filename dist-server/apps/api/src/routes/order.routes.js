"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = orderRoutes;
const order_controller_1 = require("../controllers/order.controller");
const auth_1 = require("../middleware/auth");
async function orderRoutes(app) {
    // 1. Checkout & Public Order Lookup
    app.post('/checkout', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Execute atomic checkout from active cart with server-calculated prices and address snapshot',
            tags: ['Orders & Checkout'],
        },
        handler: order_controller_1.OrderController.checkout,
    });
    app.get('/orders/by-number/:orderNumber', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Get order details and item snapshots by public order number (e.g. ORD-20260908-1001)',
            tags: ['Orders & Checkout'],
        },
        handler: order_controller_1.OrderController.getByOrderNumber,
    });
    app.get('/orders/:id', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Get order details and item snapshots by UUID',
            tags: ['Orders & Checkout'],
        },
        handler: order_controller_1.OrderController.getById,
    });
    // 2. Customer Order Management & Timeline
    app.get('/orders/my-orders', {
        preHandler: [auth_1.authenticate],
        schema: {
            description: 'List order history for authenticated customer with filters and pagination',
            tags: ['Orders & Checkout'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: order_controller_1.OrderController.getMyOrders,
    });
    app.get('/orders/:id/timeline', {
        preHandler: [auth_1.authenticateOptional],
        schema: {
            description: 'Get authoritative chronological order timeline',
            tags: ['Orders & Checkout'],
        },
        handler: order_controller_1.OrderController.getOrderTimeline,
    });
    app.post('/orders/:id/cancel', {
        preHandler: [auth_1.authenticate],
        schema: {
            description: 'Customer cancels an unfulfilled order within allowed cancellation policy',
            tags: ['Orders & Checkout'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: order_controller_1.OrderController.cancelOrder,
    });
    app.post('/orders/:id/return', {
        preHandler: [auth_1.authenticate],
        schema: {
            description: 'Customer requests a return for a delivered order',
            tags: ['Orders & Checkout'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: order_controller_1.OrderController.requestReturn,
    });
    // 3. Staff Order Management & Actions
    app.get('/admin/orders', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'])],
        schema: {
            description: 'Staff query orders with search, multi-field filters, sorting, and pagination',
            tags: ['Staff Order Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: order_controller_1.OrderController.getAdminOrders,
    });
    app.get('/admin/orders/:id', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'ACCOUNTANT', 'INVENTORY_CLERK', 'WAREHOUSE'])],
        schema: {
            description: 'Staff get full order details',
            tags: ['Staff Order Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: order_controller_1.OrderController.getAdminOrderById,
    });
    app.patch('/admin/orders/:id/status', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'])],
        schema: {
            description: 'Staff update order status explicitly via state machine validation',
            tags: ['Staff Order Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: order_controller_1.OrderController.updateAdminOrderStatus,
    });
    app.post('/admin/orders/:id/cancel', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP'])],
        schema: {
            description: 'Staff cancel order with reason and audit trail',
            tags: ['Staff Order Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: order_controller_1.OrderController.cancelAdminOrder,
    });
    app.post('/admin/orders/:id/return-action', {
        preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'])],
        schema: {
            description: 'Staff approve or reject return request',
            tags: ['Staff Order Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: order_controller_1.OrderController.handleAdminReturnAction,
    });
}
//# sourceMappingURL=order.routes.js.map