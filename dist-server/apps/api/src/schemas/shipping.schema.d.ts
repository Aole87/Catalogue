import { z } from 'zod';
export declare const createShipmentSchema: z.ZodObject<{
    orderId: z.ZodString;
    shippingMethodId: z.ZodOptional<z.ZodString>;
    carrier: z.ZodOptional<z.ZodString>;
    serviceLevel: z.ZodOptional<z.ZodString>;
    recipientName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    addressLine1: z.ZodOptional<z.ZodString>;
    addressLine2: z.ZodOptional<z.ZodString>;
    subdistrict: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    province: z.ZodOptional<z.ZodString>;
    postalCode: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateShipmentStatusSchema: z.ZodObject<{
    toStatus: z.ZodEnum<{
        PENDING: "PENDING";
        READY_TO_FULFILL: "READY_TO_FULFILL";
        PICKED: "PICKED";
        PACKED: "PACKED";
        PACKING: "PACKING";
        READY_TO_SHIP: "READY_TO_SHIP";
        HANDED_OVER: "HANDED_OVER";
        SHIPPED: "SHIPPED";
        IN_TRANSIT: "IN_TRANSIT";
        OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY";
        DELIVERED: "DELIVERED";
        RETURNED: "RETURNED";
        FAILED: "FAILED";
        CANCELLED: "CANCELLED";
    }>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    occurredAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
}, z.core.$strip>;
export declare const assignTrackingSchema: z.ZodObject<{
    trackingNumber: z.ZodString;
    carrier: z.ZodOptional<z.ZodString>;
    serviceLevel: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const cancelShipmentSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export declare const adminShipmentQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        READY_TO_FULFILL: "READY_TO_FULFILL";
        PICKED: "PICKED";
        PACKED: "PACKED";
        PACKING: "PACKING";
        READY_TO_SHIP: "READY_TO_SHIP";
        HANDED_OVER: "HANDED_OVER";
        SHIPPED: "SHIPPED";
        IN_TRANSIT: "IN_TRANSIT";
        OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY";
        DELIVERED: "DELIVERED";
        RETURNED: "RETURNED";
        FAILED: "FAILED";
        CANCELLED: "CANCELLED";
    }>>;
    carrier: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type CreateShipmentSchema = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentStatusSchema = z.infer<typeof updateShipmentStatusSchema>;
export type AssignTrackingSchema = z.infer<typeof assignTrackingSchema>;
export type CancelShipmentSchema = z.infer<typeof cancelShipmentSchema>;
export type AdminShipmentQuerySchema = z.infer<typeof adminShipmentQuerySchema>;
