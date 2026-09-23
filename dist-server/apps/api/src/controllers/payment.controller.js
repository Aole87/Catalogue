"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_1 = require("../services/payment.service");
const payment_schema_1 = require("../schemas/payment.schema");
class PaymentController {
    static async createPayment(request, reply) {
        const body = payment_schema_1.createPaymentSchema.parse(request.body);
        const userId = request.user?.id;
        const payment = await payment_service_1.PaymentService.createPayment({
            ...body,
            userId,
        });
        return reply.status(201).send({ data: payment });
    }
    static async getPaymentById(request, reply) {
        const { id } = request.params;
        const userId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const payment = await payment_service_1.PaymentService.getPaymentById(id, userId, userRoles);
        return reply.send({ data: payment });
    }
    static async getPaymentByOrderId(request, reply) {
        const { orderId } = request.params;
        const userId = request.user?.id;
        const userRoles = request.user?.roles || [];
        const payment = await payment_service_1.PaymentService.getPaymentByOrderId(orderId, userId, userRoles);
        return reply.send({ data: payment });
    }
    static async submitSlip(request, reply) {
        const { id } = request.params;
        const body = payment_schema_1.submitSlipSchema.parse(request.body);
        const userId = request.user?.id;
        const slip = await payment_service_1.PaymentService.submitSlip(id, {
            ...body,
            transferredAt: body.transferredAt ? new Date(body.transferredAt) : undefined,
        }, userId);
        return reply.status(201).send({ data: slip });
    }
    static async verifySlip(request, reply) {
        const { slipId } = request.params;
        const body = payment_schema_1.verifySlipSchema.parse(request.body);
        const staffUserId = request.user.id;
        const payment = await payment_service_1.PaymentService.verifySlip(slipId, body, staffUserId);
        return reply.send({ data: payment });
    }
    static async rejectSlip(request, reply) {
        const { slipId } = request.params;
        const body = payment_schema_1.rejectSlipSchema.parse(request.body);
        const staffUserId = request.user.id;
        const slip = await payment_service_1.PaymentService.rejectSlip(slipId, body, staffUserId);
        return reply.send({ data: slip });
    }
    static async handleWebhook(request, reply) {
        const { provider } = request.params;
        const rawBody = request.body;
        const headers = request.headers;
        const result = await payment_service_1.PaymentService.handleWebhook(provider, rawBody, headers);
        return reply.status(200).send(result);
    }
    static async refundPayment(request, reply) {
        const { id } = request.params;
        const body = payment_schema_1.refundPaymentSchema.parse(request.body);
        const staffUserId = request.user.id;
        const result = await payment_service_1.PaymentService.refundPayment(id, body, staffUserId);
        return reply.send({ data: result });
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map