import { ProductFitment, FitmentStatus, Prisma } from '@car-parts/database';
export interface CreateFitmentData {
    productId: string;
    vehicleVariantId: string;
    position?: string;
    notes?: string | null;
    fitmentStatus?: FitmentStatus;
}
export interface UpdateFitmentData {
    position?: string;
    notes?: string | null;
    fitmentStatus?: FitmentStatus;
}
export interface VariantProductsQueryOptions {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    brandId?: string;
    search?: string;
    sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'sku';
    sortOrder?: 'asc' | 'desc';
}
export declare const fitmentDetailInclude: {
    vehicleVariant: {
        include: {
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
    };
    product: {
        select: {
            id: boolean;
            name: boolean;
            sku: boolean;
            slug: boolean;
            isActive: boolean;
        };
    };
};
export declare class FitmentRepository {
    static findFitment(productId: string, vehicleVariantId: string, position?: string): Promise<({
        vehicleVariant: {
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
        };
        product: {
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            sku: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        productId: string;
        vehicleVariantId: string;
        position: string;
        fitmentStatus: import(".prisma/client").$Enums.FitmentStatus;
    }) | null>;
    static findFitmentById(id: string): Promise<({
        vehicleVariant: {
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
        };
        product: {
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            sku: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        productId: string;
        vehicleVariantId: string;
        position: string;
        fitmentStatus: import(".prisma/client").$Enums.FitmentStatus;
    }) | null>;
    static findFitmentsByProduct(productId: string): Promise<({
        vehicleVariant: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        productId: string;
        vehicleVariantId: string;
        position: string;
        fitmentStatus: import(".prisma/client").$Enums.FitmentStatus;
    })[]>;
    static findFitmentsByVariant(vehicleVariantId: string, options?: VariantProductsQueryOptions): Promise<{
        items: {
            fitmentPosition: string;
            fitmentNotes: string | null;
            category: {
                name: string;
                id: string;
                slug: string;
                parentId: string | null;
            };
            brand: {
                name: string;
                id: string;
                slug: string;
                logoUrl: string | null;
            };
            prices: {
                id: string;
                isActive: boolean;
                currency: string;
                tier: import(".prisma/client").$Enums.PriceTier;
                price: Prisma.Decimal;
                compareAtPrice: Prisma.Decimal | null;
                costPrice: Prisma.Decimal | null;
            }[];
            crossReferences: {
                id: string;
                notes: string | null;
                referenceType: import(".prisma/client").$Enums.ProductReferenceType;
                brand: {
                    name: string;
                    id: string;
                    slug: string;
                } | null;
                referenceNumber: string;
            }[];
            images: {
                url: string;
                id: string;
                sortOrder: number;
                altText: string | null;
                isPrimary: boolean;
            }[];
            attributeValues: {
                id: string;
                value: string;
                attribute: {
                    name: string;
                    id: string;
                    code: string;
                    unit: string | null;
                };
            }[];
            description: string | null;
            name: string;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            slug: string;
            sku: string;
            shortDescription: string | null;
            brandId: string;
            categoryId: string;
            barcode: string | null;
            warrantyText: string | null;
            weightGrams: number | null;
            lengthMm: number | null;
            widthMm: number | null;
            heightMm: number | null;
            isPublished: boolean;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    static countByVariant(vehicleVariantId: string): Promise<number>;
    static countByProduct(productId: string): Promise<number>;
    static createFitment(data: CreateFitmentData): Promise<ProductFitment>;
    static updateFitment(id: string, data: UpdateFitmentData): Promise<{
        vehicleVariant: {
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
        };
        product: {
            name: string;
            id: string;
            isActive: boolean;
            slug: string;
            sku: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        productId: string;
        vehicleVariantId: string;
        position: string;
        fitmentStatus: import(".prisma/client").$Enums.FitmentStatus;
    }>;
    static deleteFitment(id: string): Promise<ProductFitment>;
    static deleteByProductAndVariant(productId: string, vehicleVariantId: string, position?: string): Promise<Prisma.BatchPayload | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        productId: string;
        vehicleVariantId: string;
        position: string;
        fitmentStatus: import(".prisma/client").$Enums.FitmentStatus;
    }>;
}
