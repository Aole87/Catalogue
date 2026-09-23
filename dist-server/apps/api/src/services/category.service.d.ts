import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema';
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
export declare class CategoryService {
    static getCategoryTree(onlyActive?: boolean): Promise<CategoryTreeNode[]>;
    static listCategories(onlyActive?: boolean): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        parentId: string | null;
        imageUrl: string | null;
        sortOrder: number;
    }[]>;
    static getCategoryById(id: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        parentId: string | null;
        imageUrl: string | null;
        sortOrder: number;
    }>;
    static getCategoryBySlug(slug: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        parentId: string | null;
        imageUrl: string | null;
        sortOrder: number;
    }>;
    static createCategory(input: CreateCategoryInput, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        parentId: string | null;
        imageUrl: string | null;
        sortOrder: number;
    }>;
    static updateCategory(id: string, input: UpdateCategoryInput, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        parentId: string | null;
        imageUrl: string | null;
        sortOrder: number;
    }>;
    static deleteCategory(id: string, metadata?: {
        userId?: string;
        ipAddress?: string;
        userAgent?: string;
        requestId?: string;
    }): Promise<{
        description: string | null;
        name: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        slug: string;
        parentId: string | null;
        imageUrl: string | null;
        sortOrder: number;
    }>;
}
