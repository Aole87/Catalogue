import { Brand } from '@car-parts/database';
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
export declare class BrandRepository {
    static findById(id: string): Promise<Brand | null>;
    static findBySlug(slug: string): Promise<Brand | null>;
    static findByName(name: string): Promise<Brand | null>;
    static findAll(params?: {
        onlyActive?: boolean;
    }): Promise<Brand[]>;
    static create(data: CreateBrandData): Promise<Brand>;
    static update(id: string, data: UpdateBrandData): Promise<Brand>;
    static softDelete(id: string): Promise<Brand>;
    static countProducts(brandId: string): Promise<number>;
}
