"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandRepository = void 0;
const database_1 = require("@car-parts/database");
class BrandRepository {
    static async findById(id) {
        return database_1.prisma.brand.findUnique({
            where: { id },
        });
    }
    static async findBySlug(slug) {
        return database_1.prisma.brand.findUnique({
            where: { slug },
        });
    }
    static async findByName(name) {
        return database_1.prisma.brand.findFirst({
            where: {
                name: { equals: name, mode: 'insensitive' },
                deletedAt: null,
            },
        });
    }
    static async findAll(params = {}) {
        const where = {
            deletedAt: null,
        };
        if (params.onlyActive) {
            where.isActive = true;
        }
        return database_1.prisma.brand.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    static async create(data) {
        return database_1.prisma.brand.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
                logoUrl: data.logoUrl,
                websiteUrl: data.websiteUrl,
                isActive: data.isActive ?? true,
            },
        });
    }
    static async update(id, data) {
        return database_1.prisma.brand.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.slug !== undefined ? { slug: data.slug } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
                ...(data.websiteUrl !== undefined ? { websiteUrl: data.websiteUrl } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
        });
    }
    static async softDelete(id) {
        return database_1.prisma.brand.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }
    static async countProducts(brandId) {
        return database_1.prisma.product.count({
            where: {
                brandId,
                deletedAt: null,
            },
        });
    }
}
exports.BrandRepository = BrandRepository;
//# sourceMappingURL=brand.repository.js.map