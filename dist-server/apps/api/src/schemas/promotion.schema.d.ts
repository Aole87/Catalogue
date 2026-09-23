import { z } from 'zod';
export declare const promotionQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        DRAFT: "DRAFT";
        ACTIVE: "ACTIVE";
        PAUSED: "PAUSED";
        EXPIRED: "EXPIRED";
        CANCELLED: "CANCELLED";
    }>>;
    promotionType: z.ZodOptional<z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED_AMOUNT: "FIXED_AMOUNT";
    }>>;
    activeOnly: z.ZodPipe<z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodString]>>, z.ZodTransform<boolean | undefined, string | boolean | undefined>>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
export declare const createPromotionSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    promotionType: z.ZodDefault<z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED_AMOUNT: "FIXED_AMOUNT";
    }>>;
    status: z.ZodDefault<z.ZodEnum<{
        DRAFT: "DRAFT";
        ACTIVE: "ACTIVE";
        PAUSED: "PAUSED";
        EXPIRED: "EXPIRED";
        CANCELLED: "CANCELLED";
    }>>;
    startsAt: z.ZodPipe<z.ZodPreprocess<z.ZodNullable<z.ZodOptional<z.ZodString>>, unknown>, z.ZodTransform<Date | null, string | null | undefined>>;
    endsAt: z.ZodPipe<z.ZodPreprocess<z.ZodNullable<z.ZodOptional<z.ZodString>>, unknown>, z.ZodTransform<Date | null, string | null | undefined>>;
    priority: z.ZodDefault<z.ZodNumber>;
    stackable: z.ZodDefault<z.ZodBoolean>;
    minimumOrderAmount: z.ZodDefault<z.ZodNumber>;
    discountValue: z.ZodNumber;
    maximumDiscountAmount: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    usageLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    perCustomerLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    productIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    categoryIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    brandIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        ruleType: z.ZodString;
        ruleValue: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updatePromotionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    promotionType: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED_AMOUNT: "FIXED_AMOUNT";
    }>>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        DRAFT: "DRAFT";
        ACTIVE: "ACTIVE";
        PAUSED: "PAUSED";
        EXPIRED: "EXPIRED";
        CANCELLED: "CANCELLED";
    }>>>;
    startsAt: z.ZodOptional<z.ZodPipe<z.ZodPreprocess<z.ZodNullable<z.ZodOptional<z.ZodString>>, unknown>, z.ZodTransform<Date | null, string | null | undefined>>>;
    endsAt: z.ZodOptional<z.ZodPipe<z.ZodPreprocess<z.ZodNullable<z.ZodOptional<z.ZodString>>, unknown>, z.ZodTransform<Date | null, string | null | undefined>>>;
    priority: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    stackable: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    minimumOrderAmount: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    maximumDiscountAmount: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    usageLimit: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    perCustomerLimit: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    productIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    categoryIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    brandIds: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        ruleType: z.ZodString;
        ruleValue: z.ZodOptional<z.ZodAny>;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
export declare const couponQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    promotionId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodPipe<z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodString]>>, z.ZodTransform<boolean | undefined, string | boolean | undefined>>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
}, z.core.$strip>;
export declare const createCouponSchema: z.ZodObject<{
    code: z.ZodString;
    promotionId: z.ZodString;
    usageLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    perCustomerLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    startsAt: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<Date | null, string | null | undefined>>;
    endsAt: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<Date | null, string | null | undefined>>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateCouponSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    usageLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    perCustomerLimit: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    startsAt: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<Date | null, string | null | undefined>>;
    endsAt: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<Date | null, string | null | undefined>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const validateCouponSchema: z.ZodObject<{
    code: z.ZodString;
    subtotal: z.ZodOptional<z.ZodNumber>;
    items: z.ZodOptional<z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        quantity: z.ZodNumber;
        lineTotal: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
