import { z } from 'zod';
export declare const shippingAddressSchema: z.ZodObject<{
    recipientName: z.ZodString;
    phone: z.ZodString;
    addressLine: z.ZodString;
    subdistrict: z.ZodOptional<z.ZodString>;
    district: z.ZodOptional<z.ZodString>;
    province: z.ZodString;
    postalCode: z.ZodString;
}, z.core.$strip>;
export declare const checkoutSchema: z.ZodObject<{
    shippingAddress: z.ZodObject<{
        recipientName: z.ZodString;
        phone: z.ZodString;
        addressLine: z.ZodString;
        subdistrict: z.ZodOptional<z.ZodString>;
        district: z.ZodOptional<z.ZodString>;
        province: z.ZodString;
        postalCode: z.ZodString;
    }, z.core.$strip>;
    customerNotes: z.ZodOptional<z.ZodString>;
    paymentMethod: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        PROMPTPAY: "PROMPTPAY";
        BANK_TRANSFER: "BANK_TRANSFER";
        COD: "COD";
        CREDIT_CARD: "CREDIT_CARD";
    }>>>;
    couponCode: z.ZodOptional<z.ZodString>;
    loyaltyPointsToRedeem: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const cancelOrderSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
export declare const returnOrderSchema: z.ZodObject<{
    reason: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const returnActionSchema: z.ZodObject<{
    action: z.ZodEnum<{
        APPROVE: "APPROVE";
        REJECT: "REJECT";
    }>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodPipe<z.ZodObject<{
    toStatus: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING_PAYMENT: "PENDING_PAYMENT";
        PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED";
        PROCESSING: "PROCESSING";
        READY_FOR_SHIPMENT: "READY_FOR_SHIPMENT";
        SHIPPED: "SHIPPED";
        DELIVERED: "DELIVERED";
        RETURN_REQUESTED: "RETURN_REQUESTED";
        RETURNED: "RETURNED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING_PAYMENT: "PENDING_PAYMENT";
        PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED";
        PROCESSING: "PROCESSING";
        READY_FOR_SHIPMENT: "READY_FOR_SHIPMENT";
        SHIPPED: "SHIPPED";
        DELIVERED: "DELIVERED";
        RETURN_REQUESTED: "RETURN_REQUESTED";
        RETURNED: "RETURNED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
    }>>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodTransform<{
    toStatus: "DRAFT" | "PENDING_PAYMENT" | "PAYMENT_CONFIRMED" | "PROCESSING" | "READY_FOR_SHIPMENT" | "SHIPPED" | "DELIVERED" | "RETURN_REQUESTED" | "RETURNED" | "CANCELLED" | "REFUNDED";
    note: string | undefined;
}, {
    toStatus?: "DRAFT" | "PENDING_PAYMENT" | "PAYMENT_CONFIRMED" | "PROCESSING" | "READY_FOR_SHIPMENT" | "SHIPPED" | "DELIVERED" | "RETURN_REQUESTED" | "RETURNED" | "CANCELLED" | "REFUNDED" | undefined;
    status?: "DRAFT" | "PENDING_PAYMENT" | "PAYMENT_CONFIRMED" | "PROCESSING" | "READY_FOR_SHIPMENT" | "SHIPPED" | "DELIVERED" | "RETURN_REQUESTED" | "RETURNED" | "CANCELLED" | "REFUNDED" | undefined;
    note?: string | undefined;
}>>;
export declare const customerOrderQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING_PAYMENT: "PENDING_PAYMENT";
        PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED";
        PROCESSING: "PROCESSING";
        READY_FOR_SHIPMENT: "READY_FOR_SHIPMENT";
        SHIPPED: "SHIPPED";
        DELIVERED: "DELIVERED";
        RETURN_REQUESTED: "RETURN_REQUESTED";
        RETURNED: "RETURNED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
    }>>;
    q: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    dateTo: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodPipe<z.ZodDefault<z.ZodCoercedNumber<unknown>>, z.ZodTransform<number, number>>;
}, z.core.$strip>;
export declare const adminOrderQuerySchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        PENDING_PAYMENT: "PENDING_PAYMENT";
        PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED";
        PROCESSING: "PROCESSING";
        READY_FOR_SHIPMENT: "READY_FOR_SHIPMENT";
        SHIPPED: "SHIPPED";
        DELIVERED: "DELIVERED";
        RETURN_REQUESTED: "RETURN_REQUESTED";
        RETURNED: "RETURNED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
    }>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<{
        PENDING: "PENDING";
        AUTHORIZED: "AUTHORIZED";
        PAID: "PAID";
        FAILED: "FAILED";
        CANCELLED: "CANCELLED";
        REFUNDED: "REFUNDED";
        PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED";
    }>>;
    shipmentStatus: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    dateTo: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    sortBy: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        createdAt: "createdAt";
        status: "status";
        grandTotal: "grandTotal";
        orderNumber: "orderNumber";
        totalAmount: "totalAmount";
    }>>>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodPipe<z.ZodDefault<z.ZodCoercedNumber<unknown>>, z.ZodTransform<number, number>>;
}, z.core.$strip>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CancelOrderSchema = z.infer<typeof cancelOrderSchema>;
export type ReturnOrderSchema = z.infer<typeof returnOrderSchema>;
export type ReturnActionSchema = z.infer<typeof returnActionSchema>;
export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
export type CustomerOrderQuerySchema = z.infer<typeof customerOrderQuerySchema>;
export type AdminOrderQuerySchema = z.infer<typeof adminOrderQuerySchema>;
