import { prisma, Product, PriceTier, ProductReferenceType, FitmentStatus, Prisma } from '@car-parts/database';

export interface ProductQueryFilters {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  categoryIds?: string[];
  brandId?: string;
  vehicleVariantId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt' | 'sku';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  isPublished?: boolean;
  includeDeleted?: boolean;
}

export interface CreateProductPriceInput {
  tier: PriceTier;
  price: number | string | Prisma.Decimal;
  compareAtPrice?: number | string | Prisma.Decimal | null;
  costPrice?: number | string | Prisma.Decimal | null;
  currency?: string;
}

export interface CreateProductImageInput {
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface CreateProductAttributeInput {
  attributeId: string;
  value: string;
}

export interface CreateProductCrossReferenceInput {
  referenceType: ProductReferenceType;
  referenceNumber: string;
  brandId?: string | null;
  notes?: string | null;
}

export interface CreateProductData {
  sku: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  brandId: string;
  categoryId: string;
  barcode?: string | null;
  warrantyText?: string | null;
  weightGrams?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  isActive?: boolean;
  isPublished?: boolean;
  prices?: CreateProductPriceInput[];
  images?: CreateProductImageInput[];
  attributes?: CreateProductAttributeInput[];
  crossReferences?: CreateProductCrossReferenceInput[];
}

export interface UpdateProductData {
  sku?: string;
  slug?: string;
  name?: string;
  shortDescription?: string | null;
  description?: string | null;
  brandId?: string;
  categoryId?: string;
  barcode?: string | null;
  warrantyText?: string | null;
  weightGrams?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
  isActive?: boolean;
  isPublished?: boolean;
  prices?: CreateProductPriceInput[];
  images?: CreateProductImageInput[];
  attributes?: CreateProductAttributeInput[];
  crossReferences?: CreateProductCrossReferenceInput[];
}

export const productDetailInclude = {
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
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
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

export class ProductRepository {
  private static buildWhereClause(filters: ProductQueryFilters): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {};

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
    } else if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.brandId) {
      where.brandId = filters.brandId;
    }

    if (filters.vehicleVariantId) {
      where.fitments = {
        some: {
          vehicleVariantId: filters.vehicleVariantId,
          fitmentStatus: FitmentStatus.COMPATIBLE,
        },
      };
    }

    // Price range filtering on GENERAL tier
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceFilter: Prisma.ProductPriceListRelationFilter = {
        some: {
          tier: PriceTier.GENERAL,
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

  static async findById(id: string, includeRelations = true) {
    return prisma.product.findUnique({
      where: { id },
      ...(includeRelations ? { include: productDetailInclude } : {}),
    });
  }

  static async findBySlug(slug: string, includeRelations = true) {
    return prisma.product.findUnique({
      where: { slug },
      ...(includeRelations ? { include: productDetailInclude } : {}),
    });
  }

  static async findBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
    });
  }

  static async findMany(filters: ProductQueryFilters) {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(filters);

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    const sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';

    if (filters.sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (filters.sortBy === 'sku') {
      orderBy = { sku: sortOrder };
    } else if (filters.sortBy === 'updatedAt') {
      orderBy = { updatedAt: sortOrder };
    } else if (filters.sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder };
    }

    const items = await prisma.product.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include: productDetailInclude,
    });

    const total = await prisma.product.count({ where });

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

  static async count(filters: ProductQueryFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return prisma.product.count({ where });
  }

  static async create(data: CreateProductData) {
    return prisma.$transaction(async (tx) => {
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
              price: new Prisma.Decimal(p.price.toString()),
              compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice.toString()) : null,
              costPrice: p.costPrice ? new Prisma.Decimal(p.costPrice.toString()) : null,
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
        include: productDetailInclude,
      });
    });
  }

  static async update(id: string, data: UpdateProductData) {
    return prisma.$transaction(async (tx) => {
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
              price: new Prisma.Decimal(p.price.toString()),
              compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice.toString()) : null,
              costPrice: p.costPrice ? new Prisma.Decimal(p.costPrice.toString()) : null,
              currency: p.currency || 'THB',
              isActive: true,
            },
            create: {
              productId: id,
              tier: p.tier,
              price: new Prisma.Decimal(p.price.toString()),
              compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice.toString()) : null,
              costPrice: p.costPrice ? new Prisma.Decimal(p.costPrice.toString()) : null,
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
        include: productDetailInclude,
      });
    });
  }

  static async softDelete(id: string) {
    return prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        isPublished: false,
      },
    });
  }

  static async updatePrice(
    productId: string,
    tier: PriceTier,
    price: number | string | Prisma.Decimal,
    compareAtPrice?: number | string | Prisma.Decimal | null,
    costPrice?: number | string | Prisma.Decimal | null
  ) {
    return prisma.productPrice.upsert({
      where: {
        productId_tier: {
          productId,
          tier,
        },
      },
      update: {
        price: new Prisma.Decimal(price.toString()),
        compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice.toString()) : null,
        costPrice: costPrice ? new Prisma.Decimal(costPrice.toString()) : null,
        isActive: true,
      },
      create: {
        productId,
        tier,
        price: new Prisma.Decimal(price.toString()),
        compareAtPrice: compareAtPrice ? new Prisma.Decimal(compareAtPrice.toString()) : null,
        costPrice: costPrice ? new Prisma.Decimal(costPrice.toString()) : null,
        isActive: true,
      },
    });
  }
}
