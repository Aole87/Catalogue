"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingRoutes = shippingRoutes;
const shipping_controller_1 = require("../controllers/shipping.controller");
const auth_1 = require("../middleware/auth");
async function shippingRoutes(fastify) {
    // 1. Inbound Carrier Webhooks (Signature & Replay protected)
    fastify.post('/shipments/webhooks/:provider', shipping_controller_1.ShippingController.handleWebhook);
    // 2. Public Shipping Methods & Tracking Lookup
    fastify.get('/shipping-methods', shipping_controller_1.ShippingController.getShippingMethods);
    fastify.get('/tracking/:trackingNumber', shipping_controller_1.ShippingController.getShipmentTracking);
    // 3. Customer & Staff Shipment Query / Creation
    fastify.post('/shipments', { preHandler: [auth_1.authenticateOptional] }, shipping_controller_1.ShippingController.createShipment);
    fastify.get('/shipments/:id', { preHandler: [auth_1.authenticateOptional] }, shipping_controller_1.ShippingController.getShipmentById);
    fastify.get('/orders/:orderId/shipments', { preHandler: [auth_1.authenticateOptional] }, shipping_controller_1.ShippingController.getShipmentsByOrderId);
    // 4. Staff Fulfillment Dashboard & Management Actions
    fastify.get('/admin/shipments', { preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'INVENTORY_CLERK', 'WAREHOUSE', 'ACCOUNTANT'])] }, shipping_controller_1.ShippingController.getAdminShipments);
    fastify.patch('/admin/shipments/:id/status', { preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'])] }, shipping_controller_1.ShippingController.updateShipmentStatus);
    fastify.post('/admin/shipments/:id/tracking', { preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'])] }, shipping_controller_1.ShippingController.assignTracking);
    fastify.post('/admin/shipments/:id/cancel', { preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'INVENTORY_CLERK', 'WAREHOUSE'])] }, shipping_controller_1.ShippingController.cancelShipment);
}
//# sourceMappingURL=shipping.routes.js.map