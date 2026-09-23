import { Category } from '@car-parts/database';
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
export declare class CategoryRepository {
    static findById(id: string): Promise<Category | null>;
    static findBySlug(slug: string): Promise<Category | null>;
    static findAll(params?: {
        onlyActive?: boolean;
    }): Promise<Category[]>;
    static create(data: CreateCategoryData): Promise<Category>;
    static update(id: string, data: UpdateCategoryData): Promise<Category>;
    static softDelete(id: string): Promise<Category>;
    static countProducts(categoryId: string): Promise<number>;
    static countChildren(categoryId: string): Promise<number>;
    static getAllDescendantIds(categoryId: string): Promise<string[]>;
}
