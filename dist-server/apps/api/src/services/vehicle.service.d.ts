import { CreateVehicleMakeInput, UpdateVehicleMakeInput, CreateVehicleModelInput, UpdateVehicleModelInput, CreateVehicleGenerationInput, UpdateVehicleGenerationInput, CreateVehicleEngineInput, UpdateVehicleEngineInput, CreateVehicleVariantInput, UpdateVehicleVariantInput } from '../repositories/vehicle.repository';
export declare class VehicleService {
    static listMakes(onlyActive?: boolean): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        countryOfOrigin: string | null;
        logoUrl: string | null;
    }[]>;
    static getMakeById(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        countryOfOrigin: string | null;
        logoUrl: string | null;
    }>;
    static createMake(adminUserId: string, data: CreateVehicleMakeInput, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        countryOfOrigin: string | null;
        logoUrl: string | null;
    }>;
    static updateMake(adminUserId: string, id: string, data: UpdateVehicleMakeInput, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        countryOfOrigin: string | null;
        logoUrl: string | null;
    }>;
    static deleteMake(adminUserId: string, id: string, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        countryOfOrigin: string | null;
        logoUrl: string | null;
    }>;
    static listModels(filters?: {
        makeId?: string;
        isActive?: boolean;
    }): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        makeId: string;
    }[]>;
    static getModelById(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        makeId: string;
    }>;
    static createModel(adminUserId: string, data: CreateVehicleModelInput, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        makeId: string;
    }>;
    static updateModel(adminUserId: string, id: string, data: UpdateVehicleModelInput, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        makeId: string;
    }>;
    static deleteModel(adminUserId: string, id: string, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        makeId: string;
    }>;
    static listGenerations(filters?: {
        modelId?: string;
        isActive?: boolean;
    }): Promise<({
        model: {
            name: string;
            id: string;
            slug: string;
            make: {
                name: string;
                id: string;
                slug: string;
            };
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        modelId: string;
        code: string | null;
        startYear: number;
        endYear: number | null;
    })[]>;
    static getGenerationById(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        modelId: string;
        code: string | null;
        startYear: number;
        endYear: number | null;
    }>;
    static createGeneration(adminUserId: string, data: CreateVehicleGenerationInput, ipAddress?: string, userAgent?: string): Promise<{
        model: {
            name: string;
            id: string;
            slug: string;
            make: {
                name: string;
                id: string;
                slug: string;
            };
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        modelId: string;
        code: string | null;
        startYear: number;
        endYear: number | null;
    }>;
    static updateGeneration(adminUserId: string, id: string, data: UpdateVehicleGenerationInput, ipAddress?: string, userAgent?: string): Promise<{
        model: {
            name: string;
            id: string;
            slug: string;
            make: {
                name: string;
                id: string;
                slug: string;
            };
        };
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        modelId: string;
        code: string | null;
        startYear: number;
        endYear: number | null;
    }>;
    static deleteGeneration(adminUserId: string, id: string, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        modelId: string;
        code: string | null;
        startYear: number;
        endYear: number | null;
    }>;
    static listEngines(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        engineCode: string | null;
        displacementCc: number | null;
        cylinders: number | null;
        fuelType: import(".prisma/client").$Enums.FuelType;
        aspiration: string | null;
    }[]>;
    static getEngineById(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        engineCode: string | null;
        displacementCc: number | null;
        cylinders: number | null;
        fuelType: import(".prisma/client").$Enums.FuelType;
        aspiration: string | null;
    }>;
    static createEngine(adminUserId: string, data: CreateVehicleEngineInput, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        engineCode: string | null;
        displacementCc: number | null;
        cylinders: number | null;
        fuelType: import(".prisma/client").$Enums.FuelType;
        aspiration: string | null;
    }>;
    static updateEngine(adminUserId: string, id: string, data: UpdateVehicleEngineInput, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        engineCode: string | null;
        displacementCc: number | null;
        cylinders: number | null;
        fuelType: import(".prisma/client").$Enums.FuelType;
        aspiration: string | null;
    }>;
    static deleteEngine(adminUserId: string, id: string, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        engineCode: string | null;
        displacementCc: number | null;
        cylinders: number | null;
        fuelType: import(".prisma/client").$Enums.FuelType;
        aspiration: string | null;
    }>;
    static listVariants(filters?: {
        generationId?: string;
        engineId?: string;
        isActive?: boolean;
    }): Promise<({
        generation: {
            model: {
                make: {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    countryOfOrigin: string | null;
                    logoUrl: string | null;
                };
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                makeId: string;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            modelId: string;
            code: string | null;
            startYear: number;
            endYear: number | null;
        };
        engine: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            engineCode: string | null;
            displacementCc: number | null;
            cylinders: number | null;
            fuelType: import(".prisma/client").$Enums.FuelType;
            aspiration: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number | null;
        endYear: number | null;
        generationId: string;
        engineId: string | null;
        transmission: string | null;
        bodyType: string | null;
        drivetrain: string | null;
    })[]>;
    static getVariantById(id: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number | null;
        endYear: number | null;
        generationId: string;
        engineId: string | null;
        transmission: string | null;
        bodyType: string | null;
        drivetrain: string | null;
    }>;
    static createVariant(adminUserId: string, data: CreateVehicleVariantInput, ipAddress?: string, userAgent?: string): Promise<{
        generation: {
            model: {
                make: {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    countryOfOrigin: string | null;
                    logoUrl: string | null;
                };
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                makeId: string;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            modelId: string;
            code: string | null;
            startYear: number;
            endYear: number | null;
        };
        engine: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            engineCode: string | null;
            displacementCc: number | null;
            cylinders: number | null;
            fuelType: import(".prisma/client").$Enums.FuelType;
            aspiration: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number | null;
        endYear: number | null;
        generationId: string;
        engineId: string | null;
        transmission: string | null;
        bodyType: string | null;
        drivetrain: string | null;
    }>;
    static updateVariant(adminUserId: string, id: string, data: UpdateVehicleVariantInput, ipAddress?: string, userAgent?: string): Promise<{
        generation: {
            model: {
                make: {
                    name: string;
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    countryOfOrigin: string | null;
                    logoUrl: string | null;
                };
            } & {
                name: string;
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                makeId: string;
            };
        } & {
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            modelId: string;
            code: string | null;
            startYear: number;
            endYear: number | null;
        };
        engine: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            engineCode: string | null;
            displacementCc: number | null;
            cylinders: number | null;
            fuelType: import(".prisma/client").$Enums.FuelType;
            aspiration: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number | null;
        endYear: number | null;
        generationId: string;
        engineId: string | null;
        transmission: string | null;
        bodyType: string | null;
        drivetrain: string | null;
    }>;
    static deleteVariant(adminUserId: string, id: string, ipAddress?: string, userAgent?: string): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        startYear: number | null;
        endYear: number | null;
        generationId: string;
        engineId: string | null;
        transmission: string | null;
        bodyType: string | null;
        drivetrain: string | null;
    }>;
}
