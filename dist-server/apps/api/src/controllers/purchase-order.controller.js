"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrderController = void 0;
const purchase_order_service_1 = require("../services/purchase-order.service");
const purchase_order_schema_1 = require("../schemas/purchase-order.schema");
class PurchaseOrderController {
    static async getPurchaseOrders(request, reply) {
        const query = purchase_order_schema_1.purchaseOrderQuerySchema.parse(request.query);
        const result = await purchase_order_service_1.PurchaseOrderService.getPurchaseOrders(query);
        return reply.status(200).send({ data: result.orders, pagination: result.pagination });
    }
    static async getPurchaseOrderById(request, reply) {
        const { id } = request.params;
        const po = await purchase_order_service_1.PurchaseOrderService.getPurchaseOrderById(id);
        return reply.status(200).send({ data: po });
    }
    static async createDraftPO(request, reply) {
        const body = purchase_order_schema_1.createPurchaseOrderSchema.parse(request.body);
        const actorId = request.user.id;
        const po = await purchase_order_service_1.PurchaseOrderService.createDraftPO(body, actorId);
        return reply.status(201).send({ data: po, message: 'Purchase Order draft created successfully' });
    }
    static async updateDraftPO(request, reply) {
        const { id } = request.params;
        const body = purchase_order_schema_1.updatePurchaseOrderSchema.parse(request.body);
        const actorId = request.user.id;
        const po = await purchase_order_service_1.PurchaseOrderService.updatePO(id, body, actorId);
        return reply.status(200).send({ data: po, message: 'Purchase Order updated successfully' });
    }
    static async submitForApproval(request, reply) {
        const { id } = request.params;
        const actorId = request.user.id;
        const po = await purchase_order_service_1.PurchaseOrderService.submitForApproval(id, actorId);
        return reply.status(200).send({ data: po, message: 'Purchase Order submitted for approval' });
    }
    static async approvePO(request, reply) {
        const { id } = request.params;
        const body = purchase_order_schema_1.approvePurchaseOrderSchema.parse(request.body || {});
        const actorId = request.user.id;
        const po = await purchase_order_service_1.PurchaseOrderService.approvePO(id, actorId, body.overrideReason, request.user);
        return reply.status(200).send({ data: po, message: 'Purchase Order approved successfully' });
    }
    static async rejectPO(request, reply) {
        const { id } = request.params;
        const body = purchase_order_schema_1.rejectPurchaseOrderSchema.parse(request.body);
        const actorId = request.user.id;
        const po = await purchase_order_service_1.PurchaseOrderService.rejectPO(id, actorId, body.reason);
        return reply.status(200).send({ data: po, message: 'Purchase Order rejected' });
    }
    static async sendPO(request, reply) {
        const { id } = request.params;
        const actorId = request.user.id;
        const po = await purchase_order_service_1.PurchaseOrderService.sendPO(id, actorId);
        return reply.status(200).send({ data: po, message: 'Purchase Order marked as SENT to supplier' });
    }
    static async cancelPO(request, reply) {
        const { id } = request.params;
        const body = purchase_order_schema_1.cancelPurchaseOrderSchema.parse(request.body);
        const actorId = request.user.id;
        const po = await purchase_order_service_1.PurchaseOrderService.cancelPO(id, actorId, body.reason);
        return reply.status(200).send({ data: po, message: 'Purchase Order cancelled' });
    }
}
exports.PurchaseOrderController = PurchaseOrderController;
//# sourceMappingURL=purchase-order.controller.js.map