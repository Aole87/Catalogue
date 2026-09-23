import { z } from 'zod';
export declare const createPaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    provider: z.ZodDefault<z.ZodEnum<{
        PROMPTPAY: "PROMPTPAY";
        BANK_TRANSFER: "BANK_TRANSFER";
        COD: "COD";
        TEST: "TEST";
    }>>;
    method: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const submitSlipSchema: z.ZodObject<{
    slipUrl: z.ZodString;
    bankName: z.ZodOptional<z.ZodString>;
    transferAmount: z.ZodOptional<z.ZodString>;
    transferredAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodString]>>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const verifySlipSchema: z.ZodObject<{
    verifiedAmount: z.ZodOptional<z.ZodString>;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const rejectSlipSchema: z.ZodObject<{
    rejectionReason: z.ZodString;
}, z.core.$strip>;
export declare const refundPaymentSchema: z.ZodObject<{
    amount: z.ZodString;
    reason: z.ZodString;
}, z.core.$strip>;
export type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;
export type SubmitSlipSchema = z.infer<typeof submitSlipSchema>;
export type VerifySlipSchema = z.infer<typeof verifySlipSchema>;
export type RejectSlipSchema = z.infer<typeof rejectSlipSchema>;
export type RefundPaymentSchema = z.infer<typeof refundPaymentSchema>;
