"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrderRoutes = purchaseOrderRoutes;
const purchase_order_controller_1 = require("../controllers/purchase-order.controller");
const auth_1 = require("../middleware/auth");
async function purchaseOrderRoutes(app) {
    const staffRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'];
    const managerRoles = ['SUPER_ADMIN', 'STORE_MANAGER'];
    const registerRoutes = (prefix) => {
        app.get(`${prefix}`, {
            preHandler: [(0, auth_1.requireRole)(staffRoles)],
            schema: {
                description: 'List purchase orders with status filtering, date range, and pagination',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.getPurchaseOrders,
        });
        app.get(`${prefix}/:id`, {
            preHandler: [(0, auth_1.requireRole)(staffRoles)],
            schema: {
                description: 'Get purchase order details and line items by UUID',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.getPurchaseOrderById,
        });
        app.post(`${prefix}`, {
            preHandler: [(0, auth_1.requireRole)(managerRoles)],
            schema: {
                description: 'Create a new draft purchase order with server-calculated totals',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.createDraftPO,
        });
        app.patch(`${prefix}/:id`, {
            preHandler: [(0, auth_1.requireRole)(managerRoles)],
            schema: {
                description: 'Update draft purchase order metadata',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.updateDraftPO,
        });
        app.post(`${prefix}/:id/submit`, {
            preHandler: [(0, auth_1.requireRole)(managerRoles)],
            schema: {
                description: 'Submit a draft purchase order for approval',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.submitForApproval,
        });
        app.post(`${prefix}/:id/approve`, {
            preHandler: [(0, auth_1.requireRole)(managerRoles)],
            schema: {
                description: 'Approve a purchase order (enforces separation of duties: creator cannot approve)',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.approvePO,
        });
        app.post(`${prefix}/:id/reject`, {
            preHandler: [(0, auth_1.requireRole)(managerRoles)],
            schema: {
                description: 'Reject a purchase order with mandatory reason',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.rejectPO,
        });
        app.post(`${prefix}/:id/send`, {
            preHandler: [(0, auth_1.requireRole)(managerRoles)],
            schema: {
                description: 'Mark approved purchase order as sent to supplier',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.sendPO,
        });
        app.post(`${prefix}/:id/cancel`, {
            preHandler: [(0, auth_1.requireRole)(managerRoles)],
            schema: {
                description: 'Cancel a purchase order with mandatory reason',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: purchase_order_controller_1.PurchaseOrderController.cancelPO,
        });
    };
    registerRoutes('/purchase-orders');
    registerRoutes('/procurement/orders');
}
//# sourceMappingURL=purchase-order.routes.js.map