import { VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine, VehicleVariant, FuelType } from '@car-parts/database';
export interface CreateVehicleMakeInput {
    name: string;
    slug: string;
    countryOfOrigin?: string | null;
    logoUrl?: string | null;
    isActive?: boolean;
}
export interface UpdateVehicleMakeInput {
    name?: string;
    slug?: string;
    countryOfOrigin?: string | null;
    logoUrl?: string | null;
    isActive?: boolean;
}
export interface CreateVehicleModelInput {
    makeId: string;
    name: string;
    slug: string;
    isActive?: boolean;
}
export interface UpdateVehicleModelInput {
    makeId?: string;
    name?: string;
    slug?: string;
    isActive?: boolean;
}
export interface CreateVehicleGenerationInput {
    modelId: string;
    name: string;
    code?: string | null;
    startYear: number;
    endYear?: number | null;
    isActive?: boolean;
}
export interface UpdateVehicleGenerationInput {
    modelId?: string;
    name?: string;
    code?: string | null;
    startYear?: number;
    endYear?: number | null;
    isActive?: boolean;
}
export interface CreateVehicleEngineInput {
    engineCode?: string | null;
    name: string;
    displacementCc?: number | null;
    cylinders?: number | null;
    fuelType?: FuelType;
    aspiration?: string | null;
}
export interface UpdateVehicleEngineInput {
    engineCode?: string | null;
    name?: string;
    displacementCc?: number | null;
    cylinders?: number | null;
    fuelType?: FuelType;
    aspiration?: string | null;
}
export interface CreateVehicleVariantInput {
    generationId: string;
    engineId?: string | null;
    name: string;
    transmission?: string | null;
    bodyType?: string | null;
    drivetrain?: string | null;
    startYear?: number | null;
    endYear?: number | null;
    isActive?: boolean;
}
export interface UpdateVehicleVariantInput {
    generationId?: string;
    engineId?: string | null;
    name?: string;
    transmission?: string | null;
    bodyType?: string | null;
    drivetrain?: string | null;
    startYear?: number | null;
    endYear?: number | null;
    isActive?: boolean;
}
export declare const variantHierarchyInclude: {
    generation: {
        include: {
            model: {
                include: {
                    make: boolean;
                };
            };
        };
    };
    engine: boolean;
};
export declare class VehicleRepository {
    static findAllMakes(onlyActive?: boolean): Promise<VehicleMake[]>;
    static findMakeById(id: string): Promise<VehicleMake | null>;
    static findMakeBySlug(slug: string): Promise<VehicleMake | null>;
    static findMakeByName(name: string): Promise<VehicleMake | null>;
    static createMake(data: CreateVehicleMakeInput): Promise<VehicleMake>;
    static updateMake(id: string, data: UpdateVehicleMakeInput): Promise<VehicleMake>;
    static deleteMake(id: string): Promise<VehicleMake>;
    static countModelsByMake(makeId: string): Promise<number>;
    static findModels(filters?: {
        makeId?: string;
        isActive?: boolean;
    }): Promise<VehicleModel[]>;
    static findModelById(id: string, includeMake?: boolean): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        makeId: string;
    } | null>;
    static findModelByMakeAndSlug(makeId: string, slug: string): Promise<VehicleModel | null>;
    static createModel(data: CreateVehicleModelInput): Promise<VehicleModel>;
    static updateModel(id: string, data: UpdateVehicleModelInput): Promise<VehicleModel>;
    static deleteModel(id: string): Promise<VehicleModel>;
    static countGenerationsByModel(modelId: string): Promise<number>;
    static findGenerations(filters?: {
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
    static findGenerationById(id: string, includeRelations?: boolean): Promise<{
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        modelId: string;
        code: string | null;
        startYear: number;
        endYear: number | null;
    } | null>;
    static findGenerationByModelAndName(modelId: string, name: string): Promise<VehicleGeneration | null>;
    static createGeneration(data: CreateVehicleGenerationInput): Promise<{
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
    static updateGeneration(id: string, data: UpdateVehicleGenerationInput): Promise<{
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
    static deleteGeneration(id: string): Promise<VehicleGeneration>;
    static countVariantsByGeneration(generationId: string): Promise<number>;
    static findAllEngines(): Promise<VehicleEngine[]>;
    static findEngineById(id: string): Promise<VehicleEngine | null>;
    static findEngineByCode(engineCode: string): Promise<VehicleEngine | null>;
    static createEngine(data: CreateVehicleEngineInput): Promise<VehicleEngine>;
    static updateEngine(id: string, data: UpdateVehicleEngineInput): Promise<VehicleEngine>;
    static deleteEngine(id: string): Promise<VehicleEngine>;
    static countVariantsByEngine(engineId: string): Promise<number>;
    static findVariants(filters?: {
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
    static findVariantById(id: string, includeHierarchy?: boolean): Promise<{
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
    } | null>;
    static findVariantByGenerationAndName(generationId: string, name: string): Promise<VehicleVariant | null>;
    static createVariant(data: CreateVehicleVariantInput): Promise<{
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
    static updateVariant(id: string, data: UpdateVehicleVariantInput): Promise<{
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
    static deleteVariant(id: string): Promise<VehicleVariant>;
    static countFitmentsByVariant(variantId: string): Promise<number>;
}
