import { CreateWarehouseInput, UpdateWarehouseInput, CreateLocationInput, UpdateLocationInput } from '../repositories/warehouse.repository';
export declare class WarehouseService {
    static getWarehouses(includeInactive?: boolean): Promise<({
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
    static getWarehouseById(id: string): Promise<{
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
    }>;
    static createWarehouse(input: CreateWarehouseInput, actorId?: string): Promise<{
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
    static updateWarehouse(id: string, input: UpdateWarehouseInput, actorId?: string): Promise<{
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
    static deleteWarehouse(id: string, actorId?: string): Promise<{
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
    static getLocations(warehouseId: string, includeInactive?: boolean): Promise<{
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
    static getLocationById(locationId: string): Promise<{
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
    }>;
    static createLocation(input: CreateLocationInput, actorId?: string): Promise<{
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
    static updateLocation(id: string, input: UpdateLocationInput, actorId?: string): Promise<{
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
    static deleteLocation(id: string, actorId?: string): Promise<{
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
