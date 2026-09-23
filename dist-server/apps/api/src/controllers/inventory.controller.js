"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
const inventory_schema_1 = require("../schemas/inventory.schema");
class InventoryController {
    static async getInventory(request, reply) {
        const query = inventory_schema_1.inventoryQuerySchema.parse(request.query);
        const result = await inventory_service_1.InventoryService.getInventory(query);
        return reply.status(200).send({ data: result.items, pagination: result.pagination });
    }
    static async getInventoryById(request, reply) {
        const { id } = request.params;
        const item = await inventory_service_1.InventoryService.getInventoryById(id);
        return reply.status(200).send({ data: item });
    }
    static async getProductAvailability(request, reply) {
        const { productId } = request.params;
        const query = request.query;
        const result = await inventory_service_1.InventoryService.getProductAvailability(productId, query?.warehouseId);
        return reply.status(200).send({ data: result });
    }
    static async getDashboardMetrics(request, reply) {
        const metrics = await inventory_service_1.InventoryService.getDashboardMetrics();
        return reply.status(200).send({ data: metrics });
    }
    static async reserveStock(request, reply) {
        const body = inventory_schema_1.reserveStockSchema.parse(request.body);
        const actorId = request.user?.id;
        const reservation = await inventory_service_1.InventoryService.reserveStock(body, actorId);
        return reply.status(201).send({ data: reservation, message: 'Stock reserved successfully' });
    }
    static async releaseReservation(request, reply) {
        const { id } = request.params;
        const body = request.body || {};
        const actorId = request.user?.id;
        const reservation = await inventory_service_1.InventoryService.releaseReservation(id, actorId, body.reason, request.user);
        return reply.status(200).send({ data: reservation, message: 'Stock reservation released successfully' });
    }
    static async commitReservation(request, reply) {
        const { id } = request.params;
        const body = request.body || {};
        const actorId = request.user?.id;
        const reservation = await inventory_service_1.InventoryService.commitReservation(id, actorId, body.notes, body.orderId, request.user);
        return reply.status(200).send({ data: reservation, message: 'Stock reservation committed successfully' });
    }
    static async adjustStock(request, reply) {
        const body = inventory_schema_1.adjustStockSchema.parse(request.body);
        const actorId = request.user.id;
        const result = await inventory_service_1.InventoryService.adjustStock(body, actorId);
        return reply.status(200).send({ data: result, message: 'Stock adjusted successfully' });
    }
    static async transferStock(request, reply) {
        const body = inventory_schema_1.transferStockSchema.parse(request.body);
        const actorId = request.user.id;
        const result = await inventory_service_1.InventoryService.transferStock(body, actorId);
        return reply.status(200).send({ data: result, message: 'Stock transferred successfully' });
    }
    static async handleReturnDisposition(request, reply) {
        const body = inventory_schema_1.returnDispositionSchema.parse(request.body);
        const actorId = request.user.id;
        const result = await inventory_service_1.InventoryService.handleReturnDisposition(body, actorId);
        return reply.status(200).send({ data: result, message: `Return disposition ${body.disposition} processed` });
    }
    static async getMovements(request, reply) {
        const query = inventory_schema_1.movementQuerySchema.parse(request.query);
        const result = await inventory_service_1.InventoryService.getMovements(query);
        return reply.status(200).send({ data: result.movements, pagination: result.pagination });
    }
}
exports.InventoryController = InventoryController;
//# sourceMappingURL=inventory.controller.js.map