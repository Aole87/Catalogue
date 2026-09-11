import { FastifyRequest, FastifyReply } from 'fastify';
import { PurchaseOrderService } from '../services/purchase-order.service';
import {
  purchaseOrderQuerySchema,
  createPurchaseOrderSchema,
  updatePurchaseOrderSchema,
  approvePurchaseOrderSchema,
  rejectPurchaseOrderSchema,
  cancelPurchaseOrderSchema,
} from '../schemas/purchase-order.schema';

export class PurchaseOrderController {
  static async getPurchaseOrders(request: FastifyRequest, reply: FastifyReply) {
    const query = purchaseOrderQuerySchema.parse(request.query);
    const result = await PurchaseOrderService.getPurchaseOrders(query);
    return reply.status(200).send({ data: result.orders, pagination: result.pagination });
  }

  static async getPurchaseOrderById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const po = await PurchaseOrderService.getPurchaseOrderById(id);
    return reply.status(200).send({ data: po });
  }

  static async createDraftPO(request: FastifyRequest, reply: FastifyReply) {
    const body = createPurchaseOrderSchema.parse(request.body);
    const actorId = request.user!.id;
    const po = await PurchaseOrderService.createDraftPO(body, actorId);
    return reply.status(201).send({ data: po, message: 'Purchase Order draft created successfully' });
  }

  static async updateDraftPO(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updatePurchaseOrderSchema.parse(request.body);
    const actorId = request.user!.id;
    const po = await PurchaseOrderService.updatePO(id, body, actorId);
    return reply.status(200).send({ data: po, message: 'Purchase Order updated successfully' });
  }

  static async submitForApproval(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const actorId = request.user!.id;
    const po = await PurchaseOrderService.submitForApproval(id, actorId);
    return reply.status(200).send({ data: po, message: 'Purchase Order submitted for approval' });
  }

  static async approvePO(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = approvePurchaseOrderSchema.parse(request.body || {});
    const actorId = request.user!.id;
    const po = await PurchaseOrderService.approvePO(id, actorId, body.overrideReason, request.user);
    return reply.status(200).send({ data: po, message: 'Purchase Order approved successfully' });
  }

  static async rejectPO(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = rejectPurchaseOrderSchema.parse(request.body);
    const actorId = request.user!.id;
    const po = await PurchaseOrderService.rejectPO(id, actorId, body.reason);
    return reply.status(200).send({ data: po, message: 'Purchase Order rejected' });
  }

  static async sendPO(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const actorId = request.user!.id;
    const po = await PurchaseOrderService.sendPO(id, actorId);
    return reply.status(200).send({ data: po, message: 'Purchase Order marked as SENT to supplier' });
  }

  static async cancelPO(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = cancelPurchaseOrderSchema.parse(request.body);
    const actorId = request.user!.id;
    const po = await PurchaseOrderService.cancelPO(id, actorId, body.reason);
    return reply.status(200).send({ data: po, message: 'Purchase Order cancelled' });
  }
}
