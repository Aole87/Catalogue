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
export declare class WarehouseRepository {
    static findAll(includeInactive?: boolean): Promise<({
        _count: {
            inventoryItems: number;
            locations: number;
        };
        locations: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        addressLine1: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        code: string;
    })[]>;
    static findById(id: string): Promise<({
        _count: {
            inventoryItems: number;
            locations: number;
        };
        locations: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        addressLine1: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        code: string;
    }) | null>;
    static findByCode(code: string): Promise<({
        locations: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        addressLine1: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        code: string;
    }) | null>;
    static create(data: CreateWarehouseInput): Promise<{
        locations: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        addressLine1: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        code: string;
    }>;
    static update(id: string, data: UpdateWarehouseInput): Promise<{
        locations: {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            warehouseId: string;
            code: string;
            zone: string | null;
            rack: string | null;
            shelf: string | null;
            bin: string | null;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        addressLine1: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        code: string;
    }>;
    static softDelete(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        addressLine1: string | null;
        district: string | null;
        province: string | null;
        postalCode: string | null;
        code: string;
    }>;
    static findLocations(warehouseId: string, includeInactive?: boolean): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        warehouseId: string;
        code: string;
        zone: string | null;
        rack: string | null;
        shelf: string | null;
        bin: string | null;
    }[]>;
    static findLocationById(id: string): Promise<({
        warehouse: {
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            addressLine1: string | null;
            district: string | null;
            province: string | null;
            postalCode: string | null;
            code: string;
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        warehouseId: string;
        code: string;
        zone: string | null;
        rack: string | null;
        shelf: string | null;
        bin: string | null;
    }) | null>;
    static findLocationByCode(warehouseId: string, code: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        warehouseId: string;
        code: string;
        zone: string | null;
        rack: string | null;
        shelf: string | null;
        bin: string | null;
    } | null>;
    static createLocation(data: CreateLocationInput): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        warehouseId: string;
        code: string;
        zone: string | null;
        rack: string | null;
        shelf: string | null;
        bin: string | null;
    }>;
    static updateLocation(id: string, data: UpdateLocationInput): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        warehouseId: string;
        code: string;
        zone: string | null;
        rack: string | null;
        shelf: string | null;
        bin: string | null;
    }>;
    static softDeleteLocation(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        warehouseId: string;
        code: string;
        zone: string | null;
        rack: string | null;
        shelf: string | null;
        bin: string | null;
    }>;
}
