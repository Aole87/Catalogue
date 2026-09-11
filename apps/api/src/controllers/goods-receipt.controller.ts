import { FastifyRequest, FastifyReply } from 'fastify';
import { GoodsReceiptService } from '../services/goods-receipt.service';
import {
  goodsReceiptQuerySchema,
  receiveGoodsSchema,
} from '../schemas/goods-receipt.schema';
import { BadRequestException } from '../errors/app-error';

export class GoodsReceiptController {
  static async getReceipts(request: FastifyRequest, reply: FastifyReply) {
    const query = goodsReceiptQuerySchema.parse(request.query);
    const result = await GoodsReceiptService.getReceipts(query);
    return reply.status(200).send({ data: result.receipts, pagination: result.pagination });
  }

  static async getReceiptById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const receipt = await GoodsReceiptService.getReceiptById(id);
    return reply.status(200).send({ data: receipt });
  }

  static async receiveGoods(request: FastifyRequest, reply: FastifyReply) {
    const headerIdempotencyKey = (request.headers['idempotency-key'] || request.headers['x-idempotency-key']) as string | undefined;
    const rawBody = (request.body && typeof request.body === 'object') ? { ...request.body as object } : {};
    if (headerIdempotencyKey && !(rawBody as any).idempotencyKey) {
      (rawBody as any).idempotencyKey = headerIdempotencyKey;
    }
    const body = receiveGoodsSchema.parse(rawBody);
    const poId = (request.params as any)?.id || body.purchaseOrderId;
    if (!poId) {
      throw new BadRequestException('Purchase Order ID is required');
    }
    const actorId = request.user!.id;
    const receipt = await GoodsReceiptService.receiveGoods(poId, body, actorId);
    return reply.status(201).send({ data: receipt, message: 'Goods received and stock updated successfully' });
  }
}
