import { FastifyInstance } from 'fastify';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, authenticateOptional, requireRole, requirePermission } from '../middleware/auth';

export async function paymentRoutes(fastify: FastifyInstance) {
  // 1. Inbound Provider Webhooks (Signature & Replay protected)
  fastify.post('/payments/webhooks/:provider', PaymentController.handleWebhook);

  // 2. Customer & Guest Payment Initialization & Query
  fastify.post('/payments', { preHandler: [authenticateOptional] }, PaymentController.createPayment);
  fastify.get('/payments/:id', { preHandler: [authenticateOptional] }, PaymentController.getPaymentById);
  fastify.get('/orders/:orderId/payment', { preHandler: [authenticateOptional] }, PaymentController.getPaymentByOrderId);

  // 3. Bank Transfer Slip Submission (Customer / Guest)
  fastify.post('/payments/:id/slip', { preHandler: [authenticateOptional] }, PaymentController.submitSlip);

  // 4. Staff Actions: Slip Verification & Rejection (Requires authentication + staff permission/role)
  fastify.post(
    '/payments/slips/:slipId/verify',
    { preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'ACCOUNTANT', 'SALES_REP'])] },
    PaymentController.verifySlip
  );

  fastify.post(
    '/payments/slips/:slipId/reject',
    { preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'ACCOUNTANT', 'SALES_REP'])] },
    PaymentController.rejectSlip
  );

  // 5. Staff Actions: Refunds (Requires authentication + staff role/permission)
  fastify.post(
    '/payments/:id/refund',
    { preHandler: [requireRole(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'ACCOUNTANT'])] },
    PaymentController.refundPayment
  );
}
