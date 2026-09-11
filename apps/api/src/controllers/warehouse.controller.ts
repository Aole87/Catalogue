import { FastifyRequest, FastifyReply } from 'fastify';
import { WarehouseService } from '../services/warehouse.service';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  createLocationSchema,
  updateLocationSchema,
} from '../schemas/inventory.schema';

export class WarehouseController {
  static async getWarehouses(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { includeInactive?: string };
    const includeInactive = query?.includeInactive === 'true';
    const warehouses = await WarehouseService.getWarehouses(includeInactive);
    return reply.status(200).send({ data: warehouses });
  }

  static async getWarehouseById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const warehouse = await WarehouseService.getWarehouseById(id);
    return reply.status(200).send({ data: warehouse });
  }

  static async createWarehouse(request: FastifyRequest, reply: FastifyReply) {
    const body = createWarehouseSchema.parse(request.body);
    const actorId = request.user?.id;
    const warehouse = await WarehouseService.createWarehouse(body, actorId);
    return reply.status(201).send({ data: warehouse, message: 'Warehouse created successfully' });
  }

  static async updateWarehouse(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateWarehouseSchema.parse(request.body);
    const actorId = request.user?.id;
    const warehouse = await WarehouseService.updateWarehouse(id, body, actorId);
    return reply.status(200).send({ data: warehouse, message: 'Warehouse updated successfully' });
  }

  static async deleteWarehouse(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const actorId = request.user?.id;
    const warehouse = await WarehouseService.deleteWarehouse(id, actorId);
    return reply.status(200).send({ data: warehouse, message: 'Warehouse deleted successfully' });
  }

  // Location Handlers
  static async getLocations(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const query = request.query as { includeInactive?: string };
    const includeInactive = query?.includeInactive === 'true';
    const locations = await WarehouseService.getLocations(id, includeInactive);
    return reply.status(200).send({ data: locations });
  }

  static async getLocationById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const location = await WarehouseService.getLocationById(id);
    return reply.status(200).send({ data: location });
  }

  static async createLocation(request: FastifyRequest, reply: FastifyReply) {
    const { id: warehouseIdParam } = (request.params as { id?: string }) || {};
    const rawBody = typeof request.body === 'object' && request.body !== null ? (request.body as Record<string, any>) : {};
    const payload = warehouseIdParam && !rawBody.warehouseId ? { ...rawBody, warehouseId: warehouseIdParam } : rawBody;
    const body = createLocationSchema.parse(payload);
    const actorId = request.user?.id;
    const location = await WarehouseService.createLocation(body, actorId);
    return reply.status(201).send({ data: location, message: 'Warehouse location created successfully' });
  }

  static async updateLocation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const body = updateLocationSchema.parse(request.body);
    const actorId = request.user?.id;
    const location = await WarehouseService.updateLocation(id, body, actorId);
    return reply.status(200).send({ data: location, message: 'Warehouse location updated successfully' });
  }

  static async deleteLocation(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const actorId = request.user?.id;
    const location = await WarehouseService.deleteLocation(id, actorId);
    return reply.status(200).send({ data: location, message: 'Warehouse location deleted successfully' });
  }
}
