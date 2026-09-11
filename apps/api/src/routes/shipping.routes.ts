import { FastifyInstance } from 'fastify';
import { ShippingController } from '../controllers/shipping.controller';
import { authenticateOptional, requireRole } from '../middleware/auth';

export async function shippingRoutes(fastify: FastifyInstance) {
  // 1. Inbound Carrier Webhooks (Signature & Replay protected)
  fastify.post('/shipments/webhooks/:provider', ShippingController.handleWebhook);

  // 2. Public Shipping Methods & Tracking Lookup
  fastify.get('/shipping-methods', ShippingController.getShippingMethods);
  fastify.get('/tracking/:trackingNumber', ShippingController.getShipmentTracking);

  // 3. Customer & Staff Shipment Query / Creation
  fastify.post('/shipments', { preHandler: [authenticateOptional] }, ShippingController.createShipment);
  fastify.get('/shipments/:id', { preHandler: [authenticateOptional] }, ShippingController.getShipmentById);
  fastify.get('/orders/:orderId/shipments', { preHandler: [authenticateOptional] }, ShippingController.getShipmentsByOrderId);

  // 4. Staff Fulfillment Dashboard & Management Actions
  fastify.get(
    '/admin/shipments',
    { preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'INVENTORY_CLERK', 'WAREHOUSE', 'ACCOUNTANT'])] },
    ShippingController.getAdminShipments
  );

  fastify.patch(
    '/admin/shipments/:id/status',
    { preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'])] },
    ShippingController.updateShipmentStatus
  );

  fastify.post(
    '/admin/shipments/:id/tracking',
    { preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'INVENTORY_CLERK', 'WAREHOUSE'])] },
    ShippingController.assignTracking
  );

  fastify.post(
    '/admin/shipments/:id/cancel',
    { preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'SALES_REP', 'INVENTORY_CLERK', 'WAREHOUSE'])] },
    ShippingController.cancelShipment
  );
}
