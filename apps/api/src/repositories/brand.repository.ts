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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LEGACY_BRAND_MAP: Record<string, string> = {
  'brand-1': 'trw',
  'brand-2': 'bosch',
  'brand-3': 'brembo',
  'brand-4': 'denso',
  'brand-5': 'aisin',
  'brand-6': 'mann-filter',
  'brand-7': 'mobil1',
  'brand-8': 'motul',
  'brand-9': 'castrol',
};

export class BrandRepository {
  static async findById(id: string): Promise<Brand | null> {
    if (!UUID_REGEX.test(id)) {
      const slug = LEGACY_BRAND_MAP[id] || id;
      return this.findBySlug(slug);
    }
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
    let resolvedId = id;
    if (!UUID_REGEX.test(id)) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Brand not found with identifier: ${id}`);
      }
      resolvedId = existing.id;
    }

    return prisma.brand.update({
      where: { id: resolvedId },
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
    let resolvedId = id;
    if (!UUID_REGEX.test(id)) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Brand not found with identifier: ${id}`);
      }
      resolvedId = existing.id;
    }

    return prisma.brand.update({
      where: { id: resolvedId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  static async countProducts(brandId: string): Promise<number> {
    let resolvedId = brandId;
    if (!UUID_REGEX.test(brandId)) {
      const existing = await this.findById(brandId);
      if (!existing) return 0;
      resolvedId = existing.id;
    }

    return prisma.product.count({
      where: {
        brandId: resolvedId,
        deletedAt: null,
      },
    });
  }
}
