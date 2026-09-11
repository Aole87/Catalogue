import { prisma } from '@car-parts/database';

export interface CreateWarehouseInput {
  code: string;
  name: string;
  description?: string;
  addressLine1?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  isActive?: boolean;
}

export interface UpdateWarehouseInput {
  name?: string;
  description?: string;
  addressLine1?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  isActive?: boolean;
}

export interface CreateLocationInput {
  warehouseId: string;
  code: string;
  name: string;
  zone?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  isActive?: boolean;
}

export interface UpdateLocationInput {
  name?: string;
  zone?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  isActive?: boolean;
}

export class WarehouseRepository {
  static async findAll(includeInactive = false) {
    return prisma.warehouse.findMany({
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

  static async findById(id: string) {
    return prisma.warehouse.findFirst({
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

  static async findByCode(code: string) {
    return prisma.warehouse.findFirst({
      where: { code: code.toUpperCase().trim(), deletedAt: null },
      include: {
        locations: {
          where: { deletedAt: null },
          orderBy: { code: 'asc' },
        },
      },
    });
  }

  static async create(data: CreateWarehouseInput) {
    return prisma.warehouse.create({
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

  static async update(id: string, data: UpdateWarehouseInput) {
    return prisma.warehouse.update({
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

  static async softDelete(id: string) {
    return prisma.warehouse.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  // Location Methods
  static async findLocations(warehouseId: string, includeInactive = false) {
    return prisma.warehouseLocation.findMany({
      where: {
        warehouseId,
        deletedAt: null,
        ...(includeInactive ? {} : { isActive: true }),
      },
      orderBy: { code: 'asc' },
    });
  }

  static async findLocationById(id: string) {
    return prisma.warehouseLocation.findFirst({
      where: { id, deletedAt: null },
      include: {
        warehouse: true,
      },
    });
  }

  static async findLocationByCode(warehouseId: string, code: string) {
    return prisma.warehouseLocation.findFirst({
      where: {
        warehouseId,
        code: code.toUpperCase().trim(),
        deletedAt: null,
      },
    });
  }

  static async createLocation(data: CreateLocationInput) {
    return prisma.warehouseLocation.create({
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

  static async updateLocation(id: string, data: UpdateLocationInput) {
    return prisma.warehouseLocation.update({
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

  static async softDeleteLocation(id: string) {
    return prisma.warehouseLocation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
