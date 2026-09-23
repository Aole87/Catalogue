import { PriceTier, ProductReferenceType, Prisma } from '@car-parts/database';
export interface ProductQueryFilters {
    page?: number;
    pageSize?: number;
    categoryId?: string;
    categoryIds?: string[];
    brandId?: string;
    vehicleVariantId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'sku';
    sortOrder?: 'asc' | 'desc';
    isActive?: boolean;
    isPublished?: boolean;
    includeDeleted?: boolean;
}
export interface CreateProductPriceInput {
    tier: PriceTier;
    price: number | string | Prisma.Decimal;
    compareAtPrice?: number | string | Prisma.Decimal | null;
    costPrice?: number | string | Prisma.Decimal | null;
    currency?: string;
}
export interface CreateProductImageInput {
    url: string;
    altText?: string | null;
    sortOrder?: number;
    isPrimary?: boolean;
}
export interface CreateProductAttributeInput {
    attributeId: string;
    value: string;
}
export interface CreateProductCrossReferenceInput {
    referenceType: ProductReferenceType;
    referenceNumber: string;
    brandId?: string | null;
    notes?: string | null;
}
export interface CreateProductData {
    sku: string;
    slug: string;
    name: string;
    shortDescription?: string | null;
    description?: string | null;
    brandId: string;
    categoryId: string;
    barcode?: string | null;
    warrantyText?: string | null;
    weightGrams?: number | null;
    lengthMm?: number | null;
    widthMm?: number | null;
    heightMm?: number | null;
    isActive?: boolean;
    isPublished?: boolean;
    prices?: CreateProductPriceInput[];
    images?: CreateProductImageInput[];
    attributes?: CreateProductAttributeInput[];
    crossReferences?: CreateProductCrossReferenceInput[];
}
export interface UpdateProductData {
    sku?: string;
    slug?: string;
    name?: string;
    shortDescription?: string | null;
    description?: string | null;
    brandId?: string;
    categoryId?: string;
    barcode?: string | null;
    warrantyText?: string | null;
    weightGrams?: number | null;
    lengthMm?: number | null;
    widthMm?: number | null;
    heightMm?: number | null;
    isActive?: boolean;
    isPublished?: boolean;
    prices?: CreateProductPriceInput[];
    images?: CreateProductImageInput[];
    attributes?: CreateProductAttributeInput[];
    crossReferences?: CreateProductCrossReferenceInput[];
}
export declare const productDetailInclude: {
    brand: {
        select: {
            id: boolean;
            name: boolean;
            slug: boolean;
            logoUrl: boolean;
        };
    };
    category: {
        select: {
            id: boolean;
            name: boolean;
            slug: boolean;
            parentId: boolean;
        };
    };
    prices: {
        where: {
            isActive: boolean;
        };
        select: {
            id: boolean;
            tier: boolean;
            price: boolean;
            compareAtPrice: boolean;
            costPrice: boolean;
            currency: boolean;
            isActive: boolean;
        };
    };
    images: {
        orderBy: ({
            isPrimary: "desc";
            sortOrder?: undefined;
        } | {
            sortOrder: "asc";
            isPrimary?: undefined;
        })[];
        select: {
            id: boolean;
            url: boolean;
            altText: boolean;
            sortOrder: boolean;
            isPrimary: boolean;
        };
    };
    attributeValues: {
        select: {
            id: boolean;
            value: boolean;
            attribute: {
                select: {
                    id: boolean;
                    name: boolean;
                    code: boolean;
                    unit: boolean;
                };
            };
        };
    };
    crossReferences: {
        select: {
            id: boolean;
            referenceType: boolean;
            referenceNumber: boolean;
            notes: boolean;
            brand: {
                select: {
                    id: boolean;
                    name: boolean;
                    slug: boolean;
                };
            };
        };
    };
};
export declare class ProductRepository {
    private static buildWhereClause;
    static findById(id: string, includeRelations?: boolean): Promise<{
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
    } | null>;
    static findBySlug(slug: string, includeRelations?: boolean): Promise<{
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
    } | null>;
    static findBySku(sku: string): Promise<{
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
    } | null>;
    static findMany(filters: ProductQueryFilters): Promise<{
        items: ({
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
        } & {
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
        })[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    static count(filters: ProductQueryFilters): Promise<number>;
    static create(data: CreateProductData): Promise<({
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
    } & {
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
    }) | null>;
    static update(id: string, data: UpdateProductData): Promise<({
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
    } & {
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
    }) | null>;
    static softDelete(id: string): Promise<{
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
    static updatePrice(productId: string, tier: PriceTier, price: number | string | Prisma.Decimal, compareAtPrice?: number | string | Prisma.Decimal | null, costPrice?: number | string | Prisma.Decimal | null): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        productId: string;
        currency: string;
        tier: import(".prisma/client").$Enums.PriceTier;
        price: Prisma.Decimal;
        compareAtPrice: Prisma.Decimal | null;
        costPrice: Prisma.Decimal | null;
        validFrom: Date | null;
        validTo: Date | null;
    }>;
}
