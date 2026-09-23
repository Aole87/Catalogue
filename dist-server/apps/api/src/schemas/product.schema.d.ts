import { z } from 'zod';
export declare const productPriceInputSchema: z.ZodObject<{
    tier: z.ZodEnum<{
        GENERAL: "GENERAL";
        GARAGE: "GARAGE";
        SHOP: "SHOP";
    }>;
    price: z.ZodCoercedNumber<unknown>;
    compareAtPrice: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    costPrice: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
}, z.core.$strip>;
export declare const productImageInputSchema: z.ZodObject<{
    url: z.ZodString;
    altText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    isPrimary: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const productAttributeInputSchema: z.ZodObject<{
    attributeId: z.ZodString;
    value: z.ZodString;
}, z.core.$strip>;
export declare const productCrossReferenceInputSchema: z.ZodObject<{
    referenceType: z.ZodDefault<z.ZodEnum<{
        OEM: "OEM";
        AFTERMARKET: "AFTERMARKET";
        SUPPLIER: "SUPPLIER";
        CROSS_REFERENCE: "CROSS_REFERENCE";
    }>>;
    referenceNumber: z.ZodString;
    brandId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createProductSchema: z.ZodObject<{
    sku: z.ZodString;
    slug: z.ZodString;
    name: z.ZodString;
    shortDescription: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    brandId: z.ZodString;
    categoryId: z.ZodString;
    barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    warrantyText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weightGrams: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lengthMm: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    widthMm: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    heightMm: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    isPublished: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tier: z.ZodEnum<{
            GENERAL: "GENERAL";
            GARAGE: "GARAGE";
            SHOP: "SHOP";
        }>;
        price: z.ZodCoercedNumber<unknown>;
        compareAtPrice: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        costPrice: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, z.core.$strip>>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        altText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        isPrimary: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$strip>>>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attributeId: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>>;
    crossReferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
        referenceType: z.ZodDefault<z.ZodEnum<{
            OEM: "OEM";
            AFTERMARKET: "AFTERMARKET";
            SUPPLIER: "SUPPLIER";
            CROSS_REFERENCE: "CROSS_REFERENCE";
        }>>;
        referenceNumber: z.ZodString;
        brandId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    sku: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    shortDescription: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    brandId: z.ZodOptional<z.ZodString>;
    categoryId: z.ZodOptional<z.ZodString>;
    barcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    warrantyText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    weightGrams: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    lengthMm: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    widthMm: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    heightMm: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    isPublished: z.ZodOptional<z.ZodBoolean>;
    prices: z.ZodOptional<z.ZodArray<z.ZodObject<{
        tier: z.ZodEnum<{
            GENERAL: "GENERAL";
            GARAGE: "GARAGE";
            SHOP: "SHOP";
        }>;
        price: z.ZodCoercedNumber<unknown>;
        compareAtPrice: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        costPrice: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, z.core.$strip>>>;
    images: z.ZodOptional<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        altText: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        sortOrder: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        isPrimary: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    }, z.core.$strip>>>;
    attributes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        attributeId: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>>;
    crossReferences: z.ZodOptional<z.ZodArray<z.ZodObject<{
        referenceType: z.ZodDefault<z.ZodEnum<{
            OEM: "OEM";
            AFTERMARKET: "AFTERMARKET";
            SUPPLIER: "SUPPLIER";
            CROSS_REFERENCE: "CROSS_REFERENCE";
        }>>;
        referenceNumber: z.ZodString;
        brandId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateProductPricesSchema: z.ZodObject<{
    prices: z.ZodArray<z.ZodObject<{
        tier: z.ZodEnum<{
            GENERAL: "GENERAL";
            GARAGE: "GARAGE";
            SHOP: "SHOP";
        }>;
        price: z.ZodCoercedNumber<unknown>;
        compareAtPrice: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        costPrice: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
        currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const productQuerySchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodDefault<z.ZodCoercedNumber<unknown>>>;
    pageSize: z.ZodOptional<z.ZodPipe<z.ZodDefault<z.ZodCoercedNumber<unknown>>, z.ZodTransform<number, number>>>;
    categoryId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    brandId: z.ZodOptional<z.ZodString>;
    brand: z.ZodOptional<z.ZodString>;
    vehicleVariantId: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    maxPrice: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    search: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
        updatedAt: "updatedAt";
        sku: "sku";
        price: "price";
    }>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
    isPublished: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateProductPricesInput = z.infer<typeof updateProductPricesSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
