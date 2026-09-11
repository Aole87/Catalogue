import {
  WarehouseRepository,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  CreateLocationInput,
  UpdateLocationInput,
} from '../repositories/warehouse.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { prisma } from '@car-parts/database';
import { BadRequestException, NotFoundException, ConflictException } from '../errors/app-error';

export class WarehouseService {
  static async getWarehouses(includeInactive = false) {
    return WarehouseRepository.findAll(includeInactive);
  }

  static async getWarehouseById(id: string) {
    const warehouse = await WarehouseRepository.findById(id);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  static async createWarehouse(input: CreateWarehouseInput, actorId?: string) {
    if (!input.code || !input.name) {
      throw new BadRequestException('Warehouse code and name are required');
    }

    const existing = await WarehouseRepository.findByCode(input.code);
    if (existing) {
      throw new ConflictException(`Warehouse with code '${input.code.toUpperCase().trim()}' already exists`);
    }

    const warehouse = await WarehouseRepository.create(input);

    if (actorId) {
      await AuditRepository.record({
        userId: actorId,
        action: 'WAREHOUSE_CREATED',
        resource: 'Warehouse',
        resourceId: warehouse.id,
        after: { code: warehouse.code, name: warehouse.name },
      });
    }

    return warehouse;
  }

  static async updateWarehouse(id: string, input: UpdateWarehouseInput, actorId?: string) {
    const existing = await WarehouseRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Warehouse not found');
    }

    const updated = await WarehouseRepository.update(id, input);

    if (actorId) {
      await AuditRepository.record({
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

  static async deleteWarehouse(id: string, actorId?: string) {
    const existing = await WarehouseRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Warehouse not found');
    }

    // Check if warehouse has active inventory
    const activeInventory = await prisma.inventoryItem.findFirst({
      where: {
        warehouseId: id,
        OR: [{ onHand: { gt: 0 } }, { reserved: { gt: 0 } }],
      },
    });

    if (activeInventory) {
      throw new BadRequestException(
        'Cannot delete warehouse: Warehouse still contains active on-hand or reserved inventory. Please transfer or adjust stock to 0 first.'
      );
    }

    const deleted = await WarehouseRepository.softDelete(id);

    if (actorId) {
      await AuditRepository.record({
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

  static async getLocations(warehouseId: string, includeInactive = false) {
    const warehouse = await WarehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return WarehouseRepository.findLocations(warehouseId, includeInactive);
  }

  static async getLocationById(locationId: string) {
    const location = await WarehouseRepository.findLocationById(locationId);
    if (!location) {
      throw new NotFoundException('Warehouse location not found');
    }
    return location;
  }

  static async createLocation(input: CreateLocationInput, actorId?: string) {
    const warehouse = await WarehouseRepository.findById(input.warehouseId);
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    if (!warehouse.isActive) {
      throw new BadRequestException('Cannot create location in an inactive warehouse');
    }

    const existing = await WarehouseRepository.findLocationByCode(input.warehouseId, input.code);
    if (existing) {
      throw new ConflictException(`Location code '${input.code.toUpperCase().trim()}' already exists in this warehouse`);
    }

    const location = await WarehouseRepository.createLocation(input);

    if (actorId) {
      await AuditRepository.record({
        userId: actorId,
        action: 'LOCATION_CREATED',
        resource: 'WarehouseLocation',
        resourceId: location.id,
        after: { code: location.code, warehouseId: location.warehouseId, name: location.name },
      });
    }

    return location;
  }

  static async updateLocation(id: string, input: UpdateLocationInput, actorId?: string) {
    const existing = await WarehouseRepository.findLocationById(id);
    if (!existing) {
      throw new NotFoundException('Warehouse location not found');
    }

    const updated = await WarehouseRepository.updateLocation(id, input);

    if (actorId) {
      await AuditRepository.record({
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

  static async deleteLocation(id: string, actorId?: string) {
    const existing = await WarehouseRepository.findLocationById(id);
    if (!existing) {
      throw new NotFoundException('Warehouse location not found');
    }

    // Check if location has inventory allocated
    const hasInventory = await prisma.inventoryItem.findFirst({
      where: {
        locationId: id,
        OR: [{ onHand: { gt: 0 } }, { reserved: { gt: 0 } }],
      },
    });

    if (hasInventory) {
      throw new BadRequestException('Cannot delete location: Location still contains allocated stock.');
    }

    const deleted = await WarehouseRepository.softDeleteLocation(id);

    if (actorId) {
      await AuditRepository.record({
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
