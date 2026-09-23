import { z } from 'zod';
export declare const goodsReceiptQuerySchema: z.ZodObject<{
    purchaseOrderId: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodOptional<z.ZodString>;
    receiptNumber: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    dateTo: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
export declare const receiveGoodsItemSchema: z.ZodPipe<z.ZodObject<{
    purchaseOrderItemId: z.ZodString;
    receivedQuantity: z.ZodNumber;
    acceptedQuantity: z.ZodOptional<z.ZodNumber>;
    rejectedQuantity: z.ZodOptional<z.ZodNumber>;
    rejectionReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    rejectionNotes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>, z.ZodTransform<{
    rejectionReason: string | null;
    purchaseOrderItemId: string;
    receivedQuantity: number;
    acceptedQuantity?: number | undefined;
    rejectedQuantity?: number | undefined;
    rejectionNotes?: string | null | undefined;
}, {
    purchaseOrderItemId: string;
    receivedQuantity: number;
    acceptedQuantity?: number | undefined;
    rejectedQuantity?: number | undefined;
    rejectionReason?: string | null | undefined;
    rejectionNotes?: string | null | undefined;
}>>;
export declare const receiveGoodsSchema: z.ZodPipe<z.ZodObject<{
    purchaseOrderId: z.ZodOptional<z.ZodString>;
    warehouseId: z.ZodOptional<z.ZodString>;
    locationId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    warehouseLocationId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    idempotencyKey: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    invoiceNumber: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    items: z.ZodArray<z.ZodPipe<z.ZodObject<{
        purchaseOrderItemId: z.ZodString;
        receivedQuantity: z.ZodNumber;
        acceptedQuantity: z.ZodOptional<z.ZodNumber>;
        rejectedQuantity: z.ZodOptional<z.ZodNumber>;
        rejectionReason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        rejectionNotes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>, z.ZodTransform<{
        rejectionReason: string | null;
        purchaseOrderItemId: string;
        receivedQuantity: number;
        acceptedQuantity?: number | undefined;
        rejectedQuantity?: number | undefined;
        rejectionNotes?: string | null | undefined;
    }, {
        purchaseOrderItemId: string;
        receivedQuantity: number;
        acceptedQuantity?: number | undefined;
        rejectedQuantity?: number | undefined;
        rejectionReason?: string | null | undefined;
        rejectionNotes?: string | null | undefined;
    }>>>;
}, z.core.$strip>, z.ZodTransform<{
    locationId: string | null;
    items: {
        rejectionReason: string | null;
        purchaseOrderItemId: string;
        receivedQuantity: number;
        acceptedQuantity?: number | undefined;
        rejectedQuantity?: number | undefined;
        rejectionNotes?: string | null | undefined;
    }[];
    purchaseOrderId?: string | undefined;
    warehouseId?: string | undefined;
    warehouseLocationId?: string | null | undefined;
    idempotencyKey?: string | null | undefined;
    invoiceNumber?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    items: {
        rejectionReason: string | null;
        purchaseOrderItemId: string;
        receivedQuantity: number;
        acceptedQuantity?: number | undefined;
        rejectedQuantity?: number | undefined;
        rejectionNotes?: string | null | undefined;
    }[];
    purchaseOrderId?: string | undefined;
    warehouseId?: string | undefined;
    locationId?: string | null | undefined;
    warehouseLocationId?: string | null | undefined;
    idempotencyKey?: string | null | undefined;
    invoiceNumber?: string | null | undefined;
    notes?: string | null | undefined;
}>>;
