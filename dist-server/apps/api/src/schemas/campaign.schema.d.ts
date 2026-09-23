import { z } from 'zod';
export declare const campaignQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        SCHEDULED: "SCHEDULED";
        ACTIVE: "ACTIVE";
        PAUSED: "PAUSED";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    segmentId: z.ZodOptional<z.ZodString>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
export declare const createCampaignSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodEnum<{
        DRAFT: "DRAFT";
        SCHEDULED: "SCHEDULED";
        ACTIVE: "ACTIVE";
        PAUSED: "PAUSED";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>;
    segmentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    startsAt: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<Date | null, string | null | undefined>>;
    endsAt: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<Date | null, string | null | undefined>>;
    budget: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    metadata: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const updateCampaignSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        DRAFT: "DRAFT";
        SCHEDULED: "SCHEDULED";
        ACTIVE: "ACTIVE";
        PAUSED: "PAUSED";
        COMPLETED: "COMPLETED";
        CANCELLED: "CANCELLED";
    }>>>;
    segmentId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    startsAt: z.ZodOptional<z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<Date | null, string | null | undefined>>>;
    endsAt: z.ZodOptional<z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<Date | null, string | null | undefined>>>;
    budget: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, z.core.$strip>;
export declare const recordCampaignEventSchema: z.ZodObject<{
    customerId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    eventType: z.ZodEnum<{
        CONVERT: "CONVERT";
        PURCHASE: "PURCHASE";
        ENGAGE: "ENGAGE";
        CLICK: "CLICK";
        VIEW: "VIEW";
        DISMISS: "DISMISS";
    }>;
    metadata: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
