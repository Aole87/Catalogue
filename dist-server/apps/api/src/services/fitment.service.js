"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitmentService = void 0;
const database_1 = require("@car-parts/database");
const fitment_repository_1 = require("../repositories/fitment.repository");
const product_repository_1 = require("../repositories/product.repository");
const vehicle_repository_1 = require("../repositories/vehicle.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const app_error_1 = require("../errors/app-error");
class FitmentService {
    /**
     * Deterministic Fitment Engine — Single Source of Truth
     * Answers: "Can this part fit this vehicle?"
     * Strictly enforces that ONLY explicit PostgreSQL ProductFitment records produce compatible = true.
     * AI, semantic search, fuzzy matching, and product title guessing are strictly prohibited.
     */
    static async checkProductFitment(productId, vehicleVariantId, position) {
        // 1. Validate Product
        const product = await product_repository_1.ProductRepository.findById(productId, false);
        if (!product || product.deletedAt) {
            return {
                productId,
                vehicleVariantId: vehicleVariantId || null,
                compatible: false,
                reason: 'INVALID_PRODUCT',
                fitment: null,
            };
        }
        // 2. Validate Vehicle Variant Specification
        if (!vehicleVariantId || vehicleVariantId.trim() === '') {
            return {
                productId,
                vehicleVariantId: null,
                compatible: false,
                reason: 'INSUFFICIENT_VEHICLE_SPECIFICATION',
                fitment: null,
            };
        }
        const variant = await vehicle_repository_1.VehicleRepository.findVariantById(vehicleVariantId, true);
        if (!variant || !variant.isActive) {
            return {
                productId,
                vehicleVariantId,
                compatible: false,
                reason: 'INVALID_VEHICLE',
                fitment: null,
            };
        }
        // 3. Query Authoritative Structured ProductFitment Record
        const fitment = await fitment_repository_1.FitmentRepository.findFitment(productId, vehicleVariantId, position);
        if (fitment && fitment.fitmentStatus === database_1.FitmentStatus.COMPATIBLE) {
            const f = fitment;
            const v = f.vehicleVariant;
            const gen = v?.generation;
            const model = gen?.model;
            const make = model?.make;
            const yearRange = v?.startYear || v?.endYear
                ? `${v.startYear || ''}-${v.endYear || 'Present'}`
                : gen ? `${gen.startYear}-${gen.endYear || 'Present'}` : null;
            return {
                productId,
                vehicleVariantId,
                compatible: true,
                reason: 'EXPLICIT_FITMENT',
                fitment: {
                    id: fitment.id,
                    position: fitment.position,
                    notes: fitment.notes,
                    status: fitment.fitmentStatus,
                    vehicle: {
                        make: make.name,
                        model: model.name,
                        generation: gen.name,
                        variant: v.name,
                        engine: v.engine ? v.engine.name : null,
                        yearRange,
                    },
                },
            };
        }
        // 4. Default: No valid structured compatibility record -> Deterministic Negative
        return {
            productId,
            vehicleVariantId,
            compatible: false,
            reason: 'NO_FITMENT_RECORD',
            fitment: null,
        };
    }
    /**
     * Find all products compatible with a specific vehicle variant (Storefront API)
     */
    static async getCompatibleProducts(vehicleVariantId, options, userTier = database_1.PriceTier.GENERAL) {
        const variant = await vehicle_repository_1.VehicleRepository.findVariantById(vehicleVariantId, true);
        if (!variant || !variant.isActive) {
            throw new app_error_1.NotFoundError('Vehicle variant not found or inactive');
        }
        const result = await fitment_repository_1.FitmentRepository.findFitmentsByVariant(vehicleVariantId, options);
        const formatPriceDecimal = (val) => {
            if (val === null || val === undefined)
                return null;
            return Number(val).toFixed(2);
        };
        const formattedItems = result.items.map((prod) => {
            const tierPrice = prod.prices?.find((p) => p.tier === userTier && p.isActive !== false) ||
                prod.prices?.find((p) => p.tier === database_1.PriceTier.GENERAL && p.isActive !== false) ||
                prod.prices?.[0] ||
                null;
            const primaryImg = prod.images?.find((img) => img.isPrimary) ||
                prod.images?.[0] ||
                null;
            return {
                ...prod,
                effectivePrice: tierPrice
                    ? {
                        amount: formatPriceDecimal(tierPrice.price),
                        compareAtPrice: formatPriceDecimal(tierPrice.compareAtPrice),
                        tier: tierPrice.tier,
                        currency: tierPrice.currency,
                    }
                    : null,
                primaryImage: primaryImg ? primaryImg.url : null,
            };
        });
        const v = variant;
        const gen = v.generation;
        const model = gen?.model;
        const make = model?.make;
        return {
            vehicle: {
                id: variant.id,
                make: make ? make.name : '',
                model: model ? model.name : '',
                generation: gen ? gen.name : '',
                variant: variant.name,
                engine: v.engine ? v.engine.name : null,
            },
            items: formattedItems,
            pagination: result.pagination,
        };
    }
    /**
     * Get all vehicle fitment entries for a specific product
     */
    static async getProductFitments(productId) {
        const product = await product_repository_1.ProductRepository.findById(productId, false);
        if (!product || product.deletedAt) {
            throw new app_error_1.NotFoundError('Product not found');
        }
        const fitments = await fitment_repository_1.FitmentRepository.findFitmentsByProduct(productId);
        return fitments.map((f) => {
            const v = f.vehicleVariant;
            const gen = v?.generation;
            const model = gen?.model;
            const make = model?.make;
            return {
                id: f.id,
                productId: f.productId,
                position: f.position,
                notes: f.notes,
                fitmentStatus: f.fitmentStatus,
                vehicleVariant: v
                    ? {
                        id: v.id,
                        name: v.name,
                        transmission: v.transmission,
                        bodyType: v.bodyType,
                        drivetrain: v.drivetrain,
                        startYear: v.startYear,
                        endYear: v.endYear,
                        generation: gen
                            ? {
                                id: gen.id,
                                name: gen.name,
                                code: gen.code,
                                startYear: gen.startYear,
                                endYear: gen.endYear,
                                model: model
                                    ? {
                                        id: model.id,
                                        name: model.name,
                                        slug: model.slug,
                                        make: make
                                            ? {
                                                id: make.id,
                                                name: make.name,
                                                slug: make.slug,
                                            }
                                            : null,
                                    }
                                    : null,
                            }
                            : null,
                        engine: v.engine
                            ? {
                                id: v.engine.id,
                                name: v.engine.name,
                                engineCode: v.engine.engineCode,
                                fuelType: v.engine.fuelType,
                                displacementCc: v.engine.displacementCc,
                            }
                            : null,
                    }
                    : null,
            };
        });
    }
    // ==========================================
    // ADMIN FITMENT CRUD (WITH RBAC & AUDIT LOGS)
    // ==========================================
    static async createFitment(adminUserId, data, ipAddress, userAgent) {
        const product = await product_repository_1.ProductRepository.findById(data.productId, false);
        if (!product || product.deletedAt) {
            throw new app_error_1.NotFoundError('Product not found');
        }
        const variant = await vehicle_repository_1.VehicleRepository.findVariantById(data.vehicleVariantId, false);
        if (!variant) {
            throw new app_error_1.NotFoundError('Vehicle variant not found');
        }
        const position = data.position || 'ALL';
        const existing = await fitment_repository_1.FitmentRepository.findFitment(data.productId, data.vehicleVariantId, position);
        if (existing) {
            throw new app_error_1.ConflictError(`Fitment already exists for this product, vehicle variant, and position (${position})`);
        }
        const fitment = await fitment_repository_1.FitmentRepository.createFitment({
            ...data,
            position,
        });
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'FITMENT_CREATED',
            resource: 'ProductFitment',
            resourceId: fitment.id,
            after: {
                id: fitment.id,
                productId: fitment.productId,
                vehicleVariantId: fitment.vehicleVariantId,
                position: fitment.position,
                notes: fitment.notes,
                fitmentStatus: fitment.fitmentStatus,
            },
            ipAddress,
            userAgent,
        });
        return fitment;
    }
    static async updateFitment(adminUserId, fitmentId, data, ipAddress, userAgent) {
        const existing = await fitment_repository_1.FitmentRepository.findFitmentById(fitmentId);
        if (!existing) {
            throw new app_error_1.NotFoundError('Fitment record not found');
        }
        if (data.position && data.position !== existing.position) {
            const collision = await fitment_repository_1.FitmentRepository.findFitment(existing.productId, existing.vehicleVariantId, data.position);
            if (collision && collision.id !== fitmentId) {
                throw new app_error_1.ConflictError(`Another fitment already exists for position ${data.position}`);
            }
        }
        const updated = await fitment_repository_1.FitmentRepository.updateFitment(fitmentId, data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'FITMENT_UPDATED',
            resource: 'ProductFitment',
            resourceId: updated.id,
            before: {
                position: existing.position,
                notes: existing.notes,
                fitmentStatus: existing.fitmentStatus,
            },
            after: {
                position: updated.position,
                notes: updated.notes,
                fitmentStatus: updated.fitmentStatus,
            },
            ipAddress,
            userAgent,
        });
        return updated;
    }
    static async deleteFitment(adminUserId, fitmentId, ipAddress, userAgent) {
        const existing = await fitment_repository_1.FitmentRepository.findFitmentById(fitmentId);
        if (!existing) {
            throw new app_error_1.NotFoundError('Fitment record not found');
        }
        const deleted = await fitment_repository_1.FitmentRepository.deleteFitment(fitmentId);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'FITMENT_DELETED',
            resource: 'ProductFitment',
            resourceId: fitmentId,
            before: {
                id: existing.id,
                productId: existing.productId,
                vehicleVariantId: existing.vehicleVariantId,
                position: existing.position,
            },
            ipAddress,
            userAgent,
        });
        return deleted;
    }
}
exports.FitmentService = FitmentService;
//# sourceMappingURL=fitment.service.js.map