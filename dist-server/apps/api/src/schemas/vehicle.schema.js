"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vehicleParamSchema = exports.vehicleVariantQuerySchema = exports.vehicleGenerationQuerySchema = exports.vehicleModelQuerySchema = exports.vehicleMakeQuerySchema = exports.updateVehicleVariantSchema = exports.createVehicleVariantSchema = exports.updateVehicleEngineSchema = exports.createVehicleEngineSchema = exports.updateVehicleGenerationSchema = exports.createVehicleGenerationSchema = exports.updateVehicleModelSchema = exports.createVehicleModelSchema = exports.updateVehicleMakeSchema = exports.createVehicleMakeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const sanitizeUrlOrNull = zod_1.z.preprocess((val) => (typeof val === 'string' && val.trim() === '' ? null : val), zod_1.z.string().max(2000).nullable().optional());
const sanitizeTextOrNull = zod_1.z.preprocess((val) => (typeof val === 'string' && val.trim() === '' ? null : val), zod_1.z.string().max(100).nullable().optional());
const sanitizeSlug = zod_1.z.preprocess((val) => {
    if (typeof val === 'string') {
        let s = val.trim().toLowerCase().replace(/\s+/g, '-');
        s = s.replace(/[^a-z0-9\u0E00-\u0E7F\-_]/g, '');
        s = s.replace(/-+/g, '-').replace(/^-|-$/g, '');
        return s || `veh-${Date.now()}`;
    }
    return val;
}, zod_1.z.string().min(1, 'Slug is required').max(150));
const sanitizeId = zod_1.z.preprocess((val) => (typeof val === 'string' ? val.trim() : val), zod_1.z.string().min(1, 'ID is required'));
// ==========================================
// MAKES
// ==========================================
exports.createVehicleMakeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Make name is required').max(100),
    slug: sanitizeSlug,
    countryOfOrigin: sanitizeTextOrNull,
    logoUrl: sanitizeUrlOrNull,
    isActive: zod_1.z.boolean().default(true).optional(),
});
exports.updateVehicleMakeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    slug: sanitizeSlug.optional(),
    countryOfOrigin: sanitizeTextOrNull,
    logoUrl: sanitizeUrlOrNull,
    isActive: zod_1.z.boolean().optional(),
});
// ==========================================
// MODELS
// ==========================================
exports.createVehicleModelSchema = zod_1.z.object({
    makeId: sanitizeId,
    name: zod_1.z.string().min(1, 'Model name is required').max(100),
    slug: sanitizeSlug,
    isActive: zod_1.z.boolean().default(true).optional(),
});
exports.updateVehicleModelSchema = zod_1.z.object({
    makeId: sanitizeId.optional(),
    name: zod_1.z.string().min(1).max(100).optional(),
    slug: sanitizeSlug.optional(),
    isActive: zod_1.z.boolean().optional(),
});
// ==========================================
// GENERATIONS
// ==========================================
exports.createVehicleGenerationSchema = zod_1.z.object({
    modelId: zod_1.z.string().uuid('Model ID must be a valid UUID'),
    name: zod_1.z.string().min(1, 'Generation name is required').max(100),
    code: zod_1.z.string().max(50).nullable().optional(),
    startYear: zod_1.z.coerce.number().int().min(1900, 'Start year must be >= 1900').max(2100, 'Start year must be <= 2100'),
    endYear: zod_1.z.coerce.number().int().min(1900).max(2100).nullable().optional(),
    isActive: zod_1.z.boolean().default(true).optional(),
}).refine((data) => data.endYear == null || data.endYear >= data.startYear, {
    message: 'End year cannot be before start year',
    path: ['endYear'],
});
exports.updateVehicleGenerationSchema = zod_1.z.object({
    modelId: zod_1.z.string().uuid('Model ID must be a valid UUID').optional(),
    name: zod_1.z.string().min(1).max(100).optional(),
    code: zod_1.z.string().max(50).nullable().optional(),
    startYear: zod_1.z.coerce.number().int().min(1900).max(2100).optional(),
    endYear: zod_1.z.coerce.number().int().min(1900).max(2100).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
}).refine((data) => {
    if (data.startYear != null && data.endYear != null) {
        return data.endYear >= data.startYear;
    }
    return true;
}, {
    message: 'End year cannot be before start year',
    path: ['endYear'],
});
// ==========================================
// ENGINES
// ==========================================
exports.createVehicleEngineSchema = zod_1.z.object({
    engineCode: zod_1.z.string().max(50).nullable().optional(),
    name: zod_1.z.string().min(1, 'Engine name is required').max(100),
    displacementCc: zod_1.z.coerce.number().int().min(0).nullable().optional(),
    cylinders: zod_1.z.coerce.number().int().min(1).max(16).nullable().optional(),
    fuelType: zod_1.z.nativeEnum(client_1.FuelType).default(client_1.FuelType.PETROL).optional(),
    aspiration: zod_1.z.string().max(50).nullable().optional(),
});
exports.updateVehicleEngineSchema = zod_1.z.object({
    engineCode: zod_1.z.string().max(50).nullable().optional(),
    name: zod_1.z.string().min(1).max(100).optional(),
    displacementCc: zod_1.z.coerce.number().int().min(0).nullable().optional(),
    cylinders: zod_1.z.coerce.number().int().min(1).max(16).nullable().optional(),
    fuelType: zod_1.z.nativeEnum(client_1.FuelType).optional(),
    aspiration: zod_1.z.string().max(50).nullable().optional(),
});
// ==========================================
// VARIANTS
// ==========================================
exports.createVehicleVariantSchema = zod_1.z.object({
    generationId: zod_1.z.string().uuid('Generation ID must be a valid UUID'),
    engineId: zod_1.z.string().uuid('Engine ID must be a valid UUID').nullable().optional(),
    name: zod_1.z.string().min(1, 'Variant name is required').max(150),
    transmission: zod_1.z.string().max(50).nullable().optional(),
    bodyType: zod_1.z.string().max(50).nullable().optional(),
    drivetrain: zod_1.z.string().max(50).nullable().optional(),
    startYear: zod_1.z.coerce.number().int().min(1900).max(2100).nullable().optional(),
    endYear: zod_1.z.coerce.number().int().min(1900).max(2100).nullable().optional(),
    isActive: zod_1.z.boolean().default(true).optional(),
}).refine((data) => {
    if (data.startYear != null && data.endYear != null) {
        return data.endYear >= data.startYear;
    }
    return true;
}, {
    message: 'End year cannot be before start year',
    path: ['endYear'],
});
exports.updateVehicleVariantSchema = zod_1.z.object({
    generationId: zod_1.z.string().uuid('Generation ID must be a valid UUID').optional(),
    engineId: zod_1.z.string().uuid('Engine ID must be a valid UUID').nullable().optional(),
    name: zod_1.z.string().min(1).max(150).optional(),
    transmission: zod_1.z.string().max(50).nullable().optional(),
    bodyType: zod_1.z.string().max(50).nullable().optional(),
    drivetrain: zod_1.z.string().max(50).nullable().optional(),
    startYear: zod_1.z.coerce.number().int().min(1900).max(2100).nullable().optional(),
    endYear: zod_1.z.coerce.number().int().min(1900).max(2100).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
}).refine((data) => {
    if (data.startYear != null && data.endYear != null) {
        return data.endYear >= data.startYear;
    }
    return true;
}, {
    message: 'End year cannot be before start year',
    path: ['endYear'],
});
// ==========================================
// QUERY FILTERS & PARAMETERS
// ==========================================
exports.vehicleMakeQuerySchema = zod_1.z.object({
    isActive: zod_1.z.coerce.boolean().optional(),
});
exports.vehicleModelQuerySchema = zod_1.z.object({
    makeId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
});
exports.vehicleGenerationQuerySchema = zod_1.z.object({
    modelId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
});
exports.vehicleVariantQuerySchema = zod_1.z.object({
    generationId: zod_1.z.string().uuid().optional(),
    engineId: zod_1.z.string().uuid().optional(),
    isActive: zod_1.z.coerce.boolean().optional(),
});
exports.vehicleParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('ID must be a valid UUID'),
});
//# sourceMappingURL=vehicle.schema.js.map