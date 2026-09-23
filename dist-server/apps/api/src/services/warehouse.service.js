"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseService = void 0;
const warehouse_repository_1 = require("../repositories/warehouse.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const database_1 = require("@car-parts/database");
const app_error_1 = require("../errors/app-error");
class WarehouseService {
    static async getWarehouses(includeInactive = false) {
        return warehouse_repository_1.WarehouseRepository.findAll(includeInactive);
    }
    static async getWarehouseById(id) {
        const warehouse = await warehouse_repository_1.WarehouseRepository.findById(id);
        if (!warehouse) {
            throw new app_error_1.NotFoundException('Warehouse not found');
        }
        return warehouse;
    }
    static async createWarehouse(input, actorId) {
        if (!input.code || !input.name) {
            throw new app_error_1.BadRequestException('Warehouse code and name are required');
        }
        const existing = await warehouse_repository_1.WarehouseRepository.findByCode(input.code);
        if (existing) {
            throw new app_error_1.ConflictException(`Warehouse with code '${input.code.toUpperCase().trim()}' already exists`);
        }
        const warehouse = await warehouse_repository_1.WarehouseRepository.create(input);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'WAREHOUSE_CREATED',
                resource: 'Warehouse',
                resourceId: warehouse.id,
                after: { code: warehouse.code, name: warehouse.name },
            });
        }
        return warehouse;
    }
    static async updateWarehouse(id, input, actorId) {
        const existing = await warehouse_repository_1.WarehouseRepository.findById(id);
        if (!existing) {
            throw new app_error_1.NotFoundException('Warehouse not found');
        }
        const updated = await warehouse_repository_1.WarehouseRepository.update(id, input);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'WAREHOUSE_UPDATED',
                resource: 'Warehouse',
                resourceId: updated.id,
                before: { name: existing.name, isActive: existing.isActive },
                after: { name: updated.name, isActive: updated.isActive },
            });
        }
        return updated;
    }
    static async deleteWarehouse(id, actorId) {
        const existing = await warehouse_repository_1.WarehouseRepository.findById(id);
        if (!existing) {
            throw new app_error_1.NotFoundException('Warehouse not found');
        }
        // Check if warehouse has active inventory
        const activeInventory = await database_1.prisma.inventoryItem.findFirst({
            where: {
                warehouseId: id,
                OR: [{ onHand: { gt: 0 } }, { reserved: { gt: 0 } }],
            },
        });
        if (activeInventory) {
            throw new app_error_1.BadRequestException('Cannot delete warehouse: Warehouse still contains active on-hand or reserved inventory. Please transfer or adjust stock to 0 first.');
        }
        const deleted = await warehouse_repository_1.WarehouseRepository.softDelete(id);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'WAREHOUSE_DELETED',
                resource: 'Warehouse',
                resourceId: id,
                before: { code: existing.code, name: existing.name },
                after: { deletedAt: deleted.deletedAt, isActive: false },
            });
        }
        return deleted;
    }
    // --------------------------------------------------------------------------
    // LOCATION MANAGEMENT
    // --------------------------------------------------------------------------
    static async getLocations(warehouseId, includeInactive = false) {
        const warehouse = await warehouse_repository_1.WarehouseRepository.findById(warehouseId);
        if (!warehouse) {
            throw new app_error_1.NotFoundException('Warehouse not found');
        }
        return warehouse_repository_1.WarehouseRepository.findLocations(warehouseId, includeInactive);
    }
    static async getLocationById(locationId) {
        const location = await warehouse_repository_1.WarehouseRepository.findLocationById(locationId);
        if (!location) {
            throw new app_error_1.NotFoundException('Warehouse location not found');
        }
        return location;
    }
    static async createLocation(input, actorId) {
        const warehouse = await warehouse_repository_1.WarehouseRepository.findById(input.warehouseId);
        if (!warehouse) {
            throw new app_error_1.NotFoundException('Warehouse not found');
        }
        if (!warehouse.isActive) {
            throw new app_error_1.BadRequestException('Cannot create location in an inactive warehouse');
        }
        const existing = await warehouse_repository_1.WarehouseRepository.findLocationByCode(input.warehouseId, input.code);
        if (existing) {
            throw new app_error_1.ConflictException(`Location code '${input.code.toUpperCase().trim()}' already exists in this warehouse`);
        }
        const location = await warehouse_repository_1.WarehouseRepository.createLocation(input);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'LOCATION_CREATED',
                resource: 'WarehouseLocation',
                resourceId: location.id,
                after: { code: location.code, warehouseId: location.warehouseId, name: location.name },
            });
        }
        return location;
    }
    static async updateLocation(id, input, actorId) {
        const existing = await warehouse_repository_1.WarehouseRepository.findLocationById(id);
        if (!existing) {
            throw new app_error_1.NotFoundException('Warehouse location not found');
        }
        const updated = await warehouse_repository_1.WarehouseRepository.updateLocation(id, input);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'LOCATION_UPDATED',
                resource: 'WarehouseLocation',
                resourceId: id,
                before: { name: existing.name, isActive: existing.isActive },
                after: { name: updated.name, isActive: updated.isActive },
            });
        }
        return updated;
    }
    static async deleteLocation(id, actorId) {
        const existing = await warehouse_repository_1.WarehouseRepository.findLocationById(id);
        if (!existing) {
            throw new app_error_1.NotFoundException('Warehouse location not found');
        }
        // Check if location has inventory allocated
        const hasInventory = await database_1.prisma.inventoryItem.findFirst({
            where: {
                locationId: id,
                OR: [{ onHand: { gt: 0 } }, { reserved: { gt: 0 } }],
            },
        });
        if (hasInventory) {
            throw new app_error_1.BadRequestException('Cannot delete location: Location still contains allocated stock.');
        }
        const deleted = await warehouse_repository_1.WarehouseRepository.softDeleteLocation(id);
        if (actorId) {
            await audit_repository_1.AuditRepository.record({
                userId: actorId,
                action: 'LOCATION_DELETED',
                resource: 'WarehouseLocation',
                resourceId: id,
                before: { code: existing.code, warehouseId: existing.warehouseId },
                after: { deletedAt: deleted.deletedAt, isActive: false },
            });
        }
        return deleted;
    }
}
exports.WarehouseService = WarehouseService;
//# sourceMappingURL=warehouse.service.js.map