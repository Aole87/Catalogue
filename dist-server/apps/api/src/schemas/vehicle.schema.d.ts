import { z } from 'zod';
export declare const createVehicleMakeSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodPreprocess<z.ZodString, unknown>;
    countryOfOrigin: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    logoUrl: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateVehicleMakeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodPreprocess<z.ZodString, unknown>>;
    countryOfOrigin: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    logoUrl: z.ZodPreprocess<z.ZodOptional<z.ZodNullable<z.ZodString>>, unknown>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createVehicleModelSchema: z.ZodObject<{
    makeId: z.ZodPreprocess<z.ZodString, unknown>;
    name: z.ZodString;
    slug: z.ZodPreprocess<z.ZodString, unknown>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateVehicleModelSchema: z.ZodObject<{
    makeId: z.ZodOptional<z.ZodPreprocess<z.ZodString, unknown>>;
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodPreprocess<z.ZodString, unknown>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createVehicleGenerationSchema: z.ZodObject<{
    modelId: z.ZodString;
    name: z.ZodString;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    startYear: z.ZodCoercedNumber<unknown>;
    endYear: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateVehicleGenerationSchema: z.ZodObject<{
    modelId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    startYear: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    endYear: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createVehicleEngineSchema: z.ZodObject<{
    engineCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodString;
    displacementCc: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    cylinders: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    fuelType: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        PETROL: "PETROL";
        DIESEL: "DIESEL";
        HYBRID: "HYBRID";
        PLUG_IN_HYBRID: "PLUG_IN_HYBRID";
        ELECTRIC: "ELECTRIC";
        LPG: "LPG";
        CNG: "CNG";
    }>>>;
    aspiration: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateVehicleEngineSchema: z.ZodObject<{
    engineCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    displacementCc: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    cylinders: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    fuelType: z.ZodOptional<z.ZodEnum<{
        PETROL: "PETROL";
        DIESEL: "DIESEL";
        HYBRID: "HYBRID";
        PLUG_IN_HYBRID: "PLUG_IN_HYBRID";
        ELECTRIC: "ELECTRIC";
        LPG: "LPG";
        CNG: "CNG";
    }>>;
    aspiration: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const createVehicleVariantSchema: z.ZodObject<{
    generationId: z.ZodString;
    engineId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodString;
    transmission: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bodyType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    drivetrain: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    startYear: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    endYear: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateVehicleVariantSchema: z.ZodObject<{
    generationId: z.ZodOptional<z.ZodString>;
    engineId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    transmission: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    bodyType: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    drivetrain: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    startYear: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    endYear: z.ZodOptional<z.ZodNullable<z.ZodCoercedNumber<unknown>>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const vehicleMakeQuerySchema: z.ZodObject<{
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const vehicleModelQuerySchema: z.ZodObject<{
    makeId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const vehicleGenerationQuerySchema: z.ZodObject<{
    modelId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const vehicleVariantQuerySchema: z.ZodObject<{
    generationId: z.ZodOptional<z.ZodString>;
    engineId: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodCoercedBoolean<unknown>>;
}, z.core.$strip>;
export declare const vehicleParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type CreateVehicleMakeInput = z.infer<typeof createVehicleMakeSchema>;
export type UpdateVehicleMakeInput = z.infer<typeof updateVehicleMakeSchema>;
export type CreateVehicleModelInput = z.infer<typeof createVehicleModelSchema>;
export type UpdateVehicleModelInput = z.infer<typeof updateVehicleModelSchema>;
export type CreateVehicleGenerationInput = z.infer<typeof createVehicleGenerationSchema>;
export type UpdateVehicleGenerationInput = z.infer<typeof updateVehicleGenerationSchema>;
export type CreateVehicleEngineInput = z.infer<typeof createVehicleEngineSchema>;
export type UpdateVehicleEngineInput = z.infer<typeof updateVehicleEngineSchema>;
export type CreateVehicleVariantInput = z.infer<typeof createVehicleVariantSchema>;
export type UpdateVehicleVariantInput = z.infer<typeof updateVehicleVariantSchema>;
