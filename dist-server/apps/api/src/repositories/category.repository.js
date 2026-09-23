"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const database_1 = require("@car-parts/database");
class CategoryRepository {
    static async findById(id) {
        return database_1.prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: {
                    where: { deletedAt: null },
                    orderBy: { sortOrder: 'asc' },
                },
            },
        });
    }
    static async findBySlug(slug) {
        return database_1.prisma.category.findUnique({
            where: { slug },
            include: {
                parent: true,
                children: {
                    where: { deletedAt: null },
                    orderBy: { sortOrder: 'asc' },
                },
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
        return database_1.prisma.category.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
                parent: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
    }
    static async create(data) {
        return database_1.prisma.category.create({
            data: {
                name: data.name,
                slug: data.slug,
                parentId: data.parentId || null,
                description: data.description,
                imageUrl: data.imageUrl,
                sortOrder: data.sortOrder ?? 0,
                isActive: data.isActive ?? true,
            },
            include: {
                parent: true,
            },
        });
    }
    static async update(id, data) {
        return database_1.prisma.category.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name } : {}),
                ...(data.slug !== undefined ? { slug: data.slug } : {}),
                ...(data.parentId !== undefined ? { parentId: data.parentId } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
                ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
                ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            },
            include: {
                parent: true,
            },
        });
    }
    static async softDelete(id) {
        return database_1.prisma.category.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
            },
        });
    }
    static async countProducts(categoryId) {
        return database_1.prisma.product.count({
            where: {
                categoryId,
                deletedAt: null,
            },
        });
    }
    static async countChildren(categoryId) {
        return database_1.prisma.category.count({
            where: {
                parentId: categoryId,
                deletedAt: null,
            },
        });
    }
    static async getAllDescendantIds(categoryId) {
        const allCategories = await database_1.prisma.category.findMany({
            where: { deletedAt: null },
            select: { id: true, parentId: true },
        });
        const descendantIds = [];
        const queue = [categoryId];
        while (queue.length > 0) {
            const currentId = queue.shift();
            const children = allCategories.filter((c) => c.parentId === currentId);
            for (const child of children) {
                descendantIds.push(child.id);
                queue.push(child.id);
            }
        }
        return descendantIds;
    }
}
exports.CategoryRepository = CategoryRepository;
//# sourceMappingURL=category.repository.js.map