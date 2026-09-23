import { CreateProductInput, UpdateProductInput, UpdateProductPricesInput, ProductQueryParams } from '../schemas/product.schema';
import { PriceTier } from '@prisma/client';
export declare class ProductService {
    private static formatProductForResponse;
    static listStorefrontProducts(query: ProductQueryParams, userTier?: PriceTier): Promise<{
        items: any[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    static listAdminProducts(query: ProductQueryParams): Promise<{
        items: any[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    static getProductById(id: string, userTier?: PriceTier, isStorefront?: boolean): Promise<any>;
    static getProductBySlug(slug: string, userTier?: PriceTier, isStorefront?: boolean): Promise<any>;
    static createProduct(input: CreateProductInput, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<any>;
    static updateProduct(id: string, input: UpdateProductInput, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<any>;
    static deleteProduct(id: string, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<{
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
    }>;
    static updateProductPrices(id: string, input: UpdateProductPricesInput, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<any>;
}
