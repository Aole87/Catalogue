import { z } from 'zod';
export declare const customerQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    customerType: z.ZodOptional<z.ZodEnum<{
        CUSTOMER: "CUSTOMER";
        GARAGE: "GARAGE";
        SHOP: "SHOP";
    }>>;
    segmentId: z.ZodOptional<z.ZodString>;
    tagId: z.ZodOptional<z.ZodString>;
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    sortBy: z.ZodOptional<z.ZodEnum<{
        createdAt: "createdAt";
        lifetimeValue: "lifetimeValue";
        orderCount: "orderCount";
        lastOrderDate: "lastOrderDate";
    }>>;
    sortOrder: z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>;
}, z.core.$strip>;
export declare const updateCustomerMeSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    displayName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    companyName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    taxId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateAdminCustomerSchema: z.ZodObject<{
    customerType: z.ZodOptional<z.ZodEnum<{
        CUSTOMER: "CUSTOMER";
        GARAGE: "GARAGE";
        SHOP: "SHOP";
    }>>;
    companyName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    taxId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createTagSchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const createSegmentSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    isAutomatic: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    rules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<{
            EQUALS: "EQUALS";
            NOT_EQUALS: "NOT_EQUALS";
            GREATER_THAN: "GREATER_THAN";
            GREATER_THAN_OR_EQUAL: "GREATER_THAN_OR_EQUAL";
            LESS_THAN: "LESS_THAN";
            LESS_THAN_OR_EQUAL: "LESS_THAN_OR_EQUAL";
            CONTAINS: "CONTAINS";
        }>;
        value: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const updateSegmentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    isAutomatic: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
    rules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        operator: z.ZodEnum<{
            EQUALS: "EQUALS";
            NOT_EQUALS: "NOT_EQUALS";
            GREATER_THAN: "GREATER_THAN";
            GREATER_THAN_OR_EQUAL: "GREATER_THAN_OR_EQUAL";
            LESS_THAN: "LESS_THAN";
            LESS_THAN_OR_EQUAL: "LESS_THAN_OR_EQUAL";
            CONTAINS: "CONTAINS";
        }>;
        value: z.ZodString;
    }, z.core.$strip>>>>;
}, z.core.$strip>;
