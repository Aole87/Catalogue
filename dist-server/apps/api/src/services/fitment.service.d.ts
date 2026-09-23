import { FitmentStatus, PriceTier } from '@car-parts/database';
import { CreateFitmentData, UpdateFitmentData, VariantProductsQueryOptions } from '../repositories/fitment.repository';
export type FitmentReasonCode = 'EXPLICIT_FITMENT' | 'NO_FITMENT_RECORD' | 'INSUFFICIENT_VEHICLE_SPECIFICATION' | 'INVALID_PRODUCT' | 'INVALID_VEHICLE';
export interface CompatibilityCheckResult {
    productId: string;
    vehicleVariantId: string | null;
    compatible: boolean;
    reason: FitmentReasonCode;
    fitment?: {
        id: string;
        position: string;
        notes?: string | null;
        status: FitmentStatus;
        vehicle?: {
            make: string;
            model: string;
            generation: string;
            variant: string;
            engine?: string | null;
            yearRange?: string | null;
        };
    } | null;
}
export declare class FitmentService {
    /**
     * Deterministic Fitment Engine — Single Source of Truth
     * Answers: "Can this part fit this vehicle?"
     * Strictly enforces that ONLY explicit PostgreSQL ProductFitment records produce compatible = true.
     * AI, semantic search, fuzzy matching, and product title guessing are strictly prohibited.
     */
    static checkProductFitment(productId: string, vehicleVariantId?: string | null, position?: string): Promise<CompatibilityCheckResult>;
    /**
     * Find all products compatible with a specific vehicle variant (Storefront API)
     */
    static getCompatibleProducts(vehicleVariantId: string, options: VariantProductsQueryOptions, userTier?: PriceTier): Promise<{
        vehicle: {
            id: string;
            make: any;
            model: any;
            generation: any;
            variant: string;
            engine: any;
        };
        items: any[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Get all vehicle fitment entries for a specific product
     */
    static getProductFitments(productId: string): Promise<{
        id: any;
        productId: any;
        position: any;
        notes: any;
        fitmentStatus: any;
        vehicleVariant: {
            id: any;
            name: any;
            transmission: any;
            bodyType: any;
            drivetrain: any;
            startYear: any;
            endYear: any;
            generation: {
                id: any;
                name: any;
                code: any;
                startYear: any;
                endYear: any;
                model: {
                    id: any;
                    name: any;
                    slug: any;
                    make: {
                        id: any;
                        name: any;
                        slug: any;
                    } | null;
                } | null;
            } | null;
            engine: {
                id: any;
                name: any;
                engineCode: any;
                fuelType: any;
                displacementCc: any;
            } | null;
        } | null;
    }[]>;
    static createFitment(adminUserId: string, data: CreateFitmentData, ipAddress?: string, userAgent?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        productId: string;
        vehicleVariantId: string;
        position: string;
        fitmentStatus: import(".prisma/client").$Enums.FitmentStatus;
    }>;
    static updateFitment(adminUserId: string, fitmentId: string, data: UpdateFitmentData, ipAddress?: string, userAgent?: string): Promise<{
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
    static deleteFitment(adminUserId: string, fitmentId: string, ipAddress?: string, userAgent?: string): Promise<{
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
