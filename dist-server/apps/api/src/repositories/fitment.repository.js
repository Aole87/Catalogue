"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FitmentRepository = exports.fitmentDetailInclude = void 0;
const database_1 = require("@car-parts/database");
const product_repository_1 = require("./product.repository");
const vehicle_repository_1 = require("./vehicle.repository");
exports.fitmentDetailInclude = {
    vehicleVariant: {
        include: vehicle_repository_1.variantHierarchyInclude,
    },
    product: {
        select: { id: true, name: true, sku: true, slug: true, isActive: true },
    },
};
class FitmentRepository {
    static async findFitment(productId, vehicleVariantId, position) {
        if (position) {
            return database_1.prisma.productFitment.findUnique({
                where: {
                    productId_vehicleVariantId_position: {
                        productId,
                        vehicleVariantId,
                        position,
                    },
                },
                include: exports.fitmentDetailInclude,
            });
        }
        // If position not specified, find any matching fitment record (e.g. ALL or first)
        return database_1.prisma.productFitment.findFirst({
            where: {
                productId,
                vehicleVariantId,
            },
            include: exports.fitmentDetailInclude,
        });
    }
    static async findFitmentById(id) {
        return database_1.prisma.productFitment.findUnique({
            where: { id },
            include: exports.fitmentDetailInclude,
        });
    }
    static async findFitmentsByProduct(productId) {
        return database_1.prisma.productFitment.findMany({
            where: { productId },
            include: {
                vehicleVariant: {
                    include: vehicle_repository_1.variantHierarchyInclude,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async findFitmentsByVariant(vehicleVariantId, options = {}) {
        const page = Math.max(1, options.page || 1);
        const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
        const skip = (page - 1) * pageSize;
        const productWhere = {
            isActive: true,
            isPublished: true,
            deletedAt: null,
        };
        if (options.categoryId) {
            productWhere.categoryId = options.categoryId;
        }
        if (options.brandId) {
            productWhere.brandId = options.brandId;
        }
        if (options.search && options.search.trim() !== '') {
            const term = options.search.trim();
            productWhere.OR = [
                { name: { contains: term, mode: 'insensitive' } },
                { sku: { contains: term, mode: 'insensitive' } },
                { brand: { name: { contains: term, mode: 'insensitive' } } },
            ];
        }
        const where = {
            vehicleVariantId,
            fitmentStatus: database_1.FitmentStatus.COMPATIBLE,
            product: productWhere,
        };
        const items = await database_1.prisma.productFitment.findMany({
            where,
            skip,
            take: pageSize,
            include: {
                product: {
                    include: product_repository_1.productDetailInclude,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const total = await database_1.prisma.productFitment.count({ where });
        return {
            items: items.map((f) => ({
                ...f.product,
                fitmentPosition: f.position,
                fitmentNotes: f.notes,
            })),
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    static async countByVariant(vehicleVariantId) {
        return database_1.prisma.productFitment.count({
            where: { vehicleVariantId },
        });
    }
    static async countByProduct(productId) {
        return database_1.prisma.productFitment.count({
            where: { productId },
        });
    }
    static async createFitment(data) {
        return database_1.prisma.productFitment.create({
            data: {
                productId: data.productId,
                vehicleVariantId: data.vehicleVariantId,
                position: data.position || 'ALL',
                notes: data.notes,
                fitmentStatus: data.fitmentStatus ?? database_1.FitmentStatus.COMPATIBLE,
            },
            include: exports.fitmentDetailInclude,
        });
    }
    static async updateFitment(id, data) {
        return database_1.prisma.productFitment.update({
            where: { id },
            data,
            include: exports.fitmentDetailInclude,
        });
    }
    static async deleteFitment(id) {
        return database_1.prisma.productFitment.delete({
            where: { id },
        });
    }
    static async deleteByProductAndVariant(productId, vehicleVariantId, position) {
        if (position) {
            return database_1.prisma.productFitment.delete({
                where: {
                    productId_vehicleVariantId_position: {
                        productId,
                        vehicleVariantId,
                        position,
                    },
                },
            });
        }
        return database_1.prisma.productFitment.deleteMany({
            where: {
                productId,
                vehicleVariantId,
            },
        });
    }
}
exports.FitmentRepository = FitmentRepository;
//# sourceMappingURL=fitment.repository.js.map