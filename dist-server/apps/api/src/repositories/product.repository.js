"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = exports.productDetailInclude = void 0;
const database_1 = require("@car-parts/database");
exports.productDetailInclude = {
    brand: {
        select: { id: true, name: true, slug: true, logoUrl: true },
    },
    category: {
        select: { id: true, name: true, slug: true, parentId: true },
    },
    prices: {
        where: { isActive: true },
        select: {
            id: true,
            tier: true,
            price: true,
            compareAtPrice: true,
            costPrice: true,
            currency: true,
            isActive: true,
        },
    },
    images: {
        orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
        select: {
            id: true,
            url: true,
            altText: true,
            sortOrder: true,
            isPrimary: true,
        },
    },
    attributeValues: {
        select: {
            id: true,
            value: true,
            attribute: {
                select: { id: true, name: true, code: true, unit: true },
            },
        },
    },
    crossReferences: {
        select: {
            id: true,
            referenceType: true,
            referenceNumber: true,
            notes: true,
            brand: {
                select: { id: true, name: true, slug: true },
            },
        },
    },
};
class ProductRepository {
    static buildWhereClause(filters) {
        const where = {};
        if (!filters.includeDeleted) {
            where.deletedAt = null;
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.isPublished !== undefined) {
            where.isPublished = filters.isPublished;
        }
        if (filters.categoryIds && filters.categoryIds.length > 0) {
            where.categoryId = { in: filters.categoryIds };
        }
        else if (filters.categoryId) {
            where.categoryId = filters.categoryId;
        }
        if (filters.brandId) {
            where.brandId = filters.brandId;
        }
        if (filters.vehicleVariantId) {
            where.fitments = {
                some: {
                    vehicleVariantId: filters.vehicleVariantId,
                    fitmentStatus: database_1.FitmentStatus.COMPATIBLE,
                },
            };
        }
        // Price range filtering on GENERAL tier
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            const priceFilter = {
                some: {
                    tier: database_1.PriceTier.GENERAL,
                    isActive: true,
                    ...(filters.minPrice !== undefined ? { price: { gte: filters.minPrice } } : {}),
                    ...(filters.maxPrice !== undefined ? { price: { lte: filters.maxPrice } } : {}),
                },
            };
            where.prices = priceFilter;
        }
        // Keyword search across multiple fields
        if (filters.search && filters.search.trim() !== '') {
            const searchTerm = filters.search.trim();
            where.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { sku: { contains: searchTerm, mode: 'insensitive' } },
                { slug: { contains: searchTerm, mode: 'insensitive' } },
                { barcode: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { shortDescription: { contains: searchTerm, mode: 'insensitive' } },
                { brand: { name: { contains: searchTerm, mode: 'insensitive' } } },
                { category: { name: { contains: searchTerm, mode: 'insensitive' } } },
                {
                    crossReferences: {
                        some: {
                            referenceNumber: { contains: searchTerm, mode: 'insensitive' },
                        },
                    },
                },
            ];
        }
        return where;
    }
    static async findById(id, includeRelations = true) {
        return database_1.prisma.product.findUnique({
            where: { id },
            ...(includeRelations ? { include: exports.productDetailInclude } : {}),
        });
    }
    static async findBySlug(slug, includeRelations = true) {
        return database_1.prisma.product.findUnique({
            where: { slug },
            ...(includeRelations ? { include: exports.productDetailInclude } : {}),
        });
    }
    static async findBySku(sku) {
        return database_1.prisma.product.findUnique({
            where: { sku },
        });
    }
    static async findMany(filters) {
        const page = Math.max(1, filters.page || 1);
        const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));
        const skip = (page - 1) * pageSize;
        const where = this.buildWhereClause(filters);
        let orderBy = { createdAt: 'desc' };
        const sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';
        if (filters.sortBy === 'name') {
            orderBy = { name: sortOrder };
        }
        else if (filters.sortBy === 'sku') {
            orderBy = { sku: sortOrder };
        }
        else if (filters.sortBy === 'updatedAt') {
            orderBy = { updatedAt: sortOrder };
        }
        else if (filters.sortBy === 'createdAt') {
            orderBy = { createdAt: sortOrder };
        }
        const items = await database_1.prisma.product.findMany({
            where,
            skip,
            take: pageSize,
            orderBy,
            include: exports.productDetailInclude,
        });
        const total = await database_1.prisma.product.count({ where });
        return {
            items,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }
    static async count(filters) {
        const where = this.buildWhereClause(filters);
        return database_1.prisma.product.count({ where });
    }
    static async create(data) {
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Create main Product row
            const product = await tx.product.create({
                data: {
                    sku: data.sku,
                    slug: data.slug,
                    name: data.name,
                    shortDescription: data.shortDescription,
                    description: data.description,
                    brandId: data.brandId,
                    categoryId: data.categoryId,
                    barcode: data.barcode,
                    warrantyText: data.warrantyText,
                    weightGrams: data.weightGrams,
                    lengthMm: data.lengthMm,
                    widthMm: data.widthMm,
                    heightMm: data.heightMm,
                    isActive: data.isActive ?? true,
                    isPublished: data.isPublished ?? true,
                },
            });
            // 2. Insert Pricing Tiers
            if (data.prices && data.prices.length > 0) {
                for (const p of data.prices) {
                    await tx.productPrice.create({
                        data: {
                            productId: product.id,
                            tier: p.tier,
                            price: new database_1.Prisma.Decimal(p.price.toString()),
                            compareAtPrice: p.compareAtPrice ? new database_1.Prisma.Decimal(p.compareAtPrice.toString()) : null,
                            costPrice: p.costPrice ? new database_1.Prisma.Decimal(p.costPrice.toString()) : null,
                            currency: p.currency || 'THB',
                            isActive: true,
                        },
                    });
                }
            }
            // 3. Insert Images
            if (data.images && data.images.length > 0) {
                for (let i = 0; i < data.images.length; i++) {
                    const img = data.images[i];
                    await tx.productImage.create({
                        data: {
                            productId: product.id,
                            url: img.url,
                            altText: img.altText,
                            sortOrder: img.sortOrder ?? i,
                            isPrimary: img.isPrimary ?? (i === 0),
                        },
                    });
                }
            }
            // 4. Insert Attributes
            if (data.attributes && data.attributes.length > 0) {
                for (const attr of data.attributes) {
                    await tx.productAttributeValue.create({
                        data: {
                            productId: product.id,
                            attributeId: attr.attributeId,
                            value: attr.value,
                        },
                    });
                }
            }
            // 5. Insert Cross References
            if (data.crossReferences && data.crossReferences.length > 0) {
                for (const cr of data.crossReferences) {
                    await tx.productCrossReference.create({
                        data: {
                            productId: product.id,
                            referenceType: cr.referenceType,
                            referenceNumber: cr.referenceNumber,
                            brandId: cr.brandId || null,
                            notes: cr.notes,
                        },
                    });
                }
            }
            return tx.product.findUnique({
                where: { id: product.id },
                include: exports.productDetailInclude,
            });
        });
    }
    static async update(id, data) {
        return database_1.prisma.$transaction(async (tx) => {
            // 1. Update master Product fields
            await tx.product.update({
                where: { id },
                data: {
                    ...(data.sku !== undefined ? { sku: data.sku } : {}),
                    ...(data.slug !== undefined ? { slug: data.slug } : {}),
                    ...(data.name !== undefined ? { name: data.name } : {}),
                    ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription } : {}),
                    ...(data.description !== undefined ? { description: data.description } : {}),
                    ...(data.brandId !== undefined ? { brandId: data.brandId } : {}),
                    ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
                    ...(data.barcode !== undefined ? { barcode: data.barcode } : {}),
                    ...(data.warrantyText !== undefined ? { warrantyText: data.warrantyText } : {}),
                    ...(data.weightGrams !== undefined ? { weightGrams: data.weightGrams } : {}),
                    ...(data.lengthMm !== undefined ? { lengthMm: data.lengthMm } : {}),
                    ...(data.widthMm !== undefined ? { widthMm: data.widthMm } : {}),
                    ...(data.heightMm !== undefined ? { heightMm: data.heightMm } : {}),
                    ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
                    ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
                },
            });
            // 2. Update Prices if provided
            if (data.prices !== undefined) {
                for (const p of data.prices) {
                    await tx.productPrice.upsert({
                        where: {
                            productId_tier: {
                                productId: id,
                                tier: p.tier,
                            },
                        },
                        update: {
                            price: new database_1.Prisma.Decimal(p.price.toString()),
                            compareAtPrice: p.compareAtPrice ? new database_1.Prisma.Decimal(p.compareAtPrice.toString()) : null,
                            costPrice: p.costPrice ? new database_1.Prisma.Decimal(p.costPrice.toString()) : null,
                            currency: p.currency || 'THB',
                            isActive: true,
                        },
                        create: {
                            productId: id,
                            tier: p.tier,
                            price: new database_1.Prisma.Decimal(p.price.toString()),
                            compareAtPrice: p.compareAtPrice ? new database_1.Prisma.Decimal(p.compareAtPrice.toString()) : null,
                            costPrice: p.costPrice ? new database_1.Prisma.Decimal(p.costPrice.toString()) : null,
                            currency: p.currency || 'THB',
                            isActive: true,
                        },
                    });
                }
            }
            // 3. Update Images if provided (replace strategy for simplicity and consistency)
            if (data.images !== undefined) {
                await tx.productImage.deleteMany({ where: { productId: id } });
                for (let i = 0; i < data.images.length; i++) {
                    const img = data.images[i];
                    await tx.productImage.create({
                        data: {
                            productId: id,
                            url: img.url,
                            altText: img.altText,
                            sortOrder: img.sortOrder ?? i,
                            isPrimary: img.isPrimary ?? (i === 0),
                        },
                    });
                }
            }
            // 4. Update Attributes if provided
            if (data.attributes !== undefined) {
                await tx.productAttributeValue.deleteMany({ where: { productId: id } });
                for (const attr of data.attributes) {
                    await tx.productAttributeValue.create({
                        data: {
                            productId: id,
                            attributeId: attr.attributeId,
                            value: attr.value,
                        },
                    });
                }
            }
            // 5. Update Cross References if provided
            if (data.crossReferences !== undefined) {
                await tx.productCrossReference.deleteMany({ where: { productId: id } });
                for (const cr of data.crossReferences) {
                    await tx.productCrossReference.create({
                        data: {
                            productId: id,
                            referenceType: cr.referenceType,
                            referenceNumber: cr.referenceNumber,
                            brandId: cr.brandId || null,
                            notes: cr.notes,
                        },
                    });
                }
            }
            return tx.product.findUnique({
                where: { id },
                include: exports.productDetailInclude,
            });
        });
    }
    static async softDelete(id) {
        return database_1.prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                isActive: false,
                isPublished: false,
            },
        });
    }
    static async updatePrice(productId, tier, price, compareAtPrice, costPrice) {
        return database_1.prisma.productPrice.upsert({
            where: {
                productId_tier: {
                    productId,
                    tier,
                },
            },
            update: {
                price: new database_1.Prisma.Decimal(price.toString()),
                compareAtPrice: compareAtPrice ? new database_1.Prisma.Decimal(compareAtPrice.toString()) : null,
                costPrice: costPrice ? new database_1.Prisma.Decimal(costPrice.toString()) : null,
                isActive: true,
            },
            create: {
                productId,
                tier,
                price: new database_1.Prisma.Decimal(price.toString()),
                compareAtPrice: compareAtPrice ? new database_1.Prisma.Decimal(compareAtPrice.toString()) : null,
                costPrice: costPrice ? new database_1.Prisma.Decimal(costPrice.toString()) : null,
                isActive: true,
            },
        });
    }
}
exports.ProductRepository = ProductRepository;
//# sourceMappingURL=product.repository.js.map