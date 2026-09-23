"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const vehicle_repository_1 = require("../repositories/vehicle.repository");
const audit_repository_1 = require("../repositories/audit.repository");
const app_error_1 = require("../errors/app-error");
class VehicleService {
    // ==========================================
    // MAKES
    // ==========================================
    static async listMakes(onlyActive = true) {
        return vehicle_repository_1.VehicleRepository.findAllMakes(onlyActive);
    }
    static async getMakeById(id) {
        const make = await vehicle_repository_1.VehicleRepository.findMakeById(id);
        if (!make) {
            throw new app_error_1.NotFoundError('Vehicle make not found');
        }
        return make;
    }
    static async createMake(adminUserId, data, ipAddress, userAgent) {
        const existingName = await vehicle_repository_1.VehicleRepository.findMakeByName(data.name);
        if (existingName) {
            throw new app_error_1.ConflictError(`Vehicle make with name '${data.name}' already exists`);
        }
        const existingSlug = await vehicle_repository_1.VehicleRepository.findMakeBySlug(data.slug);
        if (existingSlug) {
            throw new app_error_1.ConflictError(`Vehicle make with slug '${data.slug}' already exists`);
        }
        const make = await vehicle_repository_1.VehicleRepository.createMake(data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_MAKE_CREATED',
            resource: 'VehicleMake',
            resourceId: make.id,
            after: { id: make.id, name: make.name, slug: make.slug },
            ipAddress,
            userAgent,
        });
        return make;
    }
    static async updateMake(adminUserId, id, data, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findMakeById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle make not found');
        }
        if (data.name && data.name !== existing.name) {
            const collision = await vehicle_repository_1.VehicleRepository.findMakeByName(data.name);
            if (collision && collision.id !== id) {
                throw new app_error_1.ConflictError(`Vehicle make with name '${data.name}' already exists`);
            }
        }
        if (data.slug && data.slug !== existing.slug) {
            const collision = await vehicle_repository_1.VehicleRepository.findMakeBySlug(data.slug);
            if (collision && collision.id !== id) {
                throw new app_error_1.ConflictError(`Vehicle make with slug '${data.slug}' already exists`);
            }
        }
        const updated = await vehicle_repository_1.VehicleRepository.updateMake(id, data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_MAKE_UPDATED',
            resource: 'VehicleMake',
            resourceId: updated.id,
            before: { name: existing.name, slug: existing.slug, isActive: existing.isActive },
            after: { name: updated.name, slug: updated.slug, isActive: updated.isActive },
            ipAddress,
            userAgent,
        });
        return updated;
    }
    static async deleteMake(adminUserId, id, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findMakeById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle make not found');
        }
        const modelCount = await vehicle_repository_1.VehicleRepository.countModelsByMake(id);
        if (modelCount > 0) {
            throw new app_error_1.BadRequestError(`Cannot delete vehicle make '${existing.name}' because it contains ${modelCount} vehicle model(s)`);
        }
        const deleted = await vehicle_repository_1.VehicleRepository.deleteMake(id);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_MAKE_DELETED',
            resource: 'VehicleMake',
            resourceId: id,
            before: { id: existing.id, name: existing.name, slug: existing.slug },
            ipAddress,
            userAgent,
        });
        return deleted;
    }
    // ==========================================
    // MODELS
    // ==========================================
    static async listModels(filters = {}) {
        return vehicle_repository_1.VehicleRepository.findModels(filters);
    }
    static async getModelById(id) {
        const model = await vehicle_repository_1.VehicleRepository.findModelById(id);
        if (!model) {
            throw new app_error_1.NotFoundError('Vehicle model not found');
        }
        return model;
    }
    static async createModel(adminUserId, data, ipAddress, userAgent) {
        const make = await vehicle_repository_1.VehicleRepository.findMakeById(data.makeId);
        if (!make) {
            throw new app_error_1.NotFoundError('Parent vehicle make not found');
        }
        const existing = await vehicle_repository_1.VehicleRepository.findModelByMakeAndSlug(data.makeId, data.slug);
        if (existing) {
            throw new app_error_1.ConflictError(`Vehicle model with slug '${data.slug}' already exists for make '${make.name}'`);
        }
        const model = await vehicle_repository_1.VehicleRepository.createModel(data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_MODEL_CREATED',
            resource: 'VehicleModel',
            resourceId: model.id,
            after: { id: model.id, makeId: model.makeId, name: model.name, slug: model.slug },
            ipAddress,
            userAgent,
        });
        return model;
    }
    static async updateModel(adminUserId, id, data, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findModelById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle model not found');
        }
        const targetMakeId = data.makeId || existing.makeId;
        if (data.makeId && data.makeId !== existing.makeId) {
            const make = await vehicle_repository_1.VehicleRepository.findMakeById(data.makeId);
            if (!make) {
                throw new app_error_1.NotFoundError('Target vehicle make not found');
            }
        }
        if (data.slug && (data.slug !== existing.slug || targetMakeId !== existing.makeId)) {
            const collision = await vehicle_repository_1.VehicleRepository.findModelByMakeAndSlug(targetMakeId, data.slug);
            if (collision && collision.id !== id) {
                throw new app_error_1.ConflictError(`Vehicle model with slug '${data.slug}' already exists for make`);
            }
        }
        const updated = await vehicle_repository_1.VehicleRepository.updateModel(id, data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_MODEL_UPDATED',
            resource: 'VehicleModel',
            resourceId: updated.id,
            before: { name: existing.name, slug: existing.slug, makeId: existing.makeId },
            after: { name: updated.name, slug: updated.slug, makeId: updated.makeId },
            ipAddress,
            userAgent,
        });
        return updated;
    }
    static async deleteModel(adminUserId, id, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findModelById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle model not found');
        }
        const genCount = await vehicle_repository_1.VehicleRepository.countGenerationsByModel(id);
        if (genCount > 0) {
            throw new app_error_1.BadRequestError(`Cannot delete vehicle model '${existing.name}' because it contains ${genCount} vehicle generation(s)`);
        }
        const deleted = await vehicle_repository_1.VehicleRepository.deleteModel(id);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_MODEL_DELETED',
            resource: 'VehicleModel',
            resourceId: id,
            before: { id: existing.id, name: existing.name, makeId: existing.makeId },
            ipAddress,
            userAgent,
        });
        return deleted;
    }
    // ==========================================
    // GENERATIONS
    // ==========================================
    static async listGenerations(filters = {}) {
        return vehicle_repository_1.VehicleRepository.findGenerations(filters);
    }
    static async getGenerationById(id) {
        const generation = await vehicle_repository_1.VehicleRepository.findGenerationById(id);
        if (!generation) {
            throw new app_error_1.NotFoundError('Vehicle generation not found');
        }
        return generation;
    }
    static async createGeneration(adminUserId, data, ipAddress, userAgent) {
        const model = await vehicle_repository_1.VehicleRepository.findModelById(data.modelId);
        if (!model) {
            throw new app_error_1.NotFoundError('Parent vehicle model not found');
        }
        const existing = await vehicle_repository_1.VehicleRepository.findGenerationByModelAndName(data.modelId, data.name);
        if (existing) {
            throw new app_error_1.ConflictError(`Vehicle generation with name '${data.name}' already exists for model '${model.name}'`);
        }
        const generation = await vehicle_repository_1.VehicleRepository.createGeneration(data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_GENERATION_CREATED',
            resource: 'VehicleGeneration',
            resourceId: generation.id,
            after: {
                id: generation.id,
                modelId: generation.modelId,
                name: generation.name,
                code: generation.code,
                startYear: generation.startYear,
                endYear: generation.endYear,
            },
            ipAddress,
            userAgent,
        });
        return generation;
    }
    static async updateGeneration(adminUserId, id, data, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findGenerationById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle generation not found');
        }
        const targetModelId = data.modelId || existing.modelId;
        if (data.modelId && data.modelId !== existing.modelId) {
            const model = await vehicle_repository_1.VehicleRepository.findModelById(data.modelId);
            if (!model) {
                throw new app_error_1.NotFoundError('Target vehicle model not found');
            }
        }
        if (data.name && (data.name !== existing.name || targetModelId !== existing.modelId)) {
            const collision = await vehicle_repository_1.VehicleRepository.findGenerationByModelAndName(targetModelId, data.name);
            if (collision && collision.id !== id) {
                throw new app_error_1.ConflictError(`Vehicle generation with name '${data.name}' already exists for model`);
            }
        }
        const updated = await vehicle_repository_1.VehicleRepository.updateGeneration(id, data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_GENERATION_UPDATED',
            resource: 'VehicleGeneration',
            resourceId: updated.id,
            before: { name: existing.name, modelId: existing.modelId, startYear: existing.startYear },
            after: { name: updated.name, modelId: updated.modelId, startYear: updated.startYear },
            ipAddress,
            userAgent,
        });
        return updated;
    }
    static async deleteGeneration(adminUserId, id, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findGenerationById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle generation not found');
        }
        const variantCount = await vehicle_repository_1.VehicleRepository.countVariantsByGeneration(id);
        if (variantCount > 0) {
            throw new app_error_1.BadRequestError(`Cannot delete vehicle generation '${existing.name}' because it contains ${variantCount} vehicle variant(s)`);
        }
        const deleted = await vehicle_repository_1.VehicleRepository.deleteGeneration(id);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_GENERATION_DELETED',
            resource: 'VehicleGeneration',
            resourceId: id,
            before: { id: existing.id, name: existing.name, modelId: existing.modelId },
            ipAddress,
            userAgent,
        });
        return deleted;
    }
    // ==========================================
    // ENGINES
    // ==========================================
    static async listEngines() {
        return vehicle_repository_1.VehicleRepository.findAllEngines();
    }
    static async getEngineById(id) {
        const engine = await vehicle_repository_1.VehicleRepository.findEngineById(id);
        if (!engine) {
            throw new app_error_1.NotFoundError('Vehicle engine not found');
        }
        return engine;
    }
    static async createEngine(adminUserId, data, ipAddress, userAgent) {
        if (data.engineCode) {
            const existing = await vehicle_repository_1.VehicleRepository.findEngineByCode(data.engineCode);
            if (existing) {
                throw new app_error_1.ConflictError(`Vehicle engine with code '${data.engineCode}' already exists`);
            }
        }
        const engine = await vehicle_repository_1.VehicleRepository.createEngine(data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_ENGINE_CREATED',
            resource: 'VehicleEngine',
            resourceId: engine.id,
            after: {
                id: engine.id,
                name: engine.name,
                engineCode: engine.engineCode,
                fuelType: engine.fuelType,
            },
            ipAddress,
            userAgent,
        });
        return engine;
    }
    static async updateEngine(adminUserId, id, data, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findEngineById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle engine not found');
        }
        if (data.engineCode && data.engineCode !== existing.engineCode) {
            const collision = await vehicle_repository_1.VehicleRepository.findEngineByCode(data.engineCode);
            if (collision && collision.id !== id) {
                throw new app_error_1.ConflictError(`Vehicle engine with code '${data.engineCode}' already exists`);
            }
        }
        const updated = await vehicle_repository_1.VehicleRepository.updateEngine(id, data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_ENGINE_UPDATED',
            resource: 'VehicleEngine',
            resourceId: updated.id,
            before: { name: existing.name, engineCode: existing.engineCode },
            after: { name: updated.name, engineCode: updated.engineCode },
            ipAddress,
            userAgent,
        });
        return updated;
    }
    static async deleteEngine(adminUserId, id, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findEngineById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle engine not found');
        }
        const variantCount = await vehicle_repository_1.VehicleRepository.countVariantsByEngine(id);
        if (variantCount > 0) {
            throw new app_error_1.BadRequestError(`Cannot delete vehicle engine '${existing.name}' because it is assigned to ${variantCount} vehicle variant(s)`);
        }
        const deleted = await vehicle_repository_1.VehicleRepository.deleteEngine(id);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_ENGINE_DELETED',
            resource: 'VehicleEngine',
            resourceId: id,
            before: { id: existing.id, name: existing.name, engineCode: existing.engineCode },
            ipAddress,
            userAgent,
        });
        return deleted;
    }
    // ==========================================
    // VARIANTS
    // ==========================================
    static async listVariants(filters = {}) {
        return vehicle_repository_1.VehicleRepository.findVariants(filters);
    }
    static async getVariantById(id) {
        const variant = await vehicle_repository_1.VehicleRepository.findVariantById(id);
        if (!variant) {
            throw new app_error_1.NotFoundError('Vehicle variant not found');
        }
        return variant;
    }
    static async createVariant(adminUserId, data, ipAddress, userAgent) {
        // Cross-hierarchy validation: generation must exist
        const generation = await vehicle_repository_1.VehicleRepository.findGenerationById(data.generationId);
        if (!generation) {
            throw new app_error_1.NotFoundError('Parent vehicle generation not found');
        }
        // Engine validation if specified
        if (data.engineId) {
            const engine = await vehicle_repository_1.VehicleRepository.findEngineById(data.engineId);
            if (!engine) {
                throw new app_error_1.NotFoundError('Specified vehicle engine not found');
            }
        }
        const existing = await vehicle_repository_1.VehicleRepository.findVariantByGenerationAndName(data.generationId, data.name);
        if (existing) {
            throw new app_error_1.ConflictError(`Vehicle variant with name '${data.name}' already exists for generation '${generation.name}'`);
        }
        const variant = await vehicle_repository_1.VehicleRepository.createVariant(data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_VARIANT_CREATED',
            resource: 'VehicleVariant',
            resourceId: variant.id,
            after: {
                id: variant.id,
                generationId: variant.generationId,
                engineId: variant.engineId,
                name: variant.name,
            },
            ipAddress,
            userAgent,
        });
        return variant;
    }
    static async updateVariant(adminUserId, id, data, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findVariantById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle variant not found');
        }
        const targetGenId = data.generationId || existing.generationId;
        if (data.generationId && data.generationId !== existing.generationId) {
            const gen = await vehicle_repository_1.VehicleRepository.findGenerationById(data.generationId);
            if (!gen) {
                throw new app_error_1.NotFoundError('Target vehicle generation not found');
            }
        }
        if (data.engineId && data.engineId !== existing.engineId) {
            const engine = await vehicle_repository_1.VehicleRepository.findEngineById(data.engineId);
            if (!engine) {
                throw new app_error_1.NotFoundError('Target vehicle engine not found');
            }
        }
        if (data.name && (data.name !== existing.name || targetGenId !== existing.generationId)) {
            const collision = await vehicle_repository_1.VehicleRepository.findVariantByGenerationAndName(targetGenId, data.name);
            if (collision && collision.id !== id) {
                throw new app_error_1.ConflictError(`Vehicle variant with name '${data.name}' already exists for generation`);
            }
        }
        const updated = await vehicle_repository_1.VehicleRepository.updateVariant(id, data);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_VARIANT_UPDATED',
            resource: 'VehicleVariant',
            resourceId: updated.id,
            before: { name: existing.name, generationId: existing.generationId, engineId: existing.engineId },
            after: { name: updated.name, generationId: updated.generationId, engineId: updated.engineId },
            ipAddress,
            userAgent,
        });
        return updated;
    }
    static async deleteVariant(adminUserId, id, ipAddress, userAgent) {
        const existing = await vehicle_repository_1.VehicleRepository.findVariantById(id);
        if (!existing) {
            throw new app_error_1.NotFoundError('Vehicle variant not found');
        }
        const fitmentCount = await vehicle_repository_1.VehicleRepository.countFitmentsByVariant(id);
        if (fitmentCount > 0) {
            throw new app_error_1.BadRequestError(`Cannot delete vehicle variant '${existing.name}' because it is referenced by ${fitmentCount} product fitment record(s)`);
        }
        const deleted = await vehicle_repository_1.VehicleRepository.deleteVariant(id);
        await audit_repository_1.AuditRepository.record({
            userId: adminUserId,
            action: 'VEHICLE_VARIANT_DELETED',
            resource: 'VehicleVariant',
            resourceId: id,
            before: { id: existing.id, name: existing.name, generationId: existing.generationId },
            ipAddress,
            userAgent,
        });
        return deleted;
    }
}
exports.VehicleService = VehicleService;
//# sourceMappingURL=vehicle.service.js.map