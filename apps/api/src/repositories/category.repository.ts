import { prisma, Category } from '@car-parts/database';

export interface CreateCategoryData {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  parentId?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  'cat-1': 'brakes',
  'cat-2': 'front-brake-pads',
  'cat-3': 'rear-brake-pads',
  'cat-4': 'filters',
  'cat-5': 'oil-filters',
  'cat-6': 'air-filters',
  'cat-7': 'suspension',
  'cat-8': 'engine',
  'cat-9': 'spark-plugs',
  'cat-10': 'fluids',
};

export class CategoryRepository {
  static async findById(id: string): Promise<Category | null> {
    if (!UUID_REGEX.test(id)) {
      const slug = LEGACY_CATEGORY_MAP[id] || id;
      return this.findBySlug(slug);
    }
    return prisma.category.findUnique({
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

  static async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
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

  static async findAll(params: { onlyActive?: boolean } = {}): Promise<Category[]> {
    const where: any = {
      deletedAt: null,
    };

    if (params.onlyActive) {
      where.isActive = true;
    }

    return prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  static async create(data: CreateCategoryData): Promise<Category> {
    return prisma.category.create({
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

  static async update(id: string, data: UpdateCategoryData): Promise<Category> {
    let resolvedId = id;
    if (!UUID_REGEX.test(id)) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Category not found with identifier: ${id}`);
      }
      resolvedId = existing.id;
    }

    return prisma.category.update({
      where: { id: resolvedId },
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

  static async softDelete(id: string): Promise<Category> {
    let resolvedId = id;
    if (!UUID_REGEX.test(id)) {
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error(`Category not found with identifier: ${id}`);
      }
      resolvedId = existing.id;
    }

    return prisma.category.update({
      where: { id: resolvedId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  static async countProducts(categoryId: string): Promise<number> {
    let resolvedId = categoryId;
    if (!UUID_REGEX.test(categoryId)) {
      const existing = await this.findById(categoryId);
      if (!existing) return 0;
      resolvedId = existing.id;
    }

    return prisma.product.count({
      where: {
        categoryId: resolvedId,
        deletedAt: null,
      },
    });
  }

  static async countChildren(categoryId: string): Promise<number> {
    let resolvedId = categoryId;
    if (!UUID_REGEX.test(categoryId)) {
      const existing = await this.findById(categoryId);
      if (!existing) return 0;
      resolvedId = existing.id;
    }

    return prisma.category.count({
      where: {
        parentId: resolvedId,
        deletedAt: null,
      },
    });
  }

  static async getAllDescendantIds(categoryId: string): Promise<string[]> {
    let resolvedId = categoryId;
    if (!UUID_REGEX.test(categoryId)) {
      const existing = await this.findById(categoryId);
      if (!existing) return [];
      resolvedId = existing.id;
    }

    const allCategories = await prisma.category.findMany({
      where: { deletedAt: null },
      select: { id: true, parentId: true },
    });

    const descendantIds: string[] = [];
    const queue = [resolvedId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = allCategories.filter((c) => c.parentId === currentId);
      for (const child of children) {
        descendantIds.push(child.id);
        queue.push(child.id);
      }
    }

    return descendantIds;
  }
}
