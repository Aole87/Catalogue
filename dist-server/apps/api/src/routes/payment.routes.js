"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = paymentRoutes;
const payment_controller_1 = require("../controllers/payment.controller");
const auth_1 = require("../middleware/auth");
async function paymentRoutes(fastify) {
    // 1. Inbound Provider Webhooks (Signature & Replay protected)
    fastify.post('/payments/webhooks/:provider', payment_controller_1.PaymentController.handleWebhook);
    // 2. Customer & Guest Payment Initialization & Query
    fastify.post('/payments', { preHandler: [auth_1.authenticateOptional] }, payment_controller_1.PaymentController.createPayment);
    fastify.get('/payments/:id', { preHandler: [auth_1.authenticateOptional] }, payment_controller_1.PaymentController.getPaymentById);
    fastify.get('/orders/:orderId/payment', { preHandler: [auth_1.authenticateOptional] }, payment_controller_1.PaymentController.getPaymentByOrderId);
    // 3. Bank Transfer Slip Submission (Customer / Guest)
    fastify.post('/payments/:id/slip', { preHandler: [auth_1.authenticateOptional] }, payment_controller_1.PaymentController.submitSlip);
    // 4. Staff Actions: Slip Verification & Rejection (Requires authentication + staff permission/role)
    fastify.post('/payments/slips/:slipId/verify', { preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'ACCOUNTANT', 'SALES_REP'])] }, payment_controller_1.PaymentController.verifySlip);
    fastify.post('/payments/slips/:slipId/reject', { preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'ACCOUNTANT', 'SALES_REP'])] }, payment_controller_1.PaymentController.rejectSlip);
    // 5. Staff Actions: Refunds (Requires authentication + staff role/permission)
    fastify.post('/payments/:id/refund', { preHandler: [(0, auth_1.requireRole)(['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'ACCOUNTANT'])] }, payment_controller_1.PaymentController.refundPayment);
}
//# sourceMappingURL=payment.routes.js.map