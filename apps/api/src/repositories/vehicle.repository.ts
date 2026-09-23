import {
  prisma,
  VehicleMake,
  VehicleModel,
  VehicleGeneration,
  VehicleEngine,
  VehicleVariant,
  FuelType,
  Prisma,
} from '@car-parts/database';

export interface CreateVehicleMakeInput {
  name: string;
  slug: string;
  countryOfOrigin?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateVehicleMakeInput {
  name?: string;
  slug?: string;
  countryOfOrigin?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface CreateVehicleModelInput {
  makeId: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

export interface UpdateVehicleModelInput {
  makeId?: string;
  name?: string;
  slug?: string;
  isActive?: boolean;
}

export interface CreateVehicleGenerationInput {
  modelId: string;
  name: string;
  code?: string | null;
  startYear: number;
  endYear?: number | null;
  isActive?: boolean;
}

export interface UpdateVehicleGenerationInput {
  modelId?: string;
  name?: string;
  code?: string | null;
  startYear?: number;
  endYear?: number | null;
  isActive?: boolean;
}

export interface CreateVehicleEngineInput {
  engineCode?: string | null;
  name: string;
  displacementCc?: number | null;
  cylinders?: number | null;
  fuelType?: FuelType;
  aspiration?: string | null;
}

export interface UpdateVehicleEngineInput {
  engineCode?: string | null;
  name?: string;
  displacementCc?: number | null;
  cylinders?: number | null;
  fuelType?: FuelType;
  aspiration?: string | null;
}

export interface CreateVehicleVariantInput {
  generationId: string;
  engineId?: string | null;
  name: string;
  transmission?: string | null;
  bodyType?: string | null;
  drivetrain?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  isActive?: boolean;
}

export interface UpdateVehicleVariantInput {
  generationId?: string;
  engineId?: string | null;
  name?: string;
  transmission?: string | null;
  bodyType?: string | null;
  drivetrain?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  isActive?: boolean;
}

export const variantHierarchyInclude = {
  generation: {
    include: {
      model: {
        include: {
          make: true,
        },
      },
    },
  },
  engine: true,
};

export class VehicleRepository {
  // ==========================================
  // MAKES
  // ==========================================
  static async findAllMakes(onlyActive = true): Promise<VehicleMake[]> {
    return prisma.vehicleMake.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  static async findMakeById(id: string): Promise<VehicleMake | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      const legacyMakes: Record<string, string> = {
        'make-1': 'toyota',
        'make-2': 'honda',
        'make-3': 'isuzu',
        'make-4': 'mitsubishi',
        'make-5': 'ford',
        'make-6': 'mazda',
        'make-7': 'nissan',
      };
      const slug = legacyMakes[id] || id;
      return this.findMakeBySlug(slug);
    }
    return prisma.vehicleMake.findUnique({
      where: { id },
    });
  }

  static async findMakeBySlug(slug: string): Promise<VehicleMake | null> {
    return prisma.vehicleMake.findUnique({
      where: { slug },
    });
  }

  static async findMakeByName(name: string): Promise<VehicleMake | null> {
    return prisma.vehicleMake.findUnique({
      where: { name },
    });
  }

  static async createMake(data: CreateVehicleMakeInput): Promise<VehicleMake> {
    return prisma.vehicleMake.create({
      data: {
        name: data.name,
        slug: data.slug,
        countryOfOrigin: data.countryOfOrigin,
        logoUrl: data.logoUrl,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async updateMake(id: string, data: UpdateVehicleMakeInput): Promise<VehicleMake> {
    let resolvedId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      const existing = await this.findMakeById(id);
      if (!existing) throw new Error(`Vehicle make not found: ${id}`);
      resolvedId = existing.id;
    }
    return prisma.vehicleMake.update({
      where: { id: resolvedId },
      data,
    });
  }

  static async deleteMake(id: string): Promise<VehicleMake> {
    let resolvedId = id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      const existing = await this.findMakeById(id);
      if (!existing) throw new Error(`Vehicle make not found: ${id}`);
      resolvedId = existing.id;
    }
    return prisma.vehicleMake.delete({
      where: { id: resolvedId },
    });
  }

  static async countModelsByMake(makeId: string): Promise<number> {
    let resolvedId = makeId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(makeId);
    if (!isUuid) {
      const existing = await this.findMakeById(makeId);
      if (!existing) return 0;
      resolvedId = existing.id;
    }
    return prisma.vehicleModel.count({
      where: { makeId: resolvedId },
    });
  }

  // ==========================================
  // MODELS
  // ==========================================
  static async findModels(filters: { makeId?: string; isActive?: boolean } = {}): Promise<VehicleModel[]> {
    const where: Prisma.VehicleModelWhereInput = {};
    if (filters.makeId) where.makeId = filters.makeId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    return prisma.vehicleModel.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        make: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  static async findModelById(id: string, includeMake = true) {
    return prisma.vehicleModel.findUnique({
      where: { id },
      include: includeMake
        ? { make: { select: { id: true, name: true, slug: true } } }
        : undefined,
    });
  }

  static async findModelByMakeAndSlug(makeId: string, slug: string): Promise<VehicleModel | null> {
    return prisma.vehicleModel.findUnique({
      where: {
        makeId_slug: { makeId, slug },
      },
    });
  }

  static async createModel(data: CreateVehicleModelInput): Promise<VehicleModel> {
    return prisma.vehicleModel.create({
      data: {
        makeId: data.makeId,
        name: data.name,
        slug: data.slug,
        isActive: data.isActive ?? true,
      },
      include: {
        make: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  static async updateModel(id: string, data: UpdateVehicleModelInput): Promise<VehicleModel> {
    return prisma.vehicleModel.update({
      where: { id },
      data,
      include: {
        make: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  static async deleteModel(id: string): Promise<VehicleModel> {
    return prisma.vehicleModel.delete({
      where: { id },
    });
  }

  static async countGenerationsByModel(modelId: string): Promise<number> {
    return prisma.vehicleGeneration.count({
      where: { modelId },
    });
  }

  // ==========================================
  // GENERATIONS
  // ==========================================
  static async findGenerations(filters: { modelId?: string; isActive?: boolean } = {}) {
    const where: Prisma.VehicleGenerationWhereInput = {};
    if (filters.modelId) where.modelId = filters.modelId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    return prisma.vehicleGeneration.findMany({
      where,
      orderBy: { startYear: 'desc' },
      include: {
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            make: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  static async findGenerationById(id: string, includeRelations = true) {
    return prisma.vehicleGeneration.findUnique({
      where: { id },
      include: includeRelations
        ? {
            model: {
              include: {
                make: { select: { id: true, name: true, slug: true } },
              },
            },
          }
        : undefined,
    });
  }

  static async findGenerationByModelAndName(modelId: string, name: string): Promise<VehicleGeneration | null> {
    return prisma.vehicleGeneration.findUnique({
      where: {
        modelId_name: { modelId, name },
      },
    });
  }

  static async createGeneration(data: CreateVehicleGenerationInput) {
    return prisma.vehicleGeneration.create({
      data: {
        modelId: data.modelId,
        name: data.name,
        code: data.code,
        startYear: data.startYear,
        endYear: data.endYear,
        isActive: data.isActive ?? true,
      },
      include: {
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            make: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  static async updateGeneration(id: string, data: UpdateVehicleGenerationInput) {
    return prisma.vehicleGeneration.update({
      where: { id },
      data,
      include: {
        model: {
          select: {
            id: true,
            name: true,
            slug: true,
            make: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
  }

  static async deleteGeneration(id: string): Promise<VehicleGeneration> {
    return prisma.vehicleGeneration.delete({
      where: { id },
    });
  }

  static async countVariantsByGeneration(generationId: string): Promise<number> {
    return prisma.vehicleVariant.count({
      where: { generationId },
    });
  }

  // ==========================================
  // ENGINES
  // ==========================================
  static async findAllEngines(): Promise<VehicleEngine[]> {
    return prisma.vehicleEngine.findMany({
      orderBy: [{ name: 'asc' }],
    });
  }

  static async findEngineById(id: string): Promise<VehicleEngine | null> {
    return prisma.vehicleEngine.findUnique({
      where: { id },
    });
  }

  static async findEngineByCode(engineCode: string): Promise<VehicleEngine | null> {
    return prisma.vehicleEngine.findFirst({
      where: { engineCode },
    });
  }

  static async createEngine(data: CreateVehicleEngineInput): Promise<VehicleEngine> {
    return prisma.vehicleEngine.create({
      data: {
        engineCode: data.engineCode,
        name: data.name,
        displacementCc: data.displacementCc,
        cylinders: data.cylinders,
        fuelType: data.fuelType ?? FuelType.PETROL,
        aspiration: data.aspiration,
      },
    });
  }

  static async updateEngine(id: string, data: UpdateVehicleEngineInput): Promise<VehicleEngine> {
    return prisma.vehicleEngine.update({
      where: { id },
      data,
    });
  }

  static async deleteEngine(id: string): Promise<VehicleEngine> {
    return prisma.vehicleEngine.delete({
      where: { id },
    });
  }

  static async countVariantsByEngine(engineId: string): Promise<number> {
    return prisma.vehicleVariant.count({
      where: { engineId },
    });
  }

  // ==========================================
  // VARIANTS
  // ==========================================
  static async findVariants(filters: { generationId?: string; engineId?: string; isActive?: boolean } = {}) {
    const where: Prisma.VehicleVariantWhereInput = {};
    if (filters.generationId) where.generationId = filters.generationId;
    if (filters.engineId) where.engineId = filters.engineId;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    return prisma.vehicleVariant.findMany({
      where,
      orderBy: { name: 'asc' },
      include: variantHierarchyInclude,
    });
  }

  static async findVariantById(id: string, includeHierarchy = true) {
    return prisma.vehicleVariant.findUnique({
      where: { id },
      include: includeHierarchy ? variantHierarchyInclude : undefined,
    });
  }

  static async findVariantByGenerationAndName(generationId: string, name: string): Promise<VehicleVariant | null> {
    return prisma.vehicleVariant.findUnique({
      where: {
        generationId_name: { generationId, name },
      },
    });
  }

  static async createVariant(data: CreateVehicleVariantInput) {
    return prisma.vehicleVariant.create({
      data: {
        generationId: data.generationId,
        engineId: data.engineId,
        name: data.name,
        transmission: data.transmission,
        bodyType: data.bodyType,
        drivetrain: data.drivetrain,
        startYear: data.startYear,
        endYear: data.endYear,
        isActive: data.isActive ?? true,
      },
      include: variantHierarchyInclude,
    });
  }

  static async updateVariant(id: string, data: UpdateVehicleVariantInput) {
    return prisma.vehicleVariant.update({
      where: { id },
      data,
      include: variantHierarchyInclude,
    });
  }

  static async deleteVariant(id: string): Promise<VehicleVariant> {
    return prisma.vehicleVariant.delete({
      where: { id },
    });
  }

  static async countFitmentsByVariant(variantId: string): Promise<number> {
    return prisma.productFitment.count({
      where: { vehicleVariantId: variantId },
    });
  }
}
