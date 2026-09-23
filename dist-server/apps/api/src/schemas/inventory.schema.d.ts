import { z } from 'zod';
export declare const createWarehouseSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateWarehouseSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createLocationSchema: z.ZodObject<{
    warehouseId: z.ZodString;
    code: z.ZodString;
    name: z.ZodString;
    zone: z.ZodOptional<z.ZodString>;
    rack: z.ZodOptional<z.ZodString>;
    shelf: z.ZodOptional<z.ZodString>;
    bin: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateLocationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    zone: z.ZodOptional<z.ZodString>;
    rack: z.ZodOptional<z.ZodString>;
    shelf: z.ZodOptional<z.ZodString>;
    bin: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const inventoryQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    productId: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodOptional<z.ZodString>;
    locationId: z.ZodOptional<z.ZodString>;
    lowStock: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean | undefined, string | undefined>>;
    stockStatus: z.ZodOptional<z.ZodEnum<{
        IN_STOCK: "IN_STOCK";
        LOW_STOCK: "LOW_STOCK";
        OUT_OF_STOCK: "OUT_OF_STOCK";
    }>>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        updatedAt: "updatedAt";
        sku: "sku";
        onHand: "onHand";
        reserved: "reserved";
        productName: "productName";
        available: "available";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const reserveStockSchema: z.ZodObject<{
    orderId: z.ZodOptional<z.ZodString>;
    productId: z.ZodString;
    warehouseId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    referenceType: z.ZodOptional<z.ZodString>;
    referenceId: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
}, z.core.$strip>;
export declare const adjustStockSchema: z.ZodObject<{
    warehouseId: z.ZodString;
    productId: z.ZodString;
    locationId: z.ZodOptional<z.ZodString>;
    direction: z.ZodEnum<{
        INCREASE: "INCREASE";
        DECREASE: "DECREASE";
        SET: "SET";
    }>;
    quantity: z.ZodNumber;
    reason: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const transferStockSchema: z.ZodObject<{
    sourceWarehouseId: z.ZodString;
    targetWarehouseId: z.ZodString;
    sourceLocationId: z.ZodOptional<z.ZodString>;
    targetLocationId: z.ZodOptional<z.ZodString>;
    productId: z.ZodString;
    quantity: z.ZodNumber;
    reason: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const returnDispositionSchema: z.ZodObject<{
    orderId: z.ZodOptional<z.ZodString>;
    productId: z.ZodString;
    warehouseId: z.ZodString;
    locationId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
    disposition: z.ZodEnum<{
        RESTOCK: "RESTOCK";
        DAMAGED: "DAMAGED";
        QUARANTINE: "QUARANTINE";
        SCRAP: "SCRAP";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const movementQuerySchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodOptional<z.ZodString>;
    movementType: z.ZodOptional<z.ZodEnum<{
        PURCHASE_RECEIPT: "PURCHASE_RECEIPT";
        SALE: "SALE";
        RESERVATION: "RESERVATION";
        RELEASE: "RELEASE";
        ADJUSTMENT: "ADJUSTMENT";
        ADJUSTMENT_IN: "ADJUSTMENT_IN";
        ADJUSTMENT_OUT: "ADJUSTMENT_OUT";
        TRANSFER_IN: "TRANSFER_IN";
        TRANSFER_OUT: "TRANSFER_OUT";
        RETURN: "RETURN";
        DAMAGE: "DAMAGE";
        DEDUCTION: "DEDUCTION";
        LOSS: "LOSS";
        CORRECTION: "CORRECTION";
    }>>;
    referenceType: z.ZodOptional<z.ZodString>;
    referenceId: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    dateTo: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
