import { prisma, Brand } from '@car-parts/database';

export interface CreateBrandData {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateBrandData {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  isActive?: boolean;
}

export class BrandRepository {
  static async findById(id: string): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { id },
    });
  }

  static async findBySlug(slug: string): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { slug },
    });
  }

  static async findByName(name: string): Promise<Brand | null> {
    return prisma.brand.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        deletedAt: null,
      },
    });
  }

  static async findAll(params: { onlyActive?: boolean } = {}): Promise<Brand[]> {
    const where: any = {
      deletedAt: null,
    };

    if (params.onlyActive) {
      where.isActive = true;
    }

    return prisma.brand.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  static async create(data: CreateBrandData): Promise<Brand> {
    return prisma.brand.create({
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

  static async update(id: string, data: UpdateBrandData): Promise<Brand> {
    return prisma.brand.update({
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

  static async softDelete(id: string): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  static async countProducts(brandId: string): Promise<number> {
    return prisma.product.count({
      where: {
        brandId,
        deletedAt: null,
      },
    });
  }
}
