"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleRepository = exports.variantHierarchyInclude = void 0;
const database_1 = require("@car-parts/database");
exports.variantHierarchyInclude = {
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
class VehicleRepository {
    // ==========================================
    // MAKES
    // ==========================================
    static async findAllMakes(onlyActive = true) {
        return database_1.prisma.vehicleMake.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { name: 'asc' },
        });
    }
    static async findMakeById(id) {
        return database_1.prisma.vehicleMake.findUnique({
            where: { id },
        });
    }
    static async findMakeBySlug(slug) {
        return database_1.prisma.vehicleMake.findUnique({
            where: { slug },
        });
    }
    static async findMakeByName(name) {
        return database_1.prisma.vehicleMake.findUnique({
            where: { name },
        });
    }
    static async createMake(data) {
        return database_1.prisma.vehicleMake.create({
            data: {
                name: data.name,
                slug: data.slug,
                countryOfOrigin: data.countryOfOrigin,
                logoUrl: data.logoUrl,
                isActive: data.isActive ?? true,
            },
        });
    }
    static async updateMake(id, data) {
        return database_1.prisma.vehicleMake.update({
            where: { id },
            data,
        });
    }
    static async deleteMake(id) {
        return database_1.prisma.vehicleMake.delete({
            where: { id },
        });
    }
    static async countModelsByMake(makeId) {
        return database_1.prisma.vehicleModel.count({
            where: { makeId },
        });
    }
    // ==========================================
    // MODELS
    // ==========================================
    static async findModels(filters = {}) {
        const where = {};
        if (filters.makeId)
            where.makeId = filters.makeId;
        if (filters.isActive !== undefined)
            where.isActive = filters.isActive;
        return database_1.prisma.vehicleModel.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                make: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
    }
    static async findModelById(id, includeMake = true) {
        return database_1.prisma.vehicleModel.findUnique({
            where: { id },
            include: includeMake
                ? { make: { select: { id: true, name: true, slug: true } } }
                : undefined,
        });
    }
    static async findModelByMakeAndSlug(makeId, slug) {
        return database_1.prisma.vehicleModel.findUnique({
            where: {
                makeId_slug: { makeId, slug },
            },
        });
    }
    static async createModel(data) {
        return database_1.prisma.vehicleModel.create({
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
    static async updateModel(id, data) {
        return database_1.prisma.vehicleModel.update({
            where: { id },
            data,
            include: {
                make: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
    }
    static async deleteModel(id) {
        return database_1.prisma.vehicleModel.delete({
            where: { id },
        });
    }
    static async countGenerationsByModel(modelId) {
        return database_1.prisma.vehicleGeneration.count({
            where: { modelId },
        });
    }
    // ==========================================
    // GENERATIONS
    // ==========================================
    static async findGenerations(filters = {}) {
        const where = {};
        if (filters.modelId)
            where.modelId = filters.modelId;
        if (filters.isActive !== undefined)
            where.isActive = filters.isActive;
        return database_1.prisma.vehicleGeneration.findMany({
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
    static async findGenerationById(id, includeRelations = true) {
        return database_1.prisma.vehicleGeneration.findUnique({
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
    static async findGenerationByModelAndName(modelId, name) {
        return database_1.prisma.vehicleGeneration.findUnique({
            where: {
                modelId_name: { modelId, name },
            },
        });
    }
    static async createGeneration(data) {
        return database_1.prisma.vehicleGeneration.create({
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
    static async updateGeneration(id, data) {
        return database_1.prisma.vehicleGeneration.update({
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
    static async deleteGeneration(id) {
        return database_1.prisma.vehicleGeneration.delete({
            where: { id },
        });
    }
    static async countVariantsByGeneration(generationId) {
        return database_1.prisma.vehicleVariant.count({
            where: { generationId },
        });
    }
    // ==========================================
    // ENGINES
    // ==========================================
    static async findAllEngines() {
        return database_1.prisma.vehicleEngine.findMany({
            orderBy: [{ name: 'asc' }],
        });
    }
    static async findEngineById(id) {
        return database_1.prisma.vehicleEngine.findUnique({
            where: { id },
        });
    }
    static async findEngineByCode(engineCode) {
        return database_1.prisma.vehicleEngine.findFirst({
            where: { engineCode },
        });
    }
    static async createEngine(data) {
        return database_1.prisma.vehicleEngine.create({
            data: {
                engineCode: data.engineCode,
                name: data.name,
                displacementCc: data.displacementCc,
                cylinders: data.cylinders,
                fuelType: data.fuelType ?? database_1.FuelType.PETROL,
                aspiration: data.aspiration,
            },
        });
    }
    static async updateEngine(id, data) {
        return database_1.prisma.vehicleEngine.update({
            where: { id },
            data,
        });
    }
    static async deleteEngine(id) {
        return database_1.prisma.vehicleEngine.delete({
            where: { id },
        });
    }
    static async countVariantsByEngine(engineId) {
        return database_1.prisma.vehicleVariant.count({
            where: { engineId },
        });
    }
    // ==========================================
    // VARIANTS
    // ==========================================
    static async findVariants(filters = {}) {
        const where = {};
        if (filters.generationId)
            where.generationId = filters.generationId;
        if (filters.engineId)
            where.engineId = filters.engineId;
        if (filters.isActive !== undefined)
            where.isActive = filters.isActive;
        return database_1.prisma.vehicleVariant.findMany({
            where,
            orderBy: { name: 'asc' },
            include: exports.variantHierarchyInclude,
        });
    }
    static async findVariantById(id, includeHierarchy = true) {
        return database_1.prisma.vehicleVariant.findUnique({
            where: { id },
            include: includeHierarchy ? exports.variantHierarchyInclude : undefined,
        });
    }
    static async findVariantByGenerationAndName(generationId, name) {
        return database_1.prisma.vehicleVariant.findUnique({
            where: {
                generationId_name: { generationId, name },
            },
        });
    }
    static async createVariant(data) {
        return database_1.prisma.vehicleVariant.create({
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
            include: exports.variantHierarchyInclude,
        });
    }
    static async updateVariant(id, data) {
        return database_1.prisma.vehicleVariant.update({
            where: { id },
            data,
            include: exports.variantHierarchyInclude,
        });
    }
    static async deleteVariant(id) {
        return database_1.prisma.vehicleVariant.delete({
            where: { id },
        });
    }
    static async countFitmentsByVariant(variantId) {
        return database_1.prisma.productFitment.count({
            where: { vehicleVariantId: variantId },
        });
    }
}
exports.VehicleRepository = VehicleRepository;
//# sourceMappingURL=vehicle.repository.js.map