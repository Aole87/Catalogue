"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodsReceiptController = void 0;
const goods_receipt_service_1 = require("../services/goods-receipt.service");
const goods_receipt_schema_1 = require("../schemas/goods-receipt.schema");
const app_error_1 = require("../errors/app-error");
class GoodsReceiptController {
    static async getReceipts(request, reply) {
        const query = goods_receipt_schema_1.goodsReceiptQuerySchema.parse(request.query);
        const result = await goods_receipt_service_1.GoodsReceiptService.getReceipts(query);
        return reply.status(200).send({ data: result.receipts, pagination: result.pagination });
    }
    static async getReceiptById(request, reply) {
        const { id } = request.params;
        const receipt = await goods_receipt_service_1.GoodsReceiptService.getReceiptById(id);
        return reply.status(200).send({ data: receipt });
    }
    static async receiveGoods(request, reply) {
        const headerIdempotencyKey = (request.headers['idempotency-key'] || request.headers['x-idempotency-key']);
        const rawBody = (request.body && typeof request.body === 'object') ? { ...request.body } : {};
        if (headerIdempotencyKey && !rawBody.idempotencyKey) {
            rawBody.idempotencyKey = headerIdempotencyKey;
        }
        const body = goods_receipt_schema_1.receiveGoodsSchema.parse(rawBody);
        const poId = request.params?.id || body.purchaseOrderId;
        if (!poId) {
            throw new app_error_1.BadRequestException('Purchase Order ID is required');
        }
        const actorId = request.user.id;
        const receipt = await goods_receipt_service_1.GoodsReceiptService.receiveGoods(poId, body, actorId);
        return reply.status(201).send({ data: receipt, message: 'Goods received and stock updated successfully' });
    }
}
exports.GoodsReceiptController = GoodsReceiptController;
//# sourceMappingURL=goods-receipt.controller.js.map