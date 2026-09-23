"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseController = void 0;
const warehouse_service_1 = require("../services/warehouse.service");
const inventory_schema_1 = require("../schemas/inventory.schema");
class WarehouseController {
    static async getWarehouses(request, reply) {
        const query = request.query;
        const includeInactive = query?.includeInactive === 'true';
        const warehouses = await warehouse_service_1.WarehouseService.getWarehouses(includeInactive);
        return reply.status(200).send({ data: warehouses });
    }
    static async getWarehouseById(request, reply) {
        const { id } = request.params;
        const warehouse = await warehouse_service_1.WarehouseService.getWarehouseById(id);
        return reply.status(200).send({ data: warehouse });
    }
    static async createWarehouse(request, reply) {
        const body = inventory_schema_1.createWarehouseSchema.parse(request.body);
        const actorId = request.user?.id;
        const warehouse = await warehouse_service_1.WarehouseService.createWarehouse(body, actorId);
        return reply.status(201).send({ data: warehouse, message: 'Warehouse created successfully' });
    }
    static async updateWarehouse(request, reply) {
        const { id } = request.params;
        const body = inventory_schema_1.updateWarehouseSchema.parse(request.body);
        const actorId = request.user?.id;
        const warehouse = await warehouse_service_1.WarehouseService.updateWarehouse(id, body, actorId);
        return reply.status(200).send({ data: warehouse, message: 'Warehouse updated successfully' });
    }
    static async deleteWarehouse(request, reply) {
        const { id } = request.params;
        const actorId = request.user?.id;
        const warehouse = await warehouse_service_1.WarehouseService.deleteWarehouse(id, actorId);
        return reply.status(200).send({ data: warehouse, message: 'Warehouse deleted successfully' });
    }
    // Location Handlers
    static async getLocations(request, reply) {
        const { id } = request.params;
        const query = request.query;
        const includeInactive = query?.includeInactive === 'true';
        const locations = await warehouse_service_1.WarehouseService.getLocations(id, includeInactive);
        return reply.status(200).send({ data: locations });
    }
    static async getLocationById(request, reply) {
        const { id } = request.params;
        const location = await warehouse_service_1.WarehouseService.getLocationById(id);
        return reply.status(200).send({ data: location });
    }
    static async createLocation(request, reply) {
        const { id: warehouseIdParam } = request.params || {};
        const rawBody = typeof request.body === 'object' && request.body !== null ? request.body : {};
        const payload = warehouseIdParam && !rawBody.warehouseId ? { ...rawBody, warehouseId: warehouseIdParam } : rawBody;
        const body = inventory_schema_1.createLocationSchema.parse(payload);
        const actorId = request.user?.id;
        const location = await warehouse_service_1.WarehouseService.createLocation(body, actorId);
        return reply.status(201).send({ data: location, message: 'Warehouse location created successfully' });
    }
    static async updateLocation(request, reply) {
        const { id } = request.params;
        const body = inventory_schema_1.updateLocationSchema.parse(request.body);
        const actorId = request.user?.id;
        const location = await warehouse_service_1.WarehouseService.updateLocation(id, body, actorId);
        return reply.status(200).send({ data: location, message: 'Warehouse location updated successfully' });
    }
    static async deleteLocation(request, reply) {
        const { id } = request.params;
        const actorId = request.user?.id;
        const location = await warehouse_service_1.WarehouseService.deleteLocation(id, actorId);
        return reply.status(200).send({ data: location, message: 'Warehouse location deleted successfully' });
    }
}
exports.WarehouseController = WarehouseController;
//# sourceMappingURL=warehouse.controller.js.map