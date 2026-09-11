import { FastifyRequest, FastifyReply } from 'fastify';
import { InventoryService } from '../services/inventory.service';
import {
  inventoryQuerySchema,
  reserveStockSchema,
  adjustStockSchema,
  transferStockSchema,
  returnDispositionSchema,
  movementQuerySchema,
} from '../schemas/inventory.schema';

export class InventoryController {
  static async getInventory(request: FastifyRequest, reply: FastifyReply) {
    const query = inventoryQuerySchema.parse(request.query);
    const result = await InventoryService.getInventory(query);
    return reply.status(200).send({ data: result.items, pagination: result.pagination });
  }

  static async getInventoryById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const item = await InventoryService.getInventoryById(id);
    return reply.status(200).send({ data: item });
  }

  static async getProductAvailability(request: FastifyRequest, reply: FastifyReply) {
    const { productId } = request.params as { productId: string };
    const query = request.query as { warehouseId?: string };
    const result = await InventoryService.getProductAvailability(productId, query?.warehouseId);
    return reply.status(200).send({ data: result });
  }

  static async getDashboardMetrics(request: FastifyRequest, reply: FastifyReply) {
    const metrics = await InventoryService.getDashboardMetrics();
    return reply.status(200).send({ data: metrics });
  }

  static async reserveStock(request: FastifyRequest, reply: FastifyReply) {
    const body = reserveStockSchema.parse(request.body);
    const actorId = request.user?.id;
    const reservation = await InventoryService.reserveStock(body, actorId);
    return reply.status(201).send({ data: reservation, message: 'Stock reserved successfully' });
  }

  static async releaseReservation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = (request.body as { reason?: string }) || {};
    const actorId = request.user?.id;
    const reservation = await InventoryService.releaseReservation(id, actorId, body.reason, request.user);
    return reply.status(200).send({ data: reservation, message: 'Stock reservation released successfully' });
  }

  static async commitReservation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = (request.body as { notes?: string; orderId?: string }) || {};
    const actorId = request.user?.id;
    const reservation = await InventoryService.commitReservation(id, actorId, body.notes, body.orderId, request.user);
    return reply.status(200).send({ data: reservation, message: 'Stock reservation committed successfully' });
  }

  static async adjustStock(request: FastifyRequest, reply: FastifyReply) {
    const body = adjustStockSchema.parse(request.body);
    const actorId = request.user!.id;
    const result = await InventoryService.adjustStock(body, actorId);
    return reply.status(200).send({ data: result, message: 'Stock adjusted successfully' });
  }

  static async transferStock(request: FastifyRequest, reply: FastifyReply) {
    const body = transferStockSchema.parse(request.body);
    const actorId = request.user!.id;
    const result = await InventoryService.transferStock(body, actorId);
    return reply.status(200).send({ data: result, message: 'Stock transferred successfully' });
  }

  static async handleReturnDisposition(request: FastifyRequest, reply: FastifyReply) {
    const body = returnDispositionSchema.parse(request.body);
    const actorId = request.user!.id;
    const result = await InventoryService.handleReturnDisposition(body, actorId);
    return reply.status(200).send({ data: result, message: `Return disposition ${body.disposition} processed` });
  }

  static async getMovements(request: FastifyRequest, reply: FastifyReply) {
    const query = movementQuerySchema.parse(request.query);
    const result = await InventoryService.getMovements(query);
    return reply.status(200).send({ data: result.movements, pagination: result.pagination });
  }
}
