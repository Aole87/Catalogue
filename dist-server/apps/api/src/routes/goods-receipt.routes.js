"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goodsReceiptRoutes = goodsReceiptRoutes;
const goods_receipt_controller_1 = require("../controllers/goods-receipt.controller");
const auth_1 = require("../middleware/auth");
async function goodsReceiptRoutes(app) {
    const staffRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'ACCOUNTANT', 'SALES_REP'];
    const receivingRoles = ['SUPER_ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK'];
    const registerRoutes = (prefix) => {
        app.get(`${prefix}`, {
            preHandler: [(0, auth_1.requireRole)(staffRoles)],
            schema: {
                description: 'List goods receipt notes (GRNs) with filters and pagination',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: goods_receipt_controller_1.GoodsReceiptController.getReceipts,
        });
        app.get(`${prefix}/:id`, {
            preHandler: [(0, auth_1.requireRole)(staffRoles)],
            schema: {
                description: 'Get goods receipt note details and line items by UUID',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: goods_receipt_controller_1.GoodsReceiptController.getReceiptById,
        });
        app.post(`${prefix}`, {
            preHandler: [(0, auth_1.requireRole)(receivingRoles)],
            schema: {
                description: 'Receive goods against purchase order (atomic stock increment in M10 inventory and GRN creation)',
                tags: ['Supplier & Procurement Management'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
            },
            handler: goods_receipt_controller_1.GoodsReceiptController.receiveGoods,
        });
    };
    registerRoutes('/goods-receipts');
    registerRoutes('/procurement/receipts');
    app.post('/purchase-orders/:id/receive', {
        preHandler: [(0, auth_1.requireRole)(receivingRoles)],
        schema: {
            description: 'Receive goods against purchase order by PO ID',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: goods_receipt_controller_1.GoodsReceiptController.receiveGoods,
    });
    app.post('/procurement/orders/:id/receive', {
        preHandler: [(0, auth_1.requireRole)(receivingRoles)],
        schema: {
            description: 'Receive goods against procurement order by PO ID',
            tags: ['Supplier & Procurement Management'],
            security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        },
        handler: goods_receipt_controller_1.GoodsReceiptController.receiveGoods,
    });
}
//# sourceMappingURL=goods-receipt.routes.js.map