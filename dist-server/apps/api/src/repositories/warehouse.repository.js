"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseRepository = void 0;
const database_1 = require("@car-parts/database");
class WarehouseRepository {
    static async findAll(includeInactive = false) {
        return database_1.prisma.warehouse.findMany({
            where: {
                deletedAt: null,
                ...(includeInactive ? {} : { isActive: true }),
            },
            include: {
                locations: {
                    where: { deletedAt: null },
                    orderBy: { code: 'asc' },
                },
                _count: {
                    select: {
                        inventoryItems: true,
                        locations: true,
                    },
                },
            },
            orderBy: { code: 'asc' },
        });
    }
    static async findById(id) {
        return database_1.prisma.warehouse.findFirst({
            where: { id, deletedAt: null },
            include: {
                locations: {
                    where: { deletedAt: null },
                    orderBy: { code: 'asc' },
                },
                _count: {
                    select: {
                        inventoryItems: true,
                        locations: true,
                    },
                },
            },
        });
    }
    static async findByCode(code) {
        return database_1.prisma.warehouse.findFirst({
            where: { code: code.toUpperCase().trim(), deletedAt: null },
            include: {
                locations: {
                    where: { deletedAt: null },
                    orderBy: { code: 'asc' },
                },
            },
        });
    }
    static async create(data) {
        return database_1.prisma.warehouse.create({
            data: {
                code: data.code.toUpperCase().trim(),
                name: data.name.trim(),
                description: data.description?.trim(),
                addressLine1: data.addressLine1?.trim(),
                district: data.district?.trim(),
                province: data.province?.trim(),
                postalCode: data.postalCode?.trim(),
                isActive: data.isActive ?? true,
            },
            include: {
                locations: true,
            },
        });
    }
    static async update(id, data) {
        return database_1.prisma.warehouse.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name.trim() } : {}),
                ...(data.description !== undefined ? { description: data.description?.trim() } : {}),
                ...(data.addressLine1 !== undefined ? { addressLine1: data.addressLine1?.trim() } : {}),
                ...(data.district !== undefined ? { district: data.district?.trim() } : {}),
                ...(data.province !== undefined ? { province: data.province?.trim() } : {}),
                ...(data.postalCode !== undefined ? { postalCode: data.postalCode?.trim() } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
            include: {
                locations: true,
            },
        });
    }
    static async softDelete(id) {
        return database_1.prisma.warehouse.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }
    // Location Methods
    static async findLocations(warehouseId, includeInactive = false) {
        return database_1.prisma.warehouseLocation.findMany({
            where: {
                warehouseId,
                deletedAt: null,
                ...(includeInactive ? {} : { isActive: true }),
            },
            orderBy: { code: 'asc' },
        });
    }
    static async findLocationById(id) {
        return database_1.prisma.warehouseLocation.findFirst({
            where: { id, deletedAt: null },
            include: {
                warehouse: true,
            },
        });
    }
    static async findLocationByCode(warehouseId, code) {
        return database_1.prisma.warehouseLocation.findFirst({
            where: {
                warehouseId,
                code: code.toUpperCase().trim(),
                deletedAt: null,
            },
        });
    }
    static async createLocation(data) {
        return database_1.prisma.warehouseLocation.create({
            data: {
                warehouseId: data.warehouseId,
                code: data.code.toUpperCase().trim(),
                name: data.name.trim(),
                zone: data.zone?.trim(),
                rack: data.rack?.trim(),
                shelf: data.shelf?.trim(),
                bin: data.bin?.trim(),
                isActive: data.isActive ?? true,
            },
        });
    }
    static async updateLocation(id, data) {
        return database_1.prisma.warehouseLocation.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name.trim() } : {}),
                ...(data.zone !== undefined ? { zone: data.zone?.trim() } : {}),
                ...(data.rack !== undefined ? { rack: data.rack?.trim() } : {}),
                ...(data.shelf !== undefined ? { shelf: data.shelf?.trim() } : {}),
                ...(data.bin !== undefined ? { bin: data.bin?.trim() } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
        });
    }
    static async softDeleteLocation(id) {
        return database_1.prisma.warehouseLocation.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }
}
exports.WarehouseRepository = WarehouseRepository;
//# sourceMappingURL=warehouse.repository.js.map