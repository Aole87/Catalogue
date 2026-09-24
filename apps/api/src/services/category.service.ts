import { CategoryRepository } from '../repositories/category.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '../errors/app-error';

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  parentId: string | null;
  children: CategoryTreeNode[];
}

// In-memory cache for category hierarchy
let cachedActiveTree: CategoryTreeNode[] | null = null;
let cachedActiveTreeExpiry = 0;
let cachedAllTree: CategoryTreeNode[] | null = null;
let cachedAllTreeExpiry = 0;

export class CategoryService {
  static invalidateCache() {
    cachedActiveTree = null;
    cachedActiveTreeExpiry = 0;
    cachedAllTree = null;
    cachedAllTreeExpiry = 0;
  }

  static async getCategoryTree(onlyActive = true): Promise<CategoryTreeNode[]> {
    const now = Date.now();
    if (onlyActive && cachedActiveTree && now < cachedActiveTreeExpiry) {
      return cachedActiveTree;
    }
    if (!onlyActive && cachedAllTree && now < cachedAllTreeExpiry) {
      return cachedAllTree;
    }

    const flatCategories = await CategoryRepository.findAll({ onlyActive });

    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];

    // 1. Initialize tree nodes
    for (const cat of flatCategories) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        parentId: cat.parentId,
        children: [],
      });
    }

    // 2. Build tree relations
    for (const cat of flatCategories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parentNode = categoryMap.get(cat.parentId)!;
        parentNode.children.push(node);
      } else {
        rootCategories.push(node);
      }
    }

    if (onlyActive) {
      cachedActiveTree = rootCategories;
      cachedActiveTreeExpiry = now + 60000;
    } else {
      cachedAllTree = rootCategories;
      cachedAllTreeExpiry = now + 60000;
    }

    return rootCategories;
  }

  static async listCategories(onlyActive = false) {
    return CategoryRepository.findAll({ onlyActive });
  }

  static async getCategoryById(id: string) {
    const category = await CategoryRepository.findById(id);
    if (!category || category.deletedAt) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  static async getCategoryBySlug(slug: string) {
    const category = await CategoryRepository.findBySlug(slug);
    if (!category || category.deletedAt) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }
    return category;
  }

  static async createCategory(
    input: CreateCategoryInput,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    // 1. Verify slug uniqueness
    const existing = await CategoryRepository.findBySlug(input.slug);
    if (existing && !existing.deletedAt) {
      throw new ConflictException(`Category slug '${input.slug}' is already in use`);
    }

    // 2. Verify parent if supplied
    if (input.parentId) {
      const parent = await CategoryRepository.findById(input.parentId);
      if (!parent || parent.deletedAt) {
        throw new BadRequestException(`Parent category with ID ${input.parentId} does not exist`);
      }
    }

    const category = await CategoryRepository.create(input);
    this.invalidateCache();

    // 3. Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'CATEGORY_CREATED',
      resource: 'category',
      resourceId: category.id,
      after: { name: category.name, slug: category.slug, parentId: category.parentId },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return category;
  }

  static async updateCategory(
    id: string,
    input: UpdateCategoryInput,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    const existing = await this.getCategoryById(id);

    // 1. Verify slug collision if slug changed
    if (input.slug && input.slug !== existing.slug) {
      const duplicateSlug = await CategoryRepository.findBySlug(input.slug);
      if (duplicateSlug && duplicateSlug.id !== id && !duplicateSlug.deletedAt) {
        throw new ConflictException(`Category slug '${input.slug}' is already in use`);
      }
    }

    // 2. Verify parent and cycle prevention
    if (input.parentId !== undefined && input.parentId !== null) {
      if (input.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      const parent = await CategoryRepository.findById(input.parentId);
      if (!parent || parent.deletedAt) {
        throw new BadRequestException(`Parent category with ID ${input.parentId} does not exist`);
      }

      // Check if new parent is a descendant of current category
      const descendantIds = await CategoryRepository.getAllDescendantIds(id);
      if (descendantIds.includes(input.parentId)) {
        throw new BadRequestException(
          'Circular hierarchy detected: parent category cannot be a descendant of this category'
        );
      }
    }

    const updated = await CategoryRepository.update(id, input);
    this.invalidateCache();

    // 3. Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'CATEGORY_UPDATED',
      resource: 'category',
      resourceId: updated.id,
      before: { name: existing.name, slug: existing.slug, parentId: existing.parentId },
      after: { name: updated.name, slug: updated.slug, parentId: updated.parentId },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return updated;
  }

  static async deleteCategory(
    id: string,
    metadata?: { userId?: string; ipAddress?: string; userAgent?: string; requestId?: string }
  ) {
    const existing = await this.getCategoryById(id);

    // 1. Safety check: Check for existing active products
    const productCount = await CategoryRepository.countProducts(id);
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete category '${existing.name}' because ${productCount} active product(s) are assigned to it. Reassign products first.`
      );
    }

    // 2. Safety check: Check for child subcategories
    const childCount = await CategoryRepository.countChildren(id);
    if (childCount > 0) {
      throw new ConflictException(
        `Cannot delete category '${existing.name}' because it contains ${childCount} subcategories. Delete or move subcategories first.`
      );
    }

    const deleted = await CategoryRepository.softDelete(id);
    this.invalidateCache();

    // 3. Record Audit Trail
    await AuditRepository.record({
      userId: metadata?.userId,
      action: 'CATEGORY_DELETED',
      resource: 'category',
      resourceId: deleted.id,
      before: { name: existing.name, slug: existing.slug },
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
    });

    return deleted;
  }
}
