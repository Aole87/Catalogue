import {
  VehicleRepository,
  CreateVehicleMakeInput,
  UpdateVehicleMakeInput,
  CreateVehicleModelInput,
  UpdateVehicleModelInput,
  CreateVehicleGenerationInput,
  UpdateVehicleGenerationInput,
  CreateVehicleEngineInput,
  UpdateVehicleEngineInput,
  CreateVehicleVariantInput,
  UpdateVehicleVariantInput,
} from '../repositories/vehicle.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/app-error';

export class VehicleService {
  // ==========================================
  // MAKES
  // ==========================================
  static async listMakes(onlyActive = true) {
    return VehicleRepository.findAllMakes(onlyActive);
  }

  static async getMakeById(id: string) {
    const make = await VehicleRepository.findMakeById(id);
    if (!make) {
      throw new NotFoundError('Vehicle make not found');
    }
    return make;
  }

  static async createMake(
    adminUserId: string,
    data: CreateVehicleMakeInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existingName = await VehicleRepository.findMakeByName(data.name);
    if (existingName) {
      throw new ConflictError(`Vehicle make with name '${data.name}' already exists`);
    }

    const existingSlug = await VehicleRepository.findMakeBySlug(data.slug);
    if (existingSlug) {
      throw new ConflictError(`Vehicle make with slug '${data.slug}' already exists`);
    }

    const make = await VehicleRepository.createMake(data);

    await AuditRepository.record({
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

  static async updateMake(
    adminUserId: string,
    id: string,
    data: UpdateVehicleMakeInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findMakeById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle make not found');
    }

    if (data.name && data.name !== existing.name) {
      const collision = await VehicleRepository.findMakeByName(data.name);
      if (collision && collision.id !== id) {
        throw new ConflictError(`Vehicle make with name '${data.name}' already exists`);
      }
    }

    if (data.slug && data.slug !== existing.slug) {
      const collision = await VehicleRepository.findMakeBySlug(data.slug);
      if (collision && collision.id !== id) {
        throw new ConflictError(`Vehicle make with slug '${data.slug}' already exists`);
      }
    }

    const updated = await VehicleRepository.updateMake(id, data);

    await AuditRepository.record({
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

  static async deleteMake(
    adminUserId: string,
    id: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findMakeById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle make not found');
    }

    const modelCount = await VehicleRepository.countModelsByMake(id);
    if (modelCount > 0) {
      throw new BadRequestError(
        `Cannot delete vehicle make '${existing.name}' because it contains ${modelCount} vehicle model(s)`
      );
    }

    const deleted = await VehicleRepository.deleteMake(id);

    await AuditRepository.record({
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
  static async listModels(filters: { makeId?: string; isActive?: boolean } = {}) {
    return VehicleRepository.findModels(filters);
  }

  static async getModelById(id: string) {
    const model = await VehicleRepository.findModelById(id);
    if (!model) {
      throw new NotFoundError('Vehicle model not found');
    }
    return model;
  }

  static async createModel(
    adminUserId: string,
    data: CreateVehicleModelInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const make = await VehicleRepository.findMakeById(data.makeId);
    if (!make) {
      throw new NotFoundError('Parent vehicle make not found');
    }

    const existing = await VehicleRepository.findModelByMakeAndSlug(data.makeId, data.slug);
    if (existing) {
      throw new ConflictError(
        `Vehicle model with slug '${data.slug}' already exists for make '${make.name}'`
      );
    }

    const model = await VehicleRepository.createModel(data);

    await AuditRepository.record({
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

  static async updateModel(
    adminUserId: string,
    id: string,
    data: UpdateVehicleModelInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findModelById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle model not found');
    }

    const targetMakeId = data.makeId || existing.makeId;
    if (data.makeId && data.makeId !== existing.makeId) {
      const make = await VehicleRepository.findMakeById(data.makeId);
      if (!make) {
        throw new NotFoundError('Target vehicle make not found');
      }
    }

    if (data.slug && (data.slug !== existing.slug || targetMakeId !== existing.makeId)) {
      const collision = await VehicleRepository.findModelByMakeAndSlug(targetMakeId, data.slug);
      if (collision && collision.id !== id) {
        throw new ConflictError(
          `Vehicle model with slug '${data.slug}' already exists for make`
        );
      }
    }

    const updated = await VehicleRepository.updateModel(id, data);

    await AuditRepository.record({
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

  static async deleteModel(
    adminUserId: string,
    id: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findModelById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle model not found');
    }

    const genCount = await VehicleRepository.countGenerationsByModel(id);
    if (genCount > 0) {
      throw new BadRequestError(
        `Cannot delete vehicle model '${existing.name}' because it contains ${genCount} vehicle generation(s)`
      );
    }

    const deleted = await VehicleRepository.deleteModel(id);

    await AuditRepository.record({
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
  static async listGenerations(filters: { modelId?: string; isActive?: boolean } = {}) {
    return VehicleRepository.findGenerations(filters);
  }

  static async getGenerationById(id: string) {
    const generation = await VehicleRepository.findGenerationById(id);
    if (!generation) {
      throw new NotFoundError('Vehicle generation not found');
    }
    return generation;
  }

  static async createGeneration(
    adminUserId: string,
    data: CreateVehicleGenerationInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const model = await VehicleRepository.findModelById(data.modelId);
    if (!model) {
      throw new NotFoundError('Parent vehicle model not found');
    }

    const existing = await VehicleRepository.findGenerationByModelAndName(data.modelId, data.name);
    if (existing) {
      throw new ConflictError(
        `Vehicle generation with name '${data.name}' already exists for model '${model.name}'`
      );
    }

    const generation = await VehicleRepository.createGeneration(data);

    await AuditRepository.record({
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

  static async updateGeneration(
    adminUserId: string,
    id: string,
    data: UpdateVehicleGenerationInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findGenerationById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle generation not found');
    }

    const targetModelId = data.modelId || existing.modelId;
    if (data.modelId && data.modelId !== existing.modelId) {
      const model = await VehicleRepository.findModelById(data.modelId);
      if (!model) {
        throw new NotFoundError('Target vehicle model not found');
      }
    }

    if (data.name && (data.name !== existing.name || targetModelId !== existing.modelId)) {
      const collision = await VehicleRepository.findGenerationByModelAndName(targetModelId, data.name);
      if (collision && collision.id !== id) {
        throw new ConflictError(
          `Vehicle generation with name '${data.name}' already exists for model`
        );
      }
    }

    const updated = await VehicleRepository.updateGeneration(id, data);

    await AuditRepository.record({
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

  static async deleteGeneration(
    adminUserId: string,
    id: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findGenerationById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle generation not found');
    }

    const variantCount = await VehicleRepository.countVariantsByGeneration(id);
    if (variantCount > 0) {
      throw new BadRequestError(
        `Cannot delete vehicle generation '${existing.name}' because it contains ${variantCount} vehicle variant(s)`
      );
    }

    const deleted = await VehicleRepository.deleteGeneration(id);

    await AuditRepository.record({
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
    return VehicleRepository.findAllEngines();
  }

  static async getEngineById(id: string) {
    const engine = await VehicleRepository.findEngineById(id);
    if (!engine) {
      throw new NotFoundError('Vehicle engine not found');
    }
    return engine;
  }

  static async createEngine(
    adminUserId: string,
    data: CreateVehicleEngineInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    if (data.engineCode) {
      const existing = await VehicleRepository.findEngineByCode(data.engineCode);
      if (existing) {
        throw new ConflictError(`Vehicle engine with code '${data.engineCode}' already exists`);
      }
    }

    const engine = await VehicleRepository.createEngine(data);

    await AuditRepository.record({
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

  static async updateEngine(
    adminUserId: string,
    id: string,
    data: UpdateVehicleEngineInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findEngineById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle engine not found');
    }

    if (data.engineCode && data.engineCode !== existing.engineCode) {
      const collision = await VehicleRepository.findEngineByCode(data.engineCode);
      if (collision && collision.id !== id) {
        throw new ConflictError(`Vehicle engine with code '${data.engineCode}' already exists`);
      }
    }

    const updated = await VehicleRepository.updateEngine(id, data);

    await AuditRepository.record({
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

  static async deleteEngine(
    adminUserId: string,
    id: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findEngineById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle engine not found');
    }

    const variantCount = await VehicleRepository.countVariantsByEngine(id);
    if (variantCount > 0) {
      throw new BadRequestError(
        `Cannot delete vehicle engine '${existing.name}' because it is assigned to ${variantCount} vehicle variant(s)`
      );
    }

    const deleted = await VehicleRepository.deleteEngine(id);

    await AuditRepository.record({
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
  static async listVariants(filters: { generationId?: string; engineId?: string; isActive?: boolean } = {}) {
    return VehicleRepository.findVariants(filters);
  }

  static async getVariantById(id: string) {
    const variant = await VehicleRepository.findVariantById(id);
    if (!variant) {
      throw new NotFoundError('Vehicle variant not found');
    }
    return variant;
  }

  static async createVariant(
    adminUserId: string,
    data: CreateVehicleVariantInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Cross-hierarchy validation: generation must exist
    const generation = await VehicleRepository.findGenerationById(data.generationId);
    if (!generation) {
      throw new NotFoundError('Parent vehicle generation not found');
    }

    // Engine validation if specified
    if (data.engineId) {
      const engine = await VehicleRepository.findEngineById(data.engineId);
      if (!engine) {
        throw new NotFoundError('Specified vehicle engine not found');
      }
    }

    const existing = await VehicleRepository.findVariantByGenerationAndName(
      data.generationId,
      data.name
    );
    if (existing) {
      throw new ConflictError(
        `Vehicle variant with name '${data.name}' already exists for generation '${generation.name}'`
      );
    }

    const variant = await VehicleRepository.createVariant(data);

    await AuditRepository.record({
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

  static async updateVariant(
    adminUserId: string,
    id: string,
    data: UpdateVehicleVariantInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findVariantById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle variant not found');
    }

    const targetGenId = data.generationId || existing.generationId;
    if (data.generationId && data.generationId !== existing.generationId) {
      const gen = await VehicleRepository.findGenerationById(data.generationId);
      if (!gen) {
        throw new NotFoundError('Target vehicle generation not found');
      }
    }

    if (data.engineId && data.engineId !== existing.engineId) {
      const engine = await VehicleRepository.findEngineById(data.engineId);
      if (!engine) {
        throw new NotFoundError('Target vehicle engine not found');
      }
    }

    if (data.name && (data.name !== existing.name || targetGenId !== existing.generationId)) {
      const collision = await VehicleRepository.findVariantByGenerationAndName(targetGenId, data.name);
      if (collision && collision.id !== id) {
        throw new ConflictError(
          `Vehicle variant with name '${data.name}' already exists for generation`
        );
      }
    }

    const updated = await VehicleRepository.updateVariant(id, data);

    await AuditRepository.record({
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

  static async deleteVariant(
    adminUserId: string,
    id: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const existing = await VehicleRepository.findVariantById(id);
    if (!existing) {
      throw new NotFoundError('Vehicle variant not found');
    }

    const fitmentCount = await VehicleRepository.countFitmentsByVariant(id);
    if (fitmentCount > 0) {
      throw new BadRequestError(
        `Cannot delete vehicle variant '${existing.name}' because it is referenced by ${fitmentCount} product fitment record(s)`
      );
    }

    const deleted = await VehicleRepository.deleteVariant(id);

    await AuditRepository.record({
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
