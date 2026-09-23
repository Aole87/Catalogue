import { z } from 'zod';
export declare const purchaseOrderQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING_APPROVAL: "PENDING_APPROVAL";
        APPROVED: "APPROVED";
        REJECTED: "REJECTED";
        SENT: "SENT";
        PARTIALLY_RECEIVED: "PARTIALLY_RECEIVED";
        RECEIVED: "RECEIVED";
        CANCELLED: "CANCELLED";
        CLOSED: "CLOSED";
    }>>;
    supplierId: z.ZodOptional<z.ZodString>;
    destinationWarehouseId: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodOptional<z.ZodString>;
    poNumber: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    dateTo: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        status: "status";
        poNumber: "poNumber";
        grandTotal: "grandTotal";
        expectedDeliveryDate: "expectedDeliveryDate";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const createPurchaseOrderItemSchema: z.ZodPipe<z.ZodObject<{
    productId: z.ZodString;
    supplierProductId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    orderedQuantity: z.ZodOptional<z.ZodNumber>;
    quantity: z.ZodOptional<z.ZodNumber>;
    unitCost: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    discount: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    tax: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>, z.ZodTransform<{
    orderedQuantity: number;
    productId: string;
    supplierProductId?: string | null | undefined;
    quantity?: number | undefined;
    unitCost?: string | number | undefined;
    discount?: string | number | undefined;
    tax?: string | number | undefined;
    notes?: string | null | undefined;
}, {
    productId: string;
    supplierProductId?: string | null | undefined;
    orderedQuantity?: number | undefined;
    quantity?: number | undefined;
    unitCost?: string | number | undefined;
    discount?: string | number | undefined;
    tax?: string | number | undefined;
    notes?: string | null | undefined;
}>>;
export declare const createPurchaseOrderSchema: z.ZodPipe<z.ZodObject<{
    supplierId: z.ZodString;
    destinationWarehouseId: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    taxRate: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    shippingCost: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    otherCost: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    termsAndConditions: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    expectedDeliveryDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    items: z.ZodArray<z.ZodPipe<z.ZodObject<{
        productId: z.ZodString;
        supplierProductId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        orderedQuantity: z.ZodOptional<z.ZodNumber>;
        quantity: z.ZodOptional<z.ZodNumber>;
        unitCost: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
        discount: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
        tax: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>, z.ZodTransform<{
        orderedQuantity: number;
        productId: string;
        supplierProductId?: string | null | undefined;
        quantity?: number | undefined;
        unitCost?: string | number | undefined;
        discount?: string | number | undefined;
        tax?: string | number | undefined;
        notes?: string | null | undefined;
    }, {
        productId: string;
        supplierProductId?: string | null | undefined;
        orderedQuantity?: number | undefined;
        quantity?: number | undefined;
        unitCost?: string | number | undefined;
        discount?: string | number | undefined;
        tax?: string | number | undefined;
        notes?: string | null | undefined;
    }>>>;
}, z.core.$strip>, z.ZodTransform<{
    destinationWarehouseId: string;
    supplierId: string;
    currency: string;
    items: {
        orderedQuantity: number;
        productId: string;
        supplierProductId?: string | null | undefined;
        quantity?: number | undefined;
        unitCost?: string | number | undefined;
        discount?: string | number | undefined;
        tax?: string | number | undefined;
        notes?: string | null | undefined;
    }[];
    warehouseId?: string | undefined;
    taxRate?: string | number | undefined;
    shippingCost?: string | number | undefined;
    otherCost?: string | number | undefined;
    notes?: string | null | undefined;
    termsAndConditions?: string | null | undefined;
    expectedDeliveryDate?: string | null | undefined;
}, {
    supplierId: string;
    currency: string;
    items: {
        orderedQuantity: number;
        productId: string;
        supplierProductId?: string | null | undefined;
        quantity?: number | undefined;
        unitCost?: string | number | undefined;
        discount?: string | number | undefined;
        tax?: string | number | undefined;
        notes?: string | null | undefined;
    }[];
    destinationWarehouseId?: string | undefined;
    warehouseId?: string | undefined;
    taxRate?: string | number | undefined;
    shippingCost?: string | number | undefined;
    otherCost?: string | number | undefined;
    notes?: string | null | undefined;
    termsAndConditions?: string | null | undefined;
    expectedDeliveryDate?: string | null | undefined;
}>>;
export declare const updatePurchaseOrderSchema: z.ZodObject<{
    destinationWarehouseId: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodOptional<z.ZodString>;
    shippingCost: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    otherCost: z.ZodOptional<z.ZodUnion<readonly [z.ZodNumber, z.ZodString]>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    termsAndConditions: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    expectedDeliveryDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const approvePurchaseOrderSchema: z.ZodObject<{
    overrideReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const rejectPurchaseOrderSchema: z.ZodPipe<z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    rejectionReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodTransform<{
    reason: string;
}, {
    reason?: string | undefined;
    rejectionReason?: string | undefined;
}>>;
export declare const cancelPurchaseOrderSchema: z.ZodPipe<z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    cancellationReason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodTransform<{
    reason: string;
}, {
    reason?: string | undefined;
    cancellationReason?: string | undefined;
}>>;
